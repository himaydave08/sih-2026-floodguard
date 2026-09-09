# 🌊 FloodGuard: Predictive Flood Alert System (SIH 2026)

![FloodGuard](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18-cyan)

FloodGuard is an advanced, AI-powered predictive flood dashboard developed for the **Smart India Hackathon (SIH) 2026**. Designed specifically for the state of Assam, the system ingests live weather feeds and runs them against a Random Forest Machine Learning model trained on massive amounts of historical satellite, river, and demographic data. 

When critical flood thresholds are met, the system automatically dispatches real-time SMS evacuation alerts via Twilio to at-risk populations.

---

## 🧠 The Machine Learning Architecture

We refused to rely on dummy data. Our backend AI is powered by a **Random Forest Classifier** trained on over 60 historical CSV datasets provided by government and satellite sources.

### Data Fusion Pipeline
Our Python pipeline (`train_real_model.py`) recursively parses and merges data across 5 critical dimensions, bound geographically by Revenue Circle (`object_id`) and Time:
1. **Historical Rainfall** (Open-Meteo & ERA5)
2. **River-Water Levels** (CWC & NWDPA)
3. **Infrastructure Density** (Hospitals, Roads, Bridges)
4. **Demographics** (Population density per SqKm)
5. **Historical Damage Reports** (Houses destroyed, boats deployed, populations affected)

### The Target Variable (Risk Score)
The AI does not just predict "water levels." It predicts the **human impact** (Risk Score 0-3) based on historically affected populations in specific Assam districts.
- `0`: Safe
- `1`: Minor water logging (Low Risk)
- `2`: Potential flooding (High Risk)
- `3`: Mass evacuation required (Critical)

**Model Accuracy:** 99.66% on the historical Assam validation set.

---

## ⚙️ Core Features

*   **Live Weather Ingestion:** The FastAPI backend dynamically fetches live precipitation data using `latitude` and `longitude` coordinates via the Open-Meteo API.
*   **Dual-Path AI Prediction:** The live weather is fed into the compiled `.pkl` Random Forest model alongside static infrastructural constants to predict the immediate flood risk.
*   **Twilio SMS Automation:** If the AI determines a Risk Score of `3` (Critical), the backend automatically triggers the Twilio API to send pre-approved TRAI/DLT SMS templates to registered citizens in the evacuation zone.
*   **Interactive React Dashboard:** A highly interactive Command Center UI built in React provides map developers and disaster managers with a God's-eye view of the crisis.

---

## 🚀 Running the Project Locally

### 1. Start the FastAPI Backend
Ensure you have Python 3.10+ installed.

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

### 2. Configure Twilio (Security)
To enable the SMS feature, create a `.env` file inside the `backend/` directory:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```


### 3. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

- `GET /api/state` - Fetches the initial mapping coordinates and baseline metadata for the 10 monitored cities in Assam.
- `POST /api/simulate` - Triggers the AI simulation engine. Accepts a severity multiplier and returns the predicted `risk_score` and `impact` metrics for each city.
- `GET /api/history/{city_name}` - Returns the last 30 days of historical flood data for graphical rendering on the frontend.
