"""
Run Live AI/ML Inference Runner for Assam Heavy Rainfall & Flood Prediction (SIH26071)
Executes model inference across all 180 Revenue Circles of Assam using the trained models.
"""

import sys
import os
import json
import pandas as pd

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from main import simulate_storm, SimulationRequest, get_state_summary

def run_model_inference():
    print("=" * 80)
    print(" RUNNING LIVE AI/ML FLOOD PREDICTION MODEL FOR ASSAM (180 REVENUE CIRCLES)")
    print("=" * 80)

    # 1. Normal Rainfall Run
    print("\n--- 1. Baseline Rainfall Scenario (Normal Monsoon) ---")
    req_normal = SimulationRequest(severity_multiplier=1.0, use_live_weather=False)
    res_normal = simulate_storm(req_normal)
    sims_normal = res_normal["simulation"]

    # 2. Extreme Storm Multiplier Run (2.5x Heavy Rain Scenario)
    print("\n--- 2. Extreme Storm Scenario (2.5x Heavy Rainfall & River Surge) ---")
    req_extreme = SimulationRequest(severity_multiplier=2.5, use_live_weather=False)
    res_extreme = simulate_storm(req_extreme)
    sims_extreme = res_extreme["simulation"]

    # Calculate summary metrics
    df_res = pd.DataFrame(sims_extreme)
    
    print(f"\nTotal Revenue Circles Evaluated: {len(sims_extreme)}")
    print("\nFlood Severity Risk Level Breakdown (Extreme Scenario):")
    risk_counts = df_res["risk_label"].value_counts()
    for risk, count in risk_counts.items():
        print(f"  - {risk:<12}: {count:3d} Revenue Circles ({(count/len(sims_extreme))*100:.1f}%)")

    # High and Critical Circle Examples
    critical_circles = df_res[df_res["risk_score"] == 3]
    high_circles = df_res[df_res["risk_score"] == 2]

    print("\nTop Critical & High Risk Revenue Circles Flagged by AI Model:")
    print("-" * 80)
    print(f"{'Revenue Circle':<25} {'District':<18} {'Rain (mm)':<10} {'Risk':<10} {'Inundation %':<12} {'At Risk Pop':<12}")
    print("-" * 80)

    for idx, row in df_res.sort_values(by="risk_score", ascending=False).head(12).iterrows():
        pop_fmt = f"{row['impact']['population_at_risk']:,}"
        print(f"{row['name']:<25} {row['district']:<18} {row['sim_rain_mm']:<10.1f} {row['risk_label']:<10} {row['inundation_pct']:<12.1f}% {pop_fmt:<12}")

    print("-" * 80)

    total_at_risk_pop = sum(r["impact"]["population_at_risk"] for r in sims_extreme)
    total_crop_ha = sum(r["impact"]["crop_area_damaged_ha"] for r in sims_extreme)

    print(f"\nStatewide Flood Impact Assessment:")
    print(f"  - Estimated Population at Risk: {total_at_risk_pop:,} people")
    print(f"  - Submerged Agricultural Land:  {total_crop_ha:,.1f} hectares")
    print(f"  - Hospitals Operating in High Risk Zones: {sum(r['impact']['hospitals_affected'] for r in sims_extreme)} facilities")

    # Save output simulation to backend predictions file
    out_preds = os.path.join(BASE_DIR, "data", "latest_live_predictions.json")
    with open(out_preds, "w", encoding="utf-8") as f:
        json.dump(res_extreme, f, indent=2)
    print(f"\nSaved latest live inference output to: {out_preds}")
    print("\nLive Model Execution Completed Successfully!")

if __name__ == "__main__":
    run_model_inference()
