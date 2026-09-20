import pandas as pd
from src.ml.data_pipeline import prepare_features
from src.ml.feature_engineering import generate_features

def adapt_live_json_to_features(json_payload):
    """
    Day 5 Task: Backend Integration Adapter
    This function acts as the bridge between Dhruv's FastAPI backend and our ML Pipeline.
    It takes the raw JSON provided by the backend, applies the exact same preprocessing 
    and feature engineering used during training, and returns the model-ready feature vector.
    """
    # 1. Convert JSON to a single-row DataFrame
    raw_df = pd.DataFrame([json_payload])
    
    # 2. Run the Day 2 Data Cleaning pipeline (Imputation, timestamp checks)
    cleaned_df = prepare_features(raw_df)
    
    # 3. Run the Day 3 Feature Engineering pipeline (Rolling features, spatial interactions)
    # Since it's a single row, the engineering function will use fallback logic for rolling features
    # (e.g. estimating 3-day rainfall from 24h rainfall if history isn't provided).
    final_features_df = generate_features(cleaned_df)
    
    return final_features_df

if __name__ == "__main__":
    # Test Example representing what the Backend will pass during live inference
    mock_backend_request = {
        "region_id": "18-300-00101",
        "timestamp": "2026-09-15T12:00:00",
        "rainfall_24h": 145.2,
        "forecast_rainfall_6h": 85.0,
        "elevation": 78.79,
        "distance_to_river_m": 1718.8,
        "soil_clay_pct": 28.3,
        "population_density": 322.7
    }
    
    print("--- LIVE INFERENCE ADAPTER TEST ---")
    print("\n[INPUT] Raw Backend JSON:")
    print(mock_backend_request)
    
    output_df = adapt_live_json_to_features(mock_backend_request)
    
    print("\n[OUTPUT] Model-Ready Feature Vector:")
    print(output_df.to_dict(orient='records')[0])
    print("\nSUCCESS: Adapter runs flawlessly without throwing missing column errors.")
