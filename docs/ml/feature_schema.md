# Feature Schema

This document dictates the exact feature contract that ML Member 2 will train on, and the Backend member will provide during live inference. 

| Feature Name | Category | Data Type | Unit | Missing Value Handling | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `region_id` | Metadata | String | N/A | Drop Row | Matches `object_id` in `assam_circles.json` |
| `timestamp` | Metadata | String | ISO 8601 | Drop Row | Inference / Record time |
| `rainfall_24h` | Dynamic | Float | mm | Impute 0.0 | Total accumulated rainfall in the last 24h |
| `forecast_rainfall_6h` | Dynamic | Float | mm | Impute 0.0 | Forecasted rainfall for the next 6h window |
| `rainfall_3d_cumulative` | Engineered | Float | mm | Extrapolate | 3-Day Rolling rainfall total (Soil Saturation Proxy) |
| `rainfall_7d_cumulative` | Engineered | Float | mm | Extrapolate | 7-Day Rolling rainfall total |
| `elevation` | Static | Float | meters | Static Median | Elevation of the circle centroid |
| `distance_to_river_m` | Static | Float | meters | Static Median | Proximity to nearest major water body |
| `soil_clay_pct` | Static | Float | % | Static Median | Clay percentage affecting runoff |
| `population_density` | Static | Float | /sqkm | Static Median | Density metric for impact estimation |
| `runoff_potential_index` | Engineered | Float | index | 0.0 | Derived from rainfall, clay pct, and elevation |
| `proximity_risk_score` | Engineered | Float | index | 0.0 | Derived from rainfall intensity and distance to river |

*Note: All static features are pre-computed in `assam_circles.json` and must be joined locally by the ML pipeline to reduce backend payload sizes.*
