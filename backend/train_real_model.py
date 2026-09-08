import os
import glob
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

def find_file(filename_pattern):
    files = glob.glob(f"data/raw/**/{filename_pattern}", recursive=True)
    return files[0] if files else None

def train():
    print("Loading real datasets...")
    
    # 1. Target Variable (Damage)
    target_file = find_file("Population_affected_Total.csv")
    if not target_file:
        print("❌ Missing target file: Population_affected_Total.csv")
        return
    df_target = pd.read_csv(target_file)
    df_target = df_target[['object_id', 'timeperiod', 'Population_affected_Total']].dropna()
    
    # 2. Rainfall
    rain_file = find_file("rainfall.csv")
    if not rain_file:
        print("❌ Missing rain file: rainfall.csv")
        return
    df_rain = pd.read_csv(rain_file)[['object_id', 'timeperiod', 'mean_rain']].dropna()
    
    # 3. River Level
    river_file = find_file("riverlevel.csv")
    if not river_file:
        print("❌ Missing river file: riverlevel.csv")
        return
    df_river = pd.read_csv(river_file)[['object_id', 'timeperiod', 'riverlevel_max']].dropna()
    
    # 4. Infrastructure (Static)
    infra_file = find_file("assam_infrastructure_by_revenue_circle.csv")
    df_infra = pd.read_csv(infra_file)[['object_id', 'infra_hospital_count', 'infra_total_road_length_km']].dropna()
    
    # 5. Population (Static)
    pop_file = find_file("assam_population_by_revenue_circle.csv")
    df_pop = pd.read_csv(pop_file)[['object_id', 'population_density_mean_sqkm']].dropna()
    
    print("Merging all 6 dimensions on geographical object_id and date...")
    # Merge Dynamic Features
    df_master = pd.merge(df_target, df_rain, on=['object_id', 'timeperiod'], how='inner')
    df_master = pd.merge(df_master, df_river, on=['object_id', 'timeperiod'], how='inner')
    
    # Merge Static Features
    df_master = pd.merge(df_master, df_infra, on='object_id', how='left')
    df_master = pd.merge(df_master, df_pop, on='object_id', how='left')
    
    # Fill missing static features with median
    df_master.fillna(df_master.median(numeric_only=True), inplace=True)
    
    print(f"Master dataset created with {len(df_master)} real historical records!")
    
    # Create Target Label (Risk Score 0-3)
    def calculate_risk(pop_affected):
        if pop_affected <= 0: return 0
        if pop_affected < 1000: return 1
        if pop_affected < 10000: return 2
        return 3
        
    df_master['Risk_Score'] = df_master['Population_affected_Total'].apply(calculate_risk)
    
    print(f"Risk Score Distribution:\n{df_master['Risk_Score'].value_counts()}")
    
    # Features & Labels
    X = df_master[['mean_rain', 'riverlevel_max', 'infra_hospital_count', 'infra_total_road_length_km', 'population_density_mean_sqkm']]
    y = df_master['Risk_Score']
    
    print("Training Random Forest Classifier on Real Data...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    rf.fit(X, y)
    
    accuracy = rf.score(X, y)
    print(f"Model Accuracy on Training Data: {accuracy * 100:.2f}%")
    
    # Save the model
    os.makedirs('models', exist_ok=True)
    joblib.dump(rf, 'models/real_flood_rf_model.pkl')
    print("✅ Model saved successfully as 'models/real_flood_rf_model.pkl'!")

if __name__ == "__main__":
    train()
