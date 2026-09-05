import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle
import os

# Ensure backend directory exists
os.makedirs("data", exist_ok=True)
os.makedirs("models", exist_ok=True)

# 1. Generate Realistic Mock Data for India
cities = [
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "base_rain": 100, "elevation": 14},
    {"name": "Kochi", "lat": 9.9312, "lon": 76.2673, "base_rain": 120, "elevation": 5},
    {"name": "Guwahati", "lat": 26.1445, "lon": 91.7362, "base_rain": 90, "elevation": 55},
    {"name": "Chennai", "lat": 13.0827, "lon": 80.2707, "base_rain": 70, "elevation": 6},
    {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639, "base_rain": 85, "elevation": 9},
    {"name": "Delhi", "lat": 28.7041, "lon": 77.1025, "base_rain": 30, "elevation": 216},
    {"name": "Patna", "lat": 25.5941, "lon": 85.1376, "base_rain": 60, "elevation": 53},
    {"name": "Surat", "lat": 21.1702, "lon": 72.8311, "base_rain": 80, "elevation": 13}
]

np.random.seed(42)
data = []
for city in cities:
    for day in range(365):
        # Generate some synthetic weather data
        rainfall = max(0, np.random.normal(city["base_rain"] / 10, city["base_rain"] / 5))
        
        # Monsoon season spike (Days 150 to 270)
        if 150 <= day <= 270:
            rainfall *= np.random.uniform(1.5, 4.0)

        river_level = city["elevation"] * 0.5 + (rainfall * 0.2) + np.random.normal(0, 2)
        soil_moisture = min(100, max(10, rainfall * 0.8 + np.random.normal(0, 10)))
        
        # Risk Label Logic
        risk_score = 0
        if rainfall > 150 and river_level > city["elevation"] * 0.8:
            risk_score = 3 # Critical
        elif rainfall > 100 or river_level > city["elevation"] * 0.7:
            risk_score = 2 # High
        elif rainfall > 50:
            risk_score = 1 # Moderate
        else:
            risk_score = 0 # Low

        data.append({
            "City": city["name"],
            "Latitude": city["lat"],
            "Longitude": city["lon"],
            "Rainfall_mm": round(rainfall, 2),
            "River_Level_m": round(river_level, 2),
            "Soil_Moisture_%": round(soil_moisture, 2),
            "Elevation_m": city["elevation"],
            "Risk_Label": risk_score
        })

df = pd.DataFrame(data)
df.to_csv("data/historical_flood_data.csv", index=False)
print("Generated mock historical data: data/historical_flood_data.csv")

# 2. Train AI Model
features = ["Rainfall_mm", "River_Level_m", "Soil_Moisture_%", "Elevation_m"]
X = df[features]
y = df["Risk_Label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print(f"Trained Random Forest Model. Accuracy: {accuracy:.2%}")

# Save the model
with open("models/flood_rf_model.pkl", "wb") as f:
    pickle.dump(model, f)
print("Saved model to models/flood_rf_model.pkl")

# Save cities metadata for the backend
import json
with open("data/cities.json", "w") as f:
    json.dump(cities, f, indent=4)
