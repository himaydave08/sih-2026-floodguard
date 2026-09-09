import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, mean_squared_error, mean_absolute_error, r2_score
)

# Set elegant plotting style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

def evaluate_classification(model, X_test, y_test, model_name="Model", reports_dir="reports"):
    """
    Evaluates classification model performance and saves metrics & confusion matrix plot.
    """
    os.makedirs(reports_dir, exist_ok=True)
    
    y_pred = model.predict(X_test)
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
    else:
        y_prob = y_pred
        
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    try:
        auc = roc_auc_score(y_test, y_prob)
    except Exception:
        auc = 0.5

    metrics = {
        'model_name': model_name,
        'accuracy': round(acc, 4),
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1_score': round(f1, 4),
        'roc_auc': round(auc, 4)
    }
    
    print(f"\n--- Evaluation Results [{model_name}] ---")
    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f} (Priority for Flood Early Warning)")
    print(f"F1-Score : {f1:.4f}")
    print(f"ROC-AUC  : {auc:.4f}")
    
    # Plot Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
                xticklabels=['No Flood', 'Flood'], yticklabels=['No Flood', 'Flood'])
    plt.title(f'Confusion Matrix - {model_name}', fontsize=14, fontweight='bold', pad=12)
    plt.xlabel('Predicted Label', fontweight='bold')
    plt.ylabel('Actual Ground Truth', fontweight='bold')
    plt.tight_layout()
    cm_path = os.path.join(reports_dir, f"cm_{model_name.lower().replace(' ', '_')}.png")
    plt.savefig(cm_path, dpi=300)
    plt.close()
    
    return metrics

def evaluate_regression(model, X_test, y_test, model_name="Model", reports_dir="reports"):
    """
    Evaluates regression model performance (Rainfall Intensity).
    """
    os.makedirs(reports_dir, exist_ok=True)
    
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    metrics = {
        'model_name': model_name,
        'rmse': round(rmse, 4),
        'mae': round(mae, 4),
        'r2_score': round(r2, 4)
    }
    
    print(f"\n--- Regression Results [{model_name}] ---")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE : {mae:.4f}")
    print(f"R²  : {r2:.4f}")
    
    # Plot Actual vs Predicted
    plt.figure(figsize=(7, 5))
    plt.scatter(y_test, y_pred, alpha=0.3, color='#1f77b4', edgecolors='none', s=20)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2, label='Perfect 1:1 Line')
    plt.title(f'Actual vs Predicted Rainfall (mm) - {model_name}', fontsize=13, fontweight='bold')
    plt.xlabel('Actual Monthly Rainfall (mm)', fontweight='bold')
    plt.ylabel('Predicted Monthly Rainfall (mm)', fontweight='bold')
    plt.legend()
    plt.tight_layout()
    reg_path = os.path.join(reports_dir, f"reg_{model_name.lower().replace(' ', '_')}.png")
    plt.savefig(reg_path, dpi=300)
    plt.close()
    
    return metrics

def generate_eda_plots(df, reports_dir="reports"):
    """
    Generates core Exploratory Data Analysis (EDA) visualizations.
    """
    os.makedirs(reports_dir, exist_ok=True)
    
    # 1. Rainfall Distribution & Monthly Trend
    plt.figure(figsize=(10, 5))
    sns.boxplot(data=df, x='month', y='rainfall_monthly_sum_mm', palette='viridis')
    plt.title('Monthly Rainfall Distribution in Assam (2015–2026)', fontsize=14, fontweight='bold')
    plt.xlabel('Month (1=Jan, 12=Dec)', fontweight='bold')
    plt.ylabel('Monthly Rainfall Sum (mm)', fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, 'rainfall_monthly_distribution.png'), dpi=300)
    plt.close()
    
    # 2. Flood Occurrence Class Balance
    plt.figure(figsize=(6, 5))
    ax = sns.countplot(data=df, x='flood_occurred', palette=['#2ca02c', '#d62728'])
    plt.title('Flood Event Occurrence Class Balance', fontsize=14, fontweight='bold')
    plt.xticks([0, 1], ['No Flood (0)', 'Flood Event (1)'])
    plt.xlabel('Flood Status', fontweight='bold')
    plt.ylabel('Sample Count', fontweight='bold')
    for p in ax.patches:
        ax.annotate(f'{int(p.get_height())}\n({p.get_height()/len(df):.1%})',
                    (p.get_x() + p.get_width() / 2., p.get_height() / 2),
                    ha='center', va='center', fontsize=11, color='white', fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, 'flood_class_balance.png'), dpi=300)
    plt.close()
    
    # 3. Key Feature Correlation Heatmap
    corr_cols = [
        'rainfall_monthly_sum_mm', 'rainfall_max_daily_mm', 'river_water_level_m',
        'terrain_elevation_mean', 'soil_clay_pct_mean', 'inundation_pct', 'flood_occurred'
    ]
    avail_corr = [c for c in corr_cols if c in df.columns]
    plt.figure(figsize=(8, 6))
    sns.heatmap(df[avail_corr].corr(), annot=True, fmt='.2f', cmap='Blues', square=True, linewidths=0.5)
    plt.title('Feature Correlation Matrix', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, 'correlation_heatmap.png'), dpi=300)
    plt.close()
    
    print(f"[EDA] EDA plots successfully saved to {reports_dir}/")
