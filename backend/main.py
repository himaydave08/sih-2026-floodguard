from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
import json
import urllib.request
import random

app = FastAPI()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
with open("models/flood_rf_model.pkl", "rb") as f:
    model = pickle.load(f)

# Load Cities metadata
with open("data/cities.json", "r") as f:
    cities = json.load(f)

def fetch_live_rain(lat, lon):
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=precipitation"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data.get('current', {}).get('precipitation', 0.0)
    except Exception as e:
        return 0.0

class SimulationRequest(BaseModel):
    severity_multiplier: float # 1.0 = normal, 2.0 = heavy rain, 3.0 = extreme
    use_live_weather: bool = True

@app.get("/api/state")
def get_current_state():
    return {"cities": cities}

@app.post("/api/simulate")
def simulate_storm(req: SimulationRequest):
    results = []
    
    for city in cities:
        # 1. Multi-Source Data Fusion: Live Weather + Simulation Multiplier
        base_rain = city["base_rain"]
        if req.use_live_weather:
            live_rain = fetch_live_rain(city["lat"], city["lon"])
            # If live rain is very low, we still add a small base so the simulator shows something interesting for the demo
            base_rain = max(base_rain * 0.1, live_rain * 50) 
            
        sim_rain = base_rain * req.severity_multiplier
        sim_river = city["elevation"] * 0.5 + (sim_rain * 0.2)
        sim_soil = min(100, sim_rain * 0.8)

        # 2. Dual-Path AI (Path B: Risk Prediction using RF)
        features = pd.DataFrame([{
            "Rainfall_mm": sim_rain,
            "River_Level_m": sim_river,
            "Soil_Moisture_%": sim_soil,
            "Elevation_m": city["elevation"]
        }])
        risk_score = int(model.predict(features)[0])
        
        # 3. Impact Assessment Engine
        impact = {
            "population_at_risk": 0,
            "hospitals_affected": 0,
            "schools_affected": 0
        }
        alert_msg = "Safe. No active alerts for your area."
        
        if risk_score == 3:
            alert_msg = f"CRITICAL: Immediate evacuation recommended for low-lying areas in {city['name']}."
            impact = {
                "population_at_risk": random.randint(15000, 50000),
                "hospitals_affected": random.randint(2, 5),
                "schools_affected": random.randint(10, 25)
            }
        elif risk_score == 2:
            alert_msg = f"HIGH RISK: Prepare for potential flooding in {city['name']}."
            impact = {
                "population_at_risk": random.randint(5000, 15000),
                "hospitals_affected": random.randint(0, 2),
                "schools_affected": random.randint(3, 10)
            }
        elif risk_score == 1:
            alert_msg = f"MODERATE: Water logging expected in {city['name']}."
            impact = {
                "population_at_risk": random.randint(500, 2000),
                "hospitals_affected": 0,
                "schools_affected": random.randint(0, 2)
            }

        results.append({
            "name": city["name"],
            "lat": city["lat"],
            "lon": city["lon"],
            "sim_rain": round(sim_rain, 2),
            "sim_river": round(sim_river, 2),
            "risk_score": risk_score, # 0, 1, 2, 3
            "alert": alert_msg,
            "impact": impact
        })
        
    return {"simulation": results}
