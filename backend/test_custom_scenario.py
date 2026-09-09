"""
Interactive Tester for Assam Heavy Rainfall & Flood Prediction AI Models (SIH26071)

Allows testing any custom rainfall amount, storm severity multiplier, live weather feed,
or specific Revenue Circle in Assam.
"""

import sys
import os
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from main import simulate_storm, SimulationRequest

def test_scenario(rainfall_mm: float = 120.0, multiplier: float = 2.0, use_live: bool = False, circle_name: str = None):
    print("=" * 75)
    print(f" TESTING AI MODEL WITH CUSTOM SCENARIO:")
    print(f"   - Input Rainfall: {rainfall_mm} mm")
    print(f"   - Severity Multiplier: {multiplier}x")
    print(f"   - Live Weather Mode: {use_live}")
    if circle_name:
        print(f"   - Filter Revenue Circle: '{circle_name}'")
    print("=" * 75)

    req = SimulationRequest(
        severity_multiplier=multiplier,
        use_live_weather=use_live,
        custom_rainfall_mm=rainfall_mm
    )
    
    res = simulate_storm(req)
    results = res["simulation"]
    
    if circle_name:
        results = [r for r in results if circle_name.lower() in r["name"].lower() or circle_name.lower() in r["district"].lower()]
        if not results:
            print(f"No circle matching '{circle_name}' found.")
            return

    df = pd.DataFrame(results)
    
    print(f"\nResults for {len(results)} Revenue Circle(s):")
    print("-" * 75)
    for idx, r in df.head(10).iterrows():
        print(f"Circle: {r['name']} ({r['district']} District)")
        print(f"   - Rain: {r['sim_rain_mm']} mm | River Gauge: {r['sim_river_m']} m | Soil Moisture: {r['sim_soil_pct']}%")
        print(f"   - AI Risk Class: {r['risk_label']} (Score {r['risk_score']}/3)")
        print(f"   - Inundation Extent: {r['inundation_pct']}% of circle area")
        print(f"   - Impact: {r['impact']['population_at_risk']:,} people at risk | {r['impact']['hospitals_affected']} hospitals endangered | {r['impact']['crop_area_damaged_ha']} ha crop damaged")
        print(f"   - Early Warning Payload: {r['alert']}")
        print("-" * 75)

if __name__ == "__main__":
    # Example 1: Test with 150mm extreme rain in Guwahati / Kamrup
    print("Test Run 1: 150mm Heavy Rainfall in Kamrup District")
    test_scenario(rainfall_mm=150.0, multiplier=1.5, circle_name="Kamrup")
