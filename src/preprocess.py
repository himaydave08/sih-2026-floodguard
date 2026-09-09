import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer

# Define Feature Sets
FEATURE_COLUMNS_CLASSIFICATION = [
    'rainfall_mean_daily_mm', 'rainfall_max_daily_mm', 'rainfall_monthly_sum_mm',
    'rainfall_lag1_monthly_sum_mm', 'rainfall_3m_rolling_sum_mm', 'is_monsoon_season',
    'river_water_level_m', 'river_water_level_max_m', 'ndvi_mean',
    'soil_clay_pct_mean', 'soil_sand_pct_mean', 'soil_silt_pct_mean', 'soil_bulk_density_mean',
    'soil_sand_to_clay_ratio', 'soil_available_water_capacity_pct',
    'terrain_elevation_mean', 'terrain_slope_mean', 'terrain_drainage_density_km_per_sqkm',
    'terrain_distance_from_river_m', 'terrain_runoff_curve_number',
    'infra_road_density_km_per_sqkm', 'infra_embankment_length_m',
    'is_heavy_rainfall', 'monsoon_rainfall_intensity', 'runoff_potential_index'
]

FEATURE_COLUMNS_REGRESSION = [
    'rainfall_lag1_monthly_sum_mm', 'rainfall_3m_rolling_sum_mm', 'is_monsoon_season',
    'month', 'soil_clay_pct_mean', 'soil_sand_pct_mean', 'soil_silt_pct_mean',
    'terrain_elevation_mean', 'terrain_slope_mean', 'terrain_drainage_density_km_per_sqkm',
    'terrain_distance_from_river_m', 'terrain_runoff_curve_number'
]

def prepare_data_splits(df, target_col='flood_occurred', task='classification'):
    """
    Cleans data, imputes missing values, scales features, and splits into train/val/test
    respecting temporal sequence (Train: <=2022, Val: 2023, Test: >=2024).
    """
    data = df.copy()
    feature_cols = FEATURE_COLUMNS_CLASSIFICATION if task == 'classification' else FEATURE_COLUMNS_REGRESSION
    
    # Filter available feature columns
    avail_features = [col for col in feature_cols if col in data.columns]
    print(f"[Preprocess] Task: {task}. Selected {len(avail_features)} features.")
    
    # Split by temporal column 'split' or 'year'
    if 'split' in data.columns:
        train_mask = data['split'] == 'train'
        val_mask = data['split'] == 'val'
        test_mask = data['split'] == 'test'
    else:
        train_mask = data['year'] <= 2022
        val_mask = data['year'] == 2023
        test_mask = data['year'] >= 2024
        
    X = data[avail_features]
    y = data[target_col]
    
    # Impute missing values
    imputer = SimpleImputer(strategy='median')
    X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=avail_features, index=X.index)
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X_imputed), columns=avail_features, index=X.index)
    
    X_train, y_train = X_scaled[train_mask], y[train_mask]
    X_val, y_val = X_scaled[val_mask], y[val_mask]
    X_test, y_test = X_scaled[test_mask], y[test_mask]
    
    print(f"[Preprocess] Splits - Train: {X_train.shape[0]}, Val: {X_val.shape[0]}, Test: {X_test.shape[0]}")
    
    return {
        'X_train': X_train, 'y_train': y_train,
        'X_val': X_val, 'y_val': y_val,
        'X_test': X_test, 'y_test': y_test,
        'feature_names': avail_features,
        'scaler': scaler,
        'imputer': imputer
    }
