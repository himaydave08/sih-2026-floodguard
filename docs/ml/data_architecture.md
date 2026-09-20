# Data Architecture

This document defines the spatial and temporal backbone of the FloodGuard ML prototype. Consistency between training and live inference is strictly enforced.

## Spatial Alignment
- **Common Unit:** Revenue Circle (Assam)
- **Identifier:** `region_id` (Mapped exactly to `object_id` in `assam_circles.json`).
- **Geometry:** Point geometry based on the geographic centroid (`lat`, `lon`) of each Revenue Circle.
- **Why?** It is computationally efficient to pull meteorological data for 180 points rather than complex polygons during a 6-day hackathon, while still providing highly localized risk alerts to the frontend map.

## Temporal Alignment
- **Common Timezone:** IST (Indian Standard Time, UTC+5:30)
- **Aggregation Interval:** Hourly for inference, Daily aggregations for historical training (where hourly is unavailable).
- **Timestamp Format:** ISO 8601 (e.g., `2026-09-15T12:00:00`).

## Leakage Prevention Strategy
At time $T$, the feature pipeline is strictly prohibited from accessing meteorological or river data recorded at time $> T$. 
- Forecast features (`forecast_rainfall_6h`) must use the prediction issued *at or before* $T$, not the actual observed values that occurred after $T$.
