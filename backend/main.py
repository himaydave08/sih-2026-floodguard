from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
import json
import urllib.request
import random
import os

app = FastAPI()

def send_alert_sms(city_name, people_affected):
    """
    Mock function to send SMS alerts.
    To make this real:
    1. Sign up for free Twilio account.
    2. Replace the keys below and uncomment the real Twilio code.
    """
    message_body = f"⚠️ CRITICAL ALERT: Immediate flood danger in {city_name}. Est {people_affected} people at risk. Evacuate to higher ground immediately!"
    
    print(f"\n[{'='*40}]")
    print(f"📱 MOCK SMS TRIGGERED FOR {city_name.upper()}")
    # --- REAL TWILIO CODE (No installation required) ---
    import urllib.parse
    import urllib.request
    import base64
    
    # HACKATHON FIX: Twilio Trial accounts will block you (400 Bad Request) if you try to send 10 texts 
    # at the exact same millisecond. We will only send the real text for Guwahati, and mock the rest!
    if city_name.lower() != "guwahati":
        print("✅ Mock SMS recorded (Real Twilio API skipped to prevent spam blocks).")
        return

    import os
    
    # Simple .env parser to avoid requiring pip installs on Windows
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

    account_sid = os.environ.get('TWILIO_ACCOUNT_SID', '')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN', '')
    
    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    
    # HACKATHON FIX 2: Twilio Trial accounts in India CANNOT send custom messages due to strict telecom laws.
    # We MUST send their pre-approved template string "sms_account_alerts". 
    data = urllib.parse.urlencode({
        'To': '+916351208639',
        'From': '+17372212163',
        'Body': 'sms_account_alerts'
    }).encode('ascii')
    
    auth_string = f"{account_sid}:{auth_token}"
    b64_auth = base64.b64encode(auth_string.encode('ascii')).decode('ascii')
    
    req = urllib.request.Request(url, data=data)
    req.add_header("Authorization", f"Basic {b64_auth}")
    
    try:
        with urllib.request.urlopen(req) as response:
            print("✅ Real SMS Sent successfully!")
    except Exception as e:
        error_details = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
        print(f"❌ Failed to send real SMS: {error_details}")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import HTTPException

# Load Model
try:
    with open("models/real_flood_rf_model.pkl", "rb") as f:
        model = pickle.load(f)
    print("✅ Loaded REAL ML model successfully.")
except Exception as e:
    print(f"❌ Failed to load ML model: {e}")
    model = None

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
    if not model:
        raise HTTPException(status_code=500, detail="ML model not loaded")
    results = []
    
    for city in cities:
        # 1. Multi-Source Data Fusion: Live Weather + Simulation Multiplier
        live_rain = fetch_live_rain(city["lat"], city["lon"]) if req.use_live_weather else 50.0
        
        mean_rain = live_rain * req.severity_multiplier
        riverlevel_max = 10 + (mean_rain * 0.3) # Simulate a river rising based on rain
        
        # We use static demographic averages to represent the city's infrastructure
        infra_hospital_count = 5.0
        infra_total_road_length_km = 120.0
        population_density_mean_sqkm = 398.0
        
        # 2. Dual-Path AI (Path B: Risk Prediction using REAL RF Model)
        features = pd.DataFrame([{
            "mean_rain": mean_rain,
            "riverlevel_max": riverlevel_max,
            "infra_hospital_count": infra_hospital_count,
            "infra_total_road_length_km": infra_total_road_length_km,
            "population_density_mean_sqkm": population_density_mean_sqkm
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
            # TRIGGER SMS ALERT
            send_alert_sms(city['name'], impact["population_at_risk"])
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
            "sim_rain": round(mean_rain, 2),
            "sim_river": round(riverlevel_max, 2),
            "risk_score": risk_score, # 0, 1, 2, 3
            "alert": alert_msg,
            "impact": impact
        })
        
    return {"simulation": results}

@app.get("/api/history/{city_name}")
def get_historical_data(city_name: str):
    try:
        # Load the mock historical data
        df = pd.read_csv("data/historical_flood_data.csv")
        # Filter for the exact city requested
        city_data = df[df["City"].str.lower() == city_name.lower()]
        
        if city_data.empty:
            return {"error": f"No historical data found for {city_name}"}
            
        # Grab the last 30 rows to simulate the last 30 days of data
        recent_data = city_data.tail(30).to_dict(orient="records")
        return {
            "city": city_name, 
            "data_points": len(recent_data),
            "history": recent_data
        }
    except Exception as e:
        return {"error": str(e)}
