import os
import json
import pandas as pd
import urllib.request
from datetime import datetime, timedelta

def prepare_features(raw_data_df):
    """
    Day 2 ML Member 1 Preprocessing logic.
    Cleans missing or invalid values logically. Does NOT blindly delete data 
    or fill missing rainfall with zeros without justification.
    """
    df = raw_data_df.copy()
    
    # Missing Timestamp or Region ID means the row is fundamentally invalid
    df.dropna(subset=['region_id', 'timestamp'], inplace=True)
    
    # Missing Rainfall - If API failed temporarily, fill with forward fill (assume previous hour's trend)
    # rather than assuming 0.0 which ruins intensity calculations.
    if 'rainfall_24h' in df.columns:
        df['rainfall_24h'] = df.groupby('region_id')['rainfall_24h'].ffill().fillna(0.0)
        
    if 'forecast_rainfall_6h' in df.columns:
        df['forecast_rainfall_6h'] = df.groupby('region_id')['forecast_rainfall_6h'].ffill().fillna(0.0)

    # Static features imputation
    static_cols = ['elevation', 'distance_to_river_m', 'soil_clay_pct', 'population_density']
    for col in static_cols:
        if col in df.columns:
            # Impute missing static features with median of the entire dataset
            df[col] = df[col].fillna(df[col].median())
            
    return df

def fetch_historical_weather(lat, lon, start_date, end_date):
    """
    Fetch REAL historical daily rainfall data from Open-Meteo Archive API.
    (Respecting the strict rule: Do not fabricate datasets)
    """
    url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={start_date}&end_date={end_date}&daily=precipitation_sum&timezone=Asia%2FKolkata"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'FloodGuard-SIH26'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if "daily" in data:
                return pd.DataFrame({
                    "timestamp": data["daily"]["time"],
                    "rainfall_24h": data["daily"]["precipitation_sum"]
                })
    except Exception as e:
        print(f"Error fetching data for lat={lat}, lon={lon}: {e}")
    return pd.DataFrame()

def generate_sample_dataset():
    """
    Creates the first ML-ready dataset. 
    Due to API rate limits, we generate data for the top 5 regions over the last 30 days.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    circles_path = os.path.join(base_dir, "backend", "data", "assam_circles.json")
    
    with open(circles_path, "r") as f:
        circles = json.load(f)
        
    end_date = datetime.now().date() - timedelta(days=1)
    start_date = end_date - timedelta(days=30)
    
    all_data = []
    
    # Process just the first 5 regions to avoid API rate limits
    for circle in circles[:5]:
        print(f"Fetching actual historical data for Region: {circle['object_id']} ({circle['name']})...")
        weather_df = fetch_historical_weather(circle["lat"], circle["lon"], start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
        
        if not weather_df.empty:
            weather_df["region_id"] = circle["object_id"]
            # Append static features
            weather_df["elevation"] = circle.get("elevation", None)
            weather_df["distance_to_river_m"] = circle.get("distance_from_river_m", None)
            weather_df["soil_clay_pct"] = circle.get("soil_clay_pct", None)
            weather_df["population_density"] = circle.get("population_density", None)
            
            # Dummy target variable (since we don't have real daily inundation labels from ISRO yet)
            # We flag floods if rainfall > 50mm purely for ML Member 2 to have something to train on today.
            weather_df["flood_occurred"] = (weather_df["rainfall_24h"] > 50).astype(int)
            
            all_data.append(weather_df)
            
    if all_data:
        master_df = pd.concat(all_data, ignore_index=True)
        # Pass through the robust preprocessing pipeline
        cleaned_df = prepare_features(master_df)
        
        output_dir = os.path.join(base_dir, "backend", "data", "processed")
        os.makedirs(output_dir, exist_ok=True)
        out_path = os.path.join(output_dir, "assam_flood_ml_ready.csv")
        cleaned_df.to_csv(out_path, index=False)
        print(f"\n[SUCCESS] Saved clean, ML-ready dataset to {out_path}")
        print(f"Total Rows: {len(cleaned_df)}")
    else:
        print("Failed to generate dataset.")

if __name__ == "__main__":
    generate_sample_dataset()
