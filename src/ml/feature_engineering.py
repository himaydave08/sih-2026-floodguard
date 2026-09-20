import pandas as pd
import numpy as np

def generate_features(df):
    """
    Advanced Feature Engineering Pipeline.
    Takes the cleaned base DataFrame and generates ML-ready features.
    This same function is called during historical training and live inference
    to ensure exact feature consistency.
    """
    # Ensure it's sorted by time if we are processing historical panel data
    # (If it's live inference with 1 row, this has no effect)
    if 'timestamp' in df.columns and 'region_id' in df.columns:
        df = df.sort_values(by=['region_id', 'timestamp']).reset_index(drop=True)
    
    # 1. Temporal / Rolling Features (Requires historical context)
    # If the dataframe has multiple days per region (training), compute rolling totals.
    # For live inference, the backend must provide these directly or we rely on simple fallback logic.
    if len(df) > 1 and 'rainfall_24h' in df.columns:
        # 3-Day Cumulative Rainfall (Soil Saturation Proxy)
        df['rainfall_3d_cumulative'] = df.groupby('region_id')['rainfall_24h'].transform(
            lambda x: x.rolling(window=3, min_periods=1).sum()
        )
        # 7-Day Cumulative Rainfall
        df['rainfall_7d_cumulative'] = df.groupby('region_id')['rainfall_24h'].transform(
            lambda x: x.rolling(window=7, min_periods=1).sum()
        )
    else:
        # Fallback for single-row live inference if history isn't passed
        # We approximate 3d cumulative as current day * 1.5 if missing
        if 'rainfall_3d_cumulative' not in df.columns:
            df['rainfall_3d_cumulative'] = df.get('rainfall_24h', 0.0) * 1.5
        if 'rainfall_7d_cumulative' not in df.columns:
            df['rainfall_7d_cumulative'] = df.get('rainfall_24h', 0.0) * 2.5

    # 2. Spatial Interaction Features
    # Heavy rain on steep slopes = faster runoff. (Elevation proxy for slope here)
    df['runoff_potential_index'] = (df.get('rainfall_24h', 0.0) * df.get('soil_clay_pct', 25.0)) / (df.get('elevation', 50.0) + 1.0)
    
    # Proximity risk: Heavy rain near a river is far more dangerous
    # Adding a small constant to distance to avoid division by zero
    df['proximity_risk_score'] = df.get('rainfall_24h', 0.0) / ((df.get('distance_to_river_m', 1000.0) / 1000.0) + 0.1)

    # 3. Handle any edge case NaNs created by division
    df.fillna(0.0, inplace=True)
    
    # 4. Feature Selection (Enforcing Schema)
    # We strictly define the columns that will be returned to ML Member 2.
    expected_features = [
        'region_id', 'timestamp',
        'rainfall_24h', 'forecast_rainfall_6h',
        'rainfall_3d_cumulative', 'rainfall_7d_cumulative',
        'elevation', 'distance_to_river_m', 'soil_clay_pct', 'population_density',
        'runoff_potential_index', 'proximity_risk_score'
    ]
    
    # If the target exists (historical), keep it
    if 'flood_occurred' in df.columns:
        expected_features.append('flood_occurred')
        
    # Only return columns that actually exist (to handle missing optional ones gracefully)
    final_cols = [col for col in expected_features if col in df.columns]
    
    return df[final_cols]
