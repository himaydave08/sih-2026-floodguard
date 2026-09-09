import os
import pandas as pd

PRIMARY_DATASET_PATH = os.path.join(
    r"c:\Users\Nipun Patel\Desktop\SIH new",
    "soil to last", "flood_prediction-dataset02", "data", "processed", "tabular", "assam_flood_ml_ready.csv"
)

RAW_INUNDATION_PATH = os.path.join(
    r"c:\Users\Nipun Patel\Desktop\SIH new",
    "Flood_Observations", "inundation.csv"
)

RAW_OBJECT_MAPPING_PATH = os.path.join(
    r"c:\Users\Nipun Patel\Desktop\SIH new",
    "Flood_Observations", "object_id_mapping.csv"
)

def load_master_dataset(filepath=None):
    """
    Loads the master ML-ready dataset linking historical rainfall, river levels,
    soil/terrain static features, and ISRO/Bhuvan inundation labels.
    """
    path = filepath or PRIMARY_DATASET_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Master dataset not found at {path}")
    
    df = pd.read_csv(path)
    print(f"[DataLoader] Successfully loaded master dataset with shape {df.shape}")
    return df

def load_raw_flood_observations():
    """
    Loads raw inundation observations and circle mappings.
    """
    df_inund = pd.read_csv(RAW_INUNDATION_PATH)
    df_map = pd.read_csv(RAW_OBJECT_MAPPING_PATH)
    print(f"[DataLoader] Loaded raw inundation ({len(df_inund)} rows) and mapping ({len(df_map)} circles)")
    return df_inund, df_map

if __name__ == "__main__":
    df = load_master_dataset()
    print("Sample columns:", df.columns[:10].tolist())
