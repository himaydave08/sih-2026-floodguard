"""
Run Live AI/ML Inference Runner for Assam Heavy Rainfall & Flood Prediction (SIH26071)
Executes terminal interactive inference for specific requested cities/districts or all 180 circles.
"""

import sys
import os
import json
import pandas as pd

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from main import simulate_storm, SimulationRequest, get_state_summary

def run_interactive_terminal_inference():
    print("=" * 85)
    print(" [AI MODEL] SIH26071 FLOOD PREDICTION (TERMINAL INTERACTIVE MODE)")
    print("=" * 85)

    if len(sys.argv) > 1 and sys.argv[1].strip():
        city_input = sys.argv[1].strip()
        severity_val = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
        print(f"\n[CLI Argument Received] Target Location: '{city_input}', Severity: {severity_val}x")
    else:
        try:
            city_input = input("\n[?] Enter City or Revenue Circle Name (e.g. Guwahati, Dhubri, Gossaigaon, Barpeta, or press Enter for ALL): ").strip()
        except (EOFError, KeyboardInterrupt):
            city_input = ""
        
        try:
            severity_str = input("[?] Enter Rainfall Severity Multiplier (1.0 = Normal, 2.0 = Heavy, 3.0 = Extreme) [Default 1.0]: ").strip()
            severity_val = float(severity_str) if severity_str else 1.0
        except (ValueError, EOFError, KeyboardInterrupt):
            severity_val = 1.0


    print("\n[Crunching AI Models... Running Inference...]")
    
    req = SimulationRequest(
        severity_multiplier=severity_val, 
        use_live_weather=False,
        city_or_district=city_input if city_input and city_input.upper() != 'ALL' else None
    )
    
    res = simulate_storm(req)
    sims = res.get("simulation", [])

    if not sims:
        print(f"\n[!] No Revenue Circle or District found matching '{city_input}'. Please check spelling.")
        return

    print("\n" + "=" * 85)
    print(f" AI MODEL PREDICTION RESULTS ({len(sims)} MATCHED LOCATION/S)")
    print("=" * 85)

    for item in sims:
        pop = item.get('impact', {}).get('population_at_risk', 0)
        hospitals = item.get('impact', {}).get('hospitals_affected', 0)
        schools = item.get('impact', {}).get('schools_affected', 0)
        crop = item.get('impact', {}).get('crop_area_damaged_ha', 0.0)
        roads = item.get('impact', {}).get('road_km_blocked', 0.0)

        print(f"\n[*] LOCATION: {item.get('name', 'Circle').upper()} ({item.get('district', 'Assam')} District)")
        print(f"  - Latitude / Longitude    : {item.get('lat')}, {item.get('lon')}")
        print(f"  - Terrain Elevation      : {item.get('elevation_m', 50)} m")
        print(f"  - Simulated Rainfall     : {item.get('sim_rain_mm', 0.0):.1f} mm")
        print(f"  - River Water Level      : {item.get('sim_river_m', 0.0):.1f} m")
        print(f"  - Soil Moisture          : {item.get('sim_soil_pct', 45)} %")
        print(f"  - AI Flood Status        : {'FLOOD PREDICTED' if item.get('flood_occurred') else 'NO FLOOD'}")
        print(f"  - Risk Category & Score  : {item.get('risk_label', 'SAFE')} ({item.get('risk_score', 0)}/3)")
        print(f"  - Inundation Extent      : {item.get('inundation_pct', 0.0):.1f} %")
        print("  -------------------------------------------------------------")
        print("  [IMPACT ASSESSMENT]:")
        print(f"    - Civilians at Risk    : {pop:,} people")
        print(f"    - Medical Facilities   : {hospitals} hospitals")
        print(f"    - Schools Impacted     : {schools} schools")
        print(f"    - Crop Land Damaged    : {crop:,.1f} hectares")
        print(f"    - Roads Blocked        : {roads:.1f} km")
        print(f"  [OFFICIAL ADVISORY]     : {item.get('alert', '')}")
        print("-" * 85)

    out_preds = os.path.join(BASE_DIR, "data", "latest_live_predictions.json")
    with open(out_preds, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2)
    print(f"\n[Saved] Latest prediction output written to: {out_preds}")

if __name__ == "__main__":
    run_interactive_terminal_inference()
