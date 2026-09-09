import os
import joblib
import pandas as pd
import numpy as np

from src.data_loader import load_master_dataset
from src.feature_engineering import add_engineered_features

def verify_model_correctness(period_filter="2026_06"):
    print("==================================================================")
    print(f" VERIFYING MODEL PREDICTIONS VS SATELLITE GROUND TRUTH ({period_filter})")
    print("==================================================================")

    clf_path = os.path.join("models", "best_flood_classifier.joblib")
    reg_path = os.path.join("models", "best_rainfall_regressor.joblib")

    if not os.path.exists(clf_path) or not os.path.exists(reg_path):
        print("Error: Model files missing in models/ directory. Run 'python run_pipeline.py' first.")
        return

    clf_bundle = joblib.load(clf_path)
    reg_bundle = joblib.load(reg_path)

    clf_model, clf_scaler, clf_imputer, clf_features = (
        clf_bundle['model'], clf_bundle['scaler'], clf_bundle['imputer'], clf_bundle['feature_names']
    )
    optimal_thresh = clf_bundle.get('optimal_threshold', 0.70)

    reg_model, reg_scaler, reg_imputer, reg_features = (
        reg_bundle['model'], reg_bundle['scaler'], reg_bundle['imputer'], reg_bundle['feature_names']
    )

    df_raw = load_master_dataset()
    df = add_engineered_features(df_raw)

    period_df = df[df['timeperiod'] == period_filter].copy()

    # Predict
    X_clf_imp = pd.DataFrame(clf_imputer.transform(period_df[clf_features]), columns=clf_features, index=period_df.index)
    X_clf_scaled = pd.DataFrame(clf_scaler.transform(X_clf_imp), columns=clf_features, index=period_df.index)
    flood_probs = clf_model.predict_proba(X_clf_scaled)[:, 1]

    X_reg_imp = pd.DataFrame(reg_imputer.transform(period_df[reg_features]), columns=reg_features, index=period_df.index)
    X_reg_scaled = pd.DataFrame(reg_scaler.transform(X_reg_imp), columns=reg_features, index=period_df.index)
    rain_preds = reg_model.predict(X_reg_scaled)

    # Verification Dataframe using calibrated threshold
    verify_df = pd.DataFrame({
        'revenue_circle': period_df['revenue_circle'],
        'district': period_df['district'],
        'actual_flood_ground_truth': period_df['flood_occurred'].values,
        'predicted_flood_prob_%': (flood_probs * 100).round(2),
        'predicted_flood_occurred': (flood_probs >= optimal_thresh).astype(int),
        'actual_rainfall_mm': period_df['rainfall_monthly_sum_mm'].round(1).values,
        'predicted_rainfall_mm': rain_preds.round(1),
        'rainfall_error_mm': abs(period_df['rainfall_monthly_sum_mm'] - rain_preds).round(1)
    })

    verify_df['flood_prediction_status'] = np.where(
        verify_df['actual_flood_ground_truth'] == verify_df['predicted_flood_occurred'],
        'CORRECT', 'INCORRECT'
    )

    correct_count = (verify_df['flood_prediction_status'] == 'CORRECT').sum()
    total_count = len(verify_df)
    accuracy_pct = (correct_count / total_count) * 100

    actual_floods = (verify_df['actual_flood_ground_truth'] == 1).sum()
    true_positives = ((verify_df['actual_flood_ground_truth'] == 1) & (verify_df['predicted_flood_occurred'] == 1)).sum()
    false_negatives = ((verify_df['actual_flood_ground_truth'] == 1) & (verify_df['predicted_flood_occurred'] == 0)).sum()
    catch_rate = (true_positives / max(actual_floods, 1)) * 100

    mean_rain_error = verify_df['rainfall_error_mm'].mean()

    print(f"\n--- VERIFICATION SUMMARY FOR PERIOD {period_filter} ---")
    print(f"Optimal Calibrated Threshold     : {optimal_thresh:.2f} ({optimal_thresh*100:.0f}%)")
    print(f"Total Circles Tested             : {total_count}")
    print(f"Correct Classification Match     : {correct_count} / {total_count} ({accuracy_pct:.2f}% Match Rate)")
    print(f"Actual Satellite Floods Recorded : {actual_floods}")
    print(f"Floods Correctly Caught (TP)     : {true_positives} / {actual_floods} ({catch_rate:.2f}% Catch Rate)")
    print(f"Missed Floods (FN)               : {false_negatives}")
    print(f"Average Rainfall Error           : ±{mean_rain_error:.2f} mm")

    os.makedirs("reports", exist_ok=True)
    out_csv = os.path.join("reports", f"verification_report_{period_filter}.csv")
    verify_df.to_csv(out_csv, index=False)
    print(f"\n[Exported] Detailed circle-by-circle verification report saved to: {out_csv}")

    print("\nSample Verification Rows:")
    print(verify_df.head(10).to_string(index=False))

if __name__ == "__main__":
    verify_model_correctness("2026_06")
