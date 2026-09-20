# Backend Data Requirements (Live Inference)

This contract defines exactly what the Backend member (Dhruv) must provide to the ML Inference pipeline. 

The Backend is responsible for fetching live dynamic weather/hydrological data. The ML pipeline handles joining static terrain/population data based on the `region_id`.

## Required Live Feature Object 
For each prediction request, the backend must construct a feature dictionary exactly like this:

```json
{
  "region_id": "18-300-00101",
  "timestamp": "2026-09-15T12:00:00",
  "rainfall_24h": 145.2,
  "forecast_rainfall_6h": 85.0
}
```

## Missing Data Behavior
- If `open-meteo` is down or rainfall data is missing, the backend MUST pass `null` or `None`. 
- **Do not silently pass 0.0.** The ML pipeline's preprocessing function `prepare_features()` will handle the imputation logic logically. 
- If the entire fetch fails, trigger the "Data Unavailable" fallback state defined in the Frontend-Backend contract.
