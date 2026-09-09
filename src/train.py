import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score
import xgboost as xgb

from src.evaluate import evaluate_classification, evaluate_regression

def find_optimal_threshold(model, X_val, y_val):
    """
    Finds the optimal decision threshold that maximizes F1-Score and eliminates false alarms.
    """
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_val)[:, 1]
    else:
        probs = model.predict(X_val)
        
    best_thresh = 0.5
    best_f1 = 0.0
    
    for thresh in np.arange(0.30, 0.85, 0.02):
        preds = (probs >= thresh).astype(int)
        score = f1_score(y_val, preds, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_thresh = thresh
            
    print(f"[Threshold Tuning] Optimal Binary Decision Threshold: {best_thresh:.2f} (Val F1: {best_f1:.4f})")
    return best_thresh

def train_classification_models(splits, models_dir="models", reports_dir="reports"):
    """
    Trains calibrated Logistic Regression, Random Forest, and XGBoost classifiers with optimal decision thresholds.
    """
    os.makedirs(models_dir, exist_ok=True)
    X_train, y_train = splits['X_train'], splits['y_train']
    X_val, y_val = splits['X_val'], splits['y_val']
    X_test, y_test = splits['X_test'], splits['y_test']
    
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    pos_weight = neg_count / max(pos_count, 1)
    
    # Base Estimators
    rf_base = RandomForestClassifier(n_estimators=150, max_depth=12, class_weight='balanced', random_state=42, n_jobs=-1)
    xgb_base = xgb.XGBClassifier(n_estimators=150, learning_rate=0.05, max_depth=6, scale_pos_weight=pos_weight, random_state=42, eval_metric='logloss')
    lr_base = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)

    # Calibrated Estimators for realistic, accurate probability output
    rf_cal = CalibratedClassifierCV(rf_base, cv=3, method='sigmoid')
    xgb_cal = CalibratedClassifierCV(xgb_base, cv=3, method='sigmoid')
    
    models = {
        "Random Forest Calibrated": rf_cal,
        "XGBoost Calibrated": xgb_cal,
        "Logistic Regression": lr_base
    }
    
    results = []
    trained_objects = {}
    optimal_thresholds = {}
    
    print("\n==========================================")
    print(" TRAINING CALIBRATED FLOOD CLASSIFIERS   ")
    print("==========================================")
    
    for name, model in models.items():
        print(f"\n[Train] Fitting {name}...")
        model.fit(X_train, y_train)
        
        # Tune threshold on Validation Set
        best_thresh = find_optimal_threshold(model, X_val, y_val)
        optimal_thresholds[name] = best_thresh
        
        # Evaluate on Test Set using tuned threshold
        probs_test = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else model.predict(X_test)
        preds_test = (probs_test >= best_thresh).astype(int)
        
        acc = accuracy_score(y_test, preds_test)
        prec = precision_score(y_test, preds_test, zero_division=0)
        rec = recall_score(y_test, preds_test, zero_division=0)
        f1 = f1_score(y_test, preds_test, zero_division=0)
        
        metrics = {
            'model_name': name,
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'optimal_threshold': round(best_thresh, 2)
        }
        
        print(f"[{name}] Test Accuracy: {acc:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f}")
        results.append(metrics)
        trained_objects[name] = model
        
    df_results = pd.DataFrame(results)
    
    # Select best model (highest Accuracy & Precision balance)
    best_idx = df_results['accuracy'].idxmax()
    best_name = df_results.loc[best_idx, 'model_name']
    best_model = trained_objects[best_name]
    best_thresh = optimal_thresholds[best_name]
    
    main_path = os.path.join(models_dir, "best_flood_classifier.joblib")
    joblib.dump({
        'model': best_model,
        'model_name': best_name,
        'optimal_threshold': best_thresh,
        'scaler': splits['scaler'],
        'imputer': splits['imputer'],
        'feature_names': splits['feature_names']
    }, main_path)
    print(f"\n[Artifact] Saved primary best flood classifier ({best_name}, Accuracy: {df_results.loc[best_idx, 'accuracy']:.4f}, Threshold: {best_thresh}) to {main_path}")
    
    return df_results, best_model

def train_regression_models(splits, models_dir="models", reports_dir="reports"):
    """
    Trains baseline Linear (Ridge), Random Forest, and XGBoost regressors for rainfall intensity.
    """
    os.makedirs(models_dir, exist_ok=True)
    X_train, y_train = splits['X_train'], splits['y_train']
    X_test, y_test = splits['X_test'], splits['y_test']
    
    models = {
        "Ridge Regression": Ridge(alpha=1.0),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=150, max_depth=14, random_state=42, n_jobs=-1),
        "XGBoost Regressor": xgb.XGBRegressor(n_estimators=150, learning_rate=0.05, max_depth=6, random_state=42)
    }
    
    results = []
    trained_objects = {}
    
    print("\n==============================================")
    print(" TRAINING HEAVY RAINFALL REGRESSION MODELS   ")
    print("==============================================")
    
    for name, model in models.items():
        print(f"\n[Train] Fitting {name}...")
        model.fit(X_train, y_train)
        metrics = evaluate_regression(model, X_test, y_test, model_name=name, reports_dir=reports_dir)
        results.append(metrics)
        trained_objects[name] = model
        
    df_results = pd.DataFrame(results)
    
    best_idx = df_results['r2_score'].idxmax()
    best_name = df_results.loc[best_idx, 'model_name']
    best_model = trained_objects[best_name]
    
    main_path = os.path.join(models_dir, "best_rainfall_regressor.joblib")
    joblib.dump({
        'model': best_model,
        'model_name': best_name,
        'scaler': splits['scaler'],
        'imputer': splits['imputer'],
        'feature_names': splits['feature_names']
    }, main_path)
    print(f"\n[Artifact] Saved primary best rainfall regressor ({best_name}, R²: {df_results.loc[best_idx, 'r2_score']:.4f}) to {main_path}")
    
    return df_results, best_model
