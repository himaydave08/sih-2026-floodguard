import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { ShieldAlert, Crosshair, Map as MapIcon, Database, AlertOctagon, Terminal, CheckCircle, Search, XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const TOP_DISTRICTS = ['ALL', 'GUWAHATI', 'DHUBRI', 'KOKRAJHAR', 'BARPETA', 'GOALPARA', 'BAJALI', 'DIBRUGARH', 'SILCHAR', 'JORHAT'];

function App() {
  const [cities, setCities] = useState([]);
  const [severity, setSeverity] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [activeCity, setActiveCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('Tactical Command');

  useEffect(() => {
    simulateStorm(1.0, searchQuery);
  }, []);

  const simulateStorm = async (simSeverity, query = searchQuery) => {
    setLoading(true);
    setSeverity(simSeverity);
    try {
      const bodyPayload = { 
        severity_multiplier: simSeverity, 
        use_live_weather: false
      };
      if (query && query.trim() && query !== 'ALL') {
        bodyPayload.city_or_district = query.trim();
      }

      const response = await fetch(`${API_BASE}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await response.json();
      setCities(data.simulation || []);
      
      if (data.simulation && data.simulation.length > 0) {
        const sorted = [...data.simulation].sort((a,b) => b.risk_score - a.risk_score);
        setActiveCity(sorted[0]);
      } else {
        setActiveCity(null);
      }
    } catch (error) {
      console.error("Error simulating:", error);
    }
    setLoading(false);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    simulateStorm(severity, val);
  };

  const handleChipClick = (districtName) => {
    const query = districtName === 'ALL' ? '' : districtName;
    setSearchQuery(query);
    simulateStorm(severity, query);
  };

  const getRiskColor = (risk) => {
    if (risk === 3) return '#dc2626'; 
    if (risk === 2) return '#f59e0b'; 
    if (risk === 1) return '#00b4d8'; 
    return '#10b981'; 
  };

  const highestRisk = cities.reduce((max, city) => Math.max(max, city.risk_score), 0);

  const renderContent = () => {
    if (activeTab === 'Tactical Command') {
      return (
        <>
          <div className="center-panel">
            {highestRisk === 3 ? (
              <div className="defcon-banner mono">⚠ DEFCON-2 ALERT: CRITICAL INUNDATION DETECTED</div>
            ) : (
              <div className="defcon-banner mono" style={{background: 'rgba(0,180,216,0.1)', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)'}}>
                ALL SYSTEMS NOMINAL
              </div>
            )}

            {/* City / District Search Input Card */}
            <div className="search-card mono">
              <h2 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
                <Search size={16}/> CITY / DISTRICT PREDICTION FILTER
              </h2>
              <div className="search-input-wrapper">
                <Search size={16} color="var(--text-muted)"/>
                <input 
                  type="text" 
                  placeholder="Enter city or district name (e.g. Guwahati, Dhubri, Barpeta)..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <XCircle size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => handleChipClick('ALL')} />
                )}
              </div>
              <div className="chip-container">
                {TOP_DISTRICTS.map(dist => (
                  <button 
                    key={dist} 
                    className={`filter-chip ${ (searchQuery.toUpperCase() === dist || (dist === 'ALL' && !searchQuery)) ? 'active' : '' }`}
                    onClick={() => handleChipClick(dist)}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Storm Simulator Controls */}
            <div className="card">
              <h2 className="mono" style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={16}/> AI STORM SEVERITY CONTROL
              </h2>
              <div className="severity-grid mono">
                {[1.0, 2.0, 3.0, 4.0].map(val => (
                  <div key={val} className={`severity-box ${severity === val ? (val >= 3 ? 'active' : 'active-nominal') : ''}`} onClick={() => simulateStorm(val, searchQuery)}>
                    {val}x {val === 1 ? 'Nominal' : val === 4 ? 'Breach!' : 'Heavy'}
                  </div>
                ))}
              </div>

              {/* Active City Prediction Highlights */}
              {activeCity && (
                <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    PREDICTION PARAMETERS: {activeCity.name.toUpperCase()} ({activeCity.district.toUpperCase()})
                  </div>
                  <div className="stats-grid mono">
                    <div className="stat-box">
                      <div className="val">{Math.round(activeCity.sim_rain_mm || activeCity.sim_rain || 0)}</div>
                      <div className="lbl">PRECIP (MM)</div>
                    </div>
                    <div className="stat-box">
                      <div className="val">{(activeCity.sim_river_m || activeCity.sim_river || 0).toFixed(1)}</div>
                      <div className="lbl">RIVER SURGE (M)</div>
                    </div>
                    <div className="stat-box">
                      <div className="val">{activeCity.inundation_pct || 0}%</div>
                      <div className="lbl">INUNDATED</div>
                    </div>
                  </div>

                  <div className="params-grid mono">
                    <div className="param-item">
                      <div className="key">SOIL SATURATION</div>
                      <div className="val">{activeCity.sim_soil_pct || 45}%</div>
                    </div>
                    <div className="param-item">
                      <div className="key">ELEVATION</div>
                      <div className="val">{activeCity.elevation_m || 50} M</div>
                    </div>
                    <div className="param-item">
                      <div className="key">FLOOD STATUS</div>
                      <div className="val" style={{ color: activeCity.flood_occurred ? 'var(--danger-red)' : 'var(--safe-green)' }}>
                        {activeCity.flood_occurred ? 'FLOOD RISK' : 'NO FLOOD'}
                      </div>
                    </div>
                    <div className="param-item">
                      <div className="key">RISK CATEGORY</div>
                      <div className="val" style={{ color: getRiskColor(activeCity.risk_score) }}>
                        {activeCity.risk_label || 'SAFE'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button className="primary" style={{ marginTop: '0.75rem' }} onClick={() => simulateStorm(severity, searchQuery)} disabled={loading}>
                {loading ? 'CRUNCHING AI MODELS...' : 'RUN PREDICTIVE INFERENCE'}
              </button>
            </div>

            {/* Regional Alerts for filtered circles */}
            <div style={{ marginTop: '0.5rem' }}>
              <h3 className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                MATCHED LOCATION ALERTS ({cities.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {cities.length === 0 ? (
                  <div className="mono" style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                    No revenue circle matching "{searchQuery}"
                  </div>
                ) : (
                  cities.map((city, idx) => (
                    <div key={idx} className="mono" 
                      onClick={() => setActiveCity(city)}
                      style={{ 
                        background: city.risk_score === 3 ? 'var(--danger-bg)' : 'rgba(255,255,255,0.05)',
                        borderLeft: `3px solid ${getRiskColor(city.risk_score)}`,
                        padding: '0.75rem', fontSize: '0.8rem', cursor: 'pointer'
                      }}>
                      <strong style={{ color: getRiskColor(city.risk_score) }}>[{city.name.toUpperCase()} - {city.district}]</strong> {city.alert}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="map-area">
            <MapContainer center={[26.2006, 92.9376]} zoom={7} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png" />
              {cities.map((city, idx) => (
                <CircleMarker 
                  key={idx} center={[city.lat, city.lon]} radius={city.risk_score === 3 ? 14 : city.risk_score === 2 ? 10 : 6}
                  pathOptions={{ color: getRiskColor(city.risk_score), fillColor: getRiskColor(city.risk_score), fillOpacity: 0.7 }}
                  eventHandlers={{ click: () => setActiveCity(city) }}
                >
                  <Popup>
                    <div style={{ color: '#000' }}>
                      <strong>{city.name} ({city.district})</strong><br/>
                      Risk Level: {city.risk_label || (city.risk_score === 3 ? 'Critical' : city.risk_score === 2 ? 'High' : 'Low')}<br/>
                      Inundation Extent: {city.inundation_pct || 0}%<br/>
                      Population at Risk: {city.impact?.population_at_risk?.toLocaleString() || 0}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>

            {/* Active City Full Prediction Overlay */}
            {activeCity && (
              <div className="overlay-card mono">
                {activeCity.risk_score === 3 && <div className="overlay-tag">CRITICAL RISK ZONE</div>}
                {activeCity.risk_score === 2 && <div className="overlay-tag" style={{background: 'var(--alert-amber)'}}>HIGH RISK ZONE</div>}
                {activeCity.risk_score < 2 && <div className="overlay-tag" style={{background: 'var(--safe-green)'}}>NOMINAL / LOW RISK</div>}
                
                <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  LOCATION: {activeCity.name.toUpperCase()}
                </h2>
                <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <div><strong>DISTRICT:</strong> {activeCity.district}</div>
                  <div><strong>COORDS:</strong> {activeCity.lat}, {activeCity.lon}</div>
                  <div><strong>ELEVATION:</strong> {activeCity.elevation_m || 50}M</div>
                  <div><strong>RIVER WATER LEVEL:</strong> {(activeCity.sim_river_m || activeCity.sim_river || 0).toFixed(1)}M</div>
                  <div><strong>SOIL CLAY SATURATION:</strong> {activeCity.sim_soil_pct || 45}%</div>
                </div>

                {activeCity.impact && (
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.85rem', borderRadius: '4px', marginBottom: '1rem' }}>
                    <div style={{ color: 'white', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.8rem' }}>AI IMPACT ASSESSMENT</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--danger-red)', marginBottom: '0.2rem' }}>
                      <span>CIVILIANS AT RISK:</span><span>{activeCity.impact.population_at_risk?.toLocaleString() || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--alert-amber)', marginBottom: '0.2rem' }}>
                      <span>HOSPITALS IMPACTED:</span><span>{activeCity.impact.hospitals_affected || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>
                      <span>SCHOOLS AFFECTED:</span><span>{activeCity.impact.schools_affected || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#f472b6', marginBottom: '0.2rem' }}>
                      <span>CROP AREA DAMAGED:</span><span>{activeCity.impact.crop_area_damaged_ha || 0} HA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#fb923c' }}>
                      <span>ROADS BLOCKED:</span><span>{activeCity.impact.road_km_blocked || 0} KM</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="danger" disabled={activeCity.risk_score < 2}>DISPATCH NDRF</button>
                  <button className="outline">ISSUE SMS</button>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    if (activeTab === 'GIS Map Layer') {
      return (
        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 className="mono" style={{ color: 'var(--accent-cyan)' }}><MapIcon/> ADVANCED GIS MAPPING (ASSAM REGION)</h2>
          <p style={{ color: 'var(--text-muted)' }}>Integrates Digital Elevation Models (DEM), River networks, and Soil Saturation for Assam's 180 Revenue Circles.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div className="card" style={{ flex: 1 }}><CheckCircle size={16} color="var(--accent-cyan)"/> Base Terrain Layer Loaded</div>
            <div className="card" style={{ flex: 1 }}><CheckCircle size={16} color="var(--accent-cyan)"/> Brahmaputra Basin Overlay Loaded</div>
            <div className="card" style={{ flex: 1 }}><CheckCircle size={16} color="var(--accent-cyan)"/> Soil Type Masks Loaded</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }} className="mono">
            GIS Elevation & Inundation Raster Overlay Active
          </div>
        </div>
      );
    }

    if (activeTab === 'Threat Matrix') {
      return (
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <h2 className="mono" style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}><Database/> THREAT MATRIX DATABASE ({cities.length} REVENUE CIRCLES)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} className="mono">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>REVENUE CIRCLE</th>
                <th style={{ padding: '1rem' }}>DISTRICT</th>
                <th style={{ padding: '1rem' }}>RAIN (MM)</th>
                <th style={{ padding: '1rem' }}>RIVER (M)</th>
                <th style={{ padding: '1rem' }}>INUNDATED (%)</th>
                <th style={{ padding: '1rem' }}>RISK SCORE</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: c.risk_score === 3 ? 'var(--danger-bg)' : 'transparent' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{c.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{c.district}</td>
                  <td style={{ padding: '1rem' }}>{(c.sim_rain_mm || c.sim_rain || 0).toFixed(1)}</td>
                  <td style={{ padding: '1rem' }}>{(c.sim_river_m || c.sim_river || 0).toFixed(1)}</td>
                  <td style={{ padding: '1rem' }}>{c.inundation_pct || 0}%</td>
                  <td style={{ padding: '1rem' }}>{c.risk_score}/3</td>
                  <td style={{ padding: '1rem', color: getRiskColor(c.risk_score), fontWeight: 'bold' }}>
                    {c.risk_label || (c.risk_score === 3 ? 'CRITICAL' : c.risk_score === 2 ? 'HIGH' : c.risk_score === 1 ? 'MODERATE' : 'SAFE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'Evac Protocols') {
      return (
        <div style={{ flex: 1, padding: '2rem' }}>
          <h2 className="mono" style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}><AlertOctagon/> EVACUATION PROTOCOLS (SOP)</h2>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--danger-red)', marginBottom: '0.5rem' }}>STAGE 3: CRITICAL INUNDATION</h3>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
              <li>Trigger automated SMS alerts via Telecom APIs to all registered devices in impacted geofences.</li>
              <li>Dispatch National Disaster Response Force (NDRF) teams to designated rally points.</li>
              <li>Initiate hospital backup power protocols in high-risk zones.</li>
            </ul>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--alert-amber)', marginBottom: '0.5rem' }}>STAGE 2: HIGH RISK</h3>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
              <li>Send advisory SMS to residents regarding potential evacuation.</li>
              <li>Monitor dam release thresholds every 15 minutes.</li>
              <li>Pre-position emergency supplies at relief camps.</li>
            </ul>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <div className="top-nav">
        <div className="nav-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldAlert size={28} color="var(--accent-cyan)" />
            <div>
              <h1 style={{ fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>FloodGuard AI</h1>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>NATL DISASTER OPS CMD // SIH26071</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="pill"><span className="dot"></span> SYSTEM OPERATIONAL</div>
            <div className={`pill ${highestRisk === 3 ? 'danger' : ''}`}>
              DEF-NET: {highestRisk === 3 ? 'CRITICAL' : 'SECURE'}
            </div>
          </div>
        </div>
        <div className="nav-telemetry mono">
          <span>LAT: 26.2006 N</span>
          <span>LON: 92.9376 E</span>
          <span>SATELLITE: CONNECTED</span>
          <span>OPEN-METEO FEED: LIVE</span>
          <span style={{ color: loading ? '#f59e0b' : 'var(--accent-cyan)' }}>
            {loading ? 'CALCULATING INFERENCES...' : 'AI MODEL: ONLINE & READY'}
          </span>
        </div>
      </div>

      <div className="main-content">
        {/* Left Sidebar */}
        <div className="sidebar">
          {['Tactical Command', 'GIS Map Layer', 'Threat Matrix', 'Evac Protocols'].map(tab => (
            <div 
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Tactical Command' && <Crosshair size={18}/>}
              {tab === 'GIS Map Layer' && <MapIcon size={18}/>}
              {tab === 'Threat Matrix' && <Database size={18}/>}
              {tab === 'Evac Protocols' && <AlertOctagon size={18}/>}
              {tab}
            </div>
          ))}
        </div>

        {/* Dynamic Content */}
        {renderContent()}
        
      </div>
    </div>
  );
}

export default App;
