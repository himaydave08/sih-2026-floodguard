import numpy as np
import pandas as pd

def add_engineered_features(df):
    """
    Applies feature engineering for rainfall intensity and flood risk modeling.
    """
    data = df.copy()
    
    # 1. Heavy rainfall threshold flag (daily max > 50mm or monthly sum > 300mm)
    data['is_heavy_rainfall'] = (
        (data['rainfall_max_daily_mm'] >= 50.0) | (data['rainfall_monthly_sum_mm'] >= 300.0)
    ).astype(int)

    # 2. Monsoon-rainfall intensity interaction
    data['monsoon_rainfall_intensity'] = data['rainfall_monthly_sum_mm'] * data['is_monsoon_season']
    
    # 3. Lag features (if not already existing)
    if 'rainfall_lag1_monthly_sum_mm' not in data.columns:
        data = data.sort_values(['object_id', 'year', 'month']).reset_index(drop=True)
        data['rainfall_lag1_monthly_sum_mm'] = data.groupby('object_id')['rainfall_monthly_sum_mm'].shift(1).fillna(0)

    # 4. Cumulative 3-month rainfall rolling sum (if not existing)
    if 'rainfall_3m_rolling_sum_mm' not in data.columns:
        data = data.sort_values(['object_id', 'year', 'month']).reset_index(drop=True)
        data['rainfall_3m_rolling_sum_mm'] = (
            data.groupby('object_id')['rainfall_monthly_sum_mm']
            .rolling(3, min_periods=1).sum()
            .reset_index(level=0, drop=True)
        )

    # 5. Runoff potential index
    if 'soil_available_water_capacity_pct' in data.columns:
        data['runoff_potential_index'] = (
            data['rainfall_monthly_sum_mm'] / (data['soil_available_water_capacity_pct'] + 1.0)
        )
    else:
        data['runoff_potential_index'] = data['rainfall_monthly_sum_mm'] * 0.01

    # 6. River surge pressure index (if river level available)
    if 'river_water_level_m' in data.columns and 'river_water_level_max_m' in data.columns:
        data['river_surge_ratio'] = data['river_water_level_m'] / (data['river_water_level_max_m'] + 1.0)
    
    print(f"[FeatureEngineering] Engineered features added. Total columns: {len(data.columns)}")
    return data
