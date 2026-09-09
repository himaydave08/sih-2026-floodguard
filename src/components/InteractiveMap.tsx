import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Layers, 
  Activity, 
  Mountain, 
  CloudRain, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertTriangle, 
  Building2, 
  GraduationCap, 
  Navigation, 
  ShieldCheck, 
  Play, 
  Pause, 
  X, 
  Eye, 
  Compass,
  Map as MapIcon,
  Satellite,
  Info
} from 'lucide-react';
import { SectorData, InfrastructureItem, GaugeStation } from '../types';
import { ASSAM_SECTORS, CWC_GAUGE_STATIONS } from '../data/assamData';
import { useTheme } from '../context/ThemeContext';

interface InteractiveMapProps {
  currentSector: SectorData;
  onSelectSector: (sectorId: string) => void;
  onOpenDiagnostic: () => void;
  forecastHour?: number;
  onForecastHourChange?: (hour: number) => void;
}

export type BasemapMode = 'vector' | 'satellite' | 'terrain';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  currentSector,
  onSelectSector,
  onOpenDiagnostic,
  forecastHour = 0,
  onForecastHourChange
}) => {
  // Layer Toggles
  const [showFloodRisk, setShowFloodRisk] = useState(true);
  const [showInundation, setShowInundation] = useState(true);
  const [showDoppler, setShowDoppler] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);
  const [showPopDensity, setShowPopDensity] = useState(false);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showSchools, setShowSchools] = useState(false);
  const [showRoads, setShowRoads] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showGauges, setShowGauges] = useState(true);
  const [showDemContours, setShowDemContours] = useState(false);
  
  // Basemap & Comparison Modes
  const [basemapMode, setBasemapMode] = useState<BasemapMode>('vector');
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonSplit, setComparisonSplit] = useState(50); // percentage

  // Selected Pin / Modal on Map
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureItem | null>(null);
  const [selectedGauge, setSelectedGauge] = useState<GaugeStation | null>(null);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1.05);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation playback for timeline
  const [isPlaying, setIsPlaying] = useState(false);
  const { resolvedTheme } = useTheme();
  const timelineSteps = [0, 6, 12, 24, 48, 72];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.75), 2.5));
  };

  const handleReset = () => {
    setZoomLevel(1.05);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if not clicking buttons or popup
    if ((e.target as HTMLElement).closest('button, .interactive-control, .map-popup')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Step calculations based on forecast hour
  const currentTimelineStep = currentSector.timeline?.find(t => t.hour === forecastHour) || currentSector.timeline?.[0] || {
    hour: 0,
    label: 'Now (+0h)',
    riskScore: currentSector.vulnerabilityIndex,
    riskLevel: currentSector.hazardLevel,
    floodProbability: currentSector.floodProb,
    inundationAreaKm2: currentSector.inundationAreaKm2,
    inundationOpacity: 0.55
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      let currentIdx = timelineSteps.indexOf(forecastHour);
      const interval = setInterval(() => {
        currentIdx = (currentIdx + 1) % timelineSteps.length;
        if (onForecastHourChange) {
          onForecastHourChange(timelineSteps[currentIdx]);
        }
      }, 1500);
      // Auto-stop after cycle
      setTimeout(() => {
        clearInterval(interval);
        setIsPlaying(false);
      }, 1500 * timelineSteps.length);
    }
  };

  // Map sector locations to SVG pixel coordinates
  const sectorCoordinatesMap: Record<string, { x: number; y: number }> = {
    dhemaji: { x: 440, y: 190 },
    majuli: { x: 340, y: 350 },
    lakhimpur: { x: 230, y: 260 },
    dibrugarh: { x: 570, y: 200 },
    tinsukia: { x: 740, y: 160 },
    barpeta: { x: 130, y: 440 },
    cachar: { x: 280, y: 550 },
  };

  // Filter infrastructure items for current sector
  const infraItems = currentSector.infrastructureList || [];

  return (
    <div className="relative w-full h-[580px] lg:h-[660px] bg-[#eef5fc] dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden select-none flex flex-col transition-colors">
      {/* Top Left: GIS Layer Controls Bar */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 max-w-[95%] sm:max-w-none pointer-events-none">
        {/* Layer Toggles Pill Container */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-sm pointer-events-auto">
          {/* Flood Risk Toggle */}
          <button
            onClick={() => setShowFloodRisk(!showFloodRisk)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition ${
              showFloodRisk
                ? 'bg-[#0b1c30] dark:bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showFloodRisk ? 'bg-red-400' : 'bg-slate-400'}`} />
            <span>Flood Risk</span>
          </button>

          {/* Inundation Extent Toggle */}
          <button
            onClick={() => setShowInundation(!showInundation)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition ${
              showInundation
                ? 'bg-[#006398] dark:bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showInundation ? 'bg-sky-300' : 'bg-slate-400'}`} />
            <span>Inundation Spread</span>
          </button>

          {/* Doppler Rain Toggle */}
          <button
            onClick={() => setShowDoppler(!showDoppler)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition ${
              showDoppler
                ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rainfall Doppler</span>
          </button>

          {/* CWC River Gauges Toggle */}
          <button
            onClick={() => setShowGauges(!showGauges)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition ${
              showGauges
                ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CWC Gauges</span>
          </button>

          {/* Infrastructure Sub-toggles */}
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Hospitals */}
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition ${
              showHospitals
                ? 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Hospitals"
          >
            <Building2 className="w-3 h-3" />
            <span className="hidden sm:inline">Hospitals</span>
          </button>

          {/* Schools */}
          <button
            onClick={() => setShowSchools(!showSchools)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition ${
              showSchools
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Schools & Relief Shelters"
          >
            <GraduationCap className="w-3 h-3" />
            <span className="hidden sm:inline">Schools</span>
          </button>

          {/* Roads & Bridges */}
          <button
            onClick={() => {
              setShowRoads(!showRoads);
              setShowBridges(!showBridges);
            }}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition ${
              showRoads
                ? 'bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Roads and Bridges"
          >
            <Navigation className="w-3 h-3" />
            <span className="hidden sm:inline">Roads/Bridges</span>
          </button>
        </div>

        {/* Second Row: Basemap Switcher & Comparison Mode */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-lg border border-slate-300 dark:border-slate-800 shadow-sm text-xs font-medium">
            <button
              onClick={() => setBasemapMode('vector')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                basemapMode === 'vector' ? 'bg-slate-800 dark:bg-sky-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>GIS Vector</span>
            </button>
            <button
              onClick={() => setBasemapMode('satellite')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                basemapMode === 'satellite' ? 'bg-slate-800 dark:bg-sky-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>Satellite SAR</span>
            </button>
            <button
              onClick={() => setBasemapMode('terrain')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                basemapMode === 'terrain' ? 'bg-slate-800 dark:bg-sky-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Mountain className="w-3 h-3" />
              <span>DEM 30m</span>
            </button>
          </div>

          {/* Comparison Mode Button */}
          <button
            onClick={() => setIsComparisonMode(!isComparisonMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm bg-white/95 dark:bg-slate-900/95 ${
              isComparisonMode
                ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800/80 ring-2 ring-purple-200 dark:ring-purple-900'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Predicted vs Sentinel-1 Observed</span>
            <span className="sm:hidden">Comparison</span>
          </button>
        </div>
      </div>

      {/* Top Right: Zoom, Orientation & Coordinates Controls */}
      <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-300 dark:border-slate-800 shadow-sm p-1">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
            title="Reset Orientation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Mapbox Layer Status Pill with Subtle Pulsing Danger Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-300/80 dark:border-slate-800 shadow-xs text-[11px] font-mono text-slate-600 dark:text-slate-300 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-red-700 dark:text-red-400 font-semibold">Pulsing:</span>
            <span>High-Risk Hazard Zones</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-500 dark:text-slate-400">Mapbox Inundation Layer</span>
        </div>
      </div>

      {/* Comparison Mode Split Slider Banner (when active) */}
      {isComparisonMode && (
        <div className="absolute top-24 left-3 right-3 z-30 bg-purple-900/90 text-white backdrop-blur-md px-4 py-2 rounded-lg text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider">Comparison Mode:</span>
            <span className="text-purple-200">Left: AI ML Predicted Flood • Right: Sentinel-1 SAR Radar Observed</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-purple-300">Split: {comparisonSplit}%</span>
            <input
              type="range"
              min="10"
              max="90"
              value={comparisonSplit}
              onChange={(e) => setComparisonSplit(Number(e.target.value))}
              className="w-28 sm:w-44 accent-purple-400 cursor-pointer"
            />
            <button
              onClick={() => setIsComparisonMode(false)}
              className="p-1 hover:bg-purple-800 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main SVG Interactive Map Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '50% 50%',
          }}
        >
          <defs>
            {/* Water Wave Pattern */}
            <pattern id="water-wave" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#bae6fd" strokeWidth="1.2" />
            </pattern>

            {/* Inundation Glow */}
            <filter id="flood-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Doppler Gradient */}
            <radialGradient id="dopplerGradient" cx="44%" cy="32%" r="48%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.7" />
              <stop offset="30%" stopColor="#ea580c" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            {/* DEM Topo Hypsometric Gradient */}
            <linearGradient id="demHypsometric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.35" />
              <stop offset="35%" stopColor="#d97706" stopOpacity="0.25" />
              <stop offset="65%" stopColor="#84cc16" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
            </linearGradient>

            {/* Satellite Background Tint */}
            <radialGradient id="satelliteDark" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>

          {/* BASEMAP BACKGROUND */}
          {basemapMode === 'satellite' ? (
            <rect x="0" y="0" width="1000" height="650" fill="url(#satelliteDark)" />
          ) : (
            <rect x="0" y="0" width="1000" height="650" fill={resolvedTheme === 'dark' ? '#0b1324' : '#f0f6f4'} />
          )}

          {/* DEM Hypsometric Contours */}
          {(basemapMode === 'terrain' || showDemContours) && (
            <rect x="0" y="0" width="1000" height="650" fill="url(#demHypsometric)" />
          )}

          {/* Elevation Contours */}
          <g opacity={basemapMode === 'terrain' ? '0.7' : resolvedTheme === 'dark' ? '0.18' : '0.25'} stroke={resolvedTheme === 'dark' ? '#475569' : '#94a3b8'} strokeWidth="0.8" fill="none">
            <path d="M 0 60 Q 250 100 500 50 T 1000 80" />
            <path d="M 0 130 Q 300 170 650 120 T 1000 150" />
            <path d="M 0 210 Q 400 250 700 200 T 1000 230" />
            <path d="M 0 330 Q 350 370 800 310 T 1000 350" />
            <path d="M 0 460 Q 280 490 600 450 T 1000 500" />
          </g>

          {/* DISTRICT CATCHMENT BOUNDARIES */}
          <g stroke={basemapMode === 'satellite' ? '#475569' : resolvedTheme === 'dark' ? '#334155' : '#cbd5e1'} strokeWidth="1" strokeDasharray="3 3" fill="none">
            {/* Dhemaji Boundary */}
            <path d="M 360 80 L 530 90 L 580 240 L 400 250 Z" />
            {/* Lakhimpur Boundary */}
            <path d="M 160 140 L 360 80 L 400 250 L 220 310 Z" />
            {/* Majuli Island Boundary */}
            <path d="M 280 320 C 370 290, 430 330, 420 390 C 370 420, 290 400, 270 350 Z" />
            {/* Dibrugarh Boundary */}
            <path d="M 500 250 L 680 230 L 710 380 L 520 400 Z" />
            {/* Tinsukia Boundary */}
            <path d="M 680 110 L 880 120 L 890 320 L 710 300 Z" />
            {/* Barpeta Boundary */}
            <path d="M 40 380 L 190 360 L 210 500 L 60 520 Z" />
            {/* Cachar Boundary */}
            <path d="M 200 490 L 370 480 L 390 630 L 220 640 Z" />
          </g>

          {/* Sandbars (Chaporis) in River Stem */}
          <g fill={basemapMode === 'satellite' ? '#334155' : '#e2ead7'} stroke={basemapMode === 'satellite' ? '#475569' : '#d1dfc2'} strokeWidth="1">
            <path d="M 70 360 C 110 350, 180 370, 190 390 C 180 410, 110 420, 70 395 Z" />
            <path d="M 270 320 C 360 300, 430 330, 410 380 C 360 410, 290 390, 260 350 Z" />
            <path d="M 520 380 C 580 370, 640 390, 630 420 C 580 440, 520 430, 510 400 Z" />
          </g>

          {/* MAIN BRAHMAPUTRA RIVER TRUNK */}
          <path
            d="M 0 420 Q 180 430 350 400 T 680 410 T 1000 450 L 1000 500 Q 720 460 380 470 T 0 490 Z"
            fill={basemapMode === 'satellite' ? '#0f3d63' : '#bde0fe'}
            stroke={basemapMode === 'satellite' ? '#0284c7' : '#60a5fa'}
            strokeWidth="2"
          />

          {/* MAJOR TRIBUTARIES */}
          {/* Subansiri River */}
          <path d="M 120 0 Q 160 120 220 220 T 360 380" fill="none" stroke={basemapMode === 'satellite' ? '#0284c7' : '#93c5fd'} strokeWidth="4" />
          <text x="170" y="160" fill="#0284c7" fontSize="10" fontWeight="600" fontStyle="italic">Subansiri River</text>

          {/* Jiadhal River (Directly inundating Dhemaji) */}
          <path d="M 440 0 Q 430 110 420 180 T 400 290 T 350 390" fill="none" stroke="#0284c7" strokeWidth="5.5" />
          <text x="435" y="80" fill="#0369a1" fontSize="11" fontWeight="700" fontStyle="italic">Jiadhal River (Braided Flash Channel)</text>

          {/* Beki & Manas River */}
          <path d="M 90 280 Q 110 360 140 430" fill="none" stroke="#60a5fa" strokeWidth="3.5" />

          {/* Lohit & Dibang */}
          <path d="M 850 0 Q 800 120 740 220 T 680 410" fill="none" stroke="#60a5fa" strokeWidth="4" />

          {/* Barak River */}
          <path d="M 220 540 Q 280 550 350 560" fill="none" stroke="#60a5fa" strokeWidth="4" />

          {/* HISTORICAL FLOOD EXTENT (2022/2024 Reference Layer) */}
          {showHistorical && (
            <g stroke="#9333ea" strokeWidth="1.5" strokeDasharray="5 3" fill="#a855f7" fillOpacity="0.12">
              <path d="M 330 140 C 460 110, 540 170, 510 270 C 440 320, 340 300, 310 200 Z" />
              <text x="490" y="220" fill="#7e22ce" fontSize="10" fontWeight="bold" fontFamily="monospace">
                2024 Monsoonal Peak Flood Line
              </text>
            </g>
          )}

          {/* DOPPLER RADAR ISOHYET CONCENTRIC RINGS */}
          {showDoppler && (
            <g>
              <circle cx="440" cy="180" r="180" fill="url(#dopplerGradient)" />
              <circle cx="440" cy="180" r="140" fill="none" stroke="#ea580c" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="440" cy="180" r="80" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.8" />
              <text x="450" y="110" fill="#991b1b" fontSize="10" fontWeight="bold">
                Doppler Rain Core: 245mm/24h
              </text>
            </g>
          )}

          {/* POPULATION DENSITY EXPOSURE GRID */}
          {showPopDensity && (
            <g fill="#f97316" opacity="0.4">
              {[380, 400, 420, 440, 460, 480, 500].map((x) =>
                [160, 180, 200, 220, 240, 260].map((y) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
                ))
              )}
            </g>
          )}

          {/* FLOOD RISK POLYGONS (Translucent Hazard Zones with Smooth Framer Motion Yoyo Pulse) */}
          {showFloodRisk && (
            <g>
              {/* Dhemaji High Risk Polygon - Outer Pulsing Aura with Smooth Yoyo Loop */}
              <motion.path
                d="M 360 130 C 460 110, 530 160, 510 260 C 450 310, 360 280, 330 200 Z"
                fill="none"
                stroke="#ef4444"
                strokeDasharray="6 4"
                initial={{ strokeOpacity: 0.15, strokeWidth: 1.5 }}
                animate={{
                  strokeOpacity: 0.52,
                  strokeWidth: 3.2,
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 2.8,
                  ease: 'easeInOut',
                }}
              />
              {/* Dhemaji High Risk Polygon - Subtle Breathing Fill & Stroke with Smooth Yoyo Loop */}
              <motion.path
                d="M 360 130 C 460 110, 530 160, 510 260 C 450 310, 360 280, 330 200 Z"
                fill="#ef4444"
                stroke="#dc2626"
                initial={{ fillOpacity: 0.18, strokeOpacity: 0.70, strokeWidth: 1.5 }}
                animate={{
                  fillOpacity: 0.28,
                  strokeOpacity: 0.95,
                  strokeWidth: 2.2,
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 2.8,
                  ease: 'easeInOut',
                }}
              />

              {/* Majuli High Risk Polygon - Outer Pulsing Aura with Smooth Yoyo Loop */}
              <motion.path
                d="M 270 310 C 370 290, 430 320, 410 380 C 350 420, 280 400, 260 350 Z"
                fill="none"
                stroke="#ea580c"
                strokeDasharray="5 3"
                initial={{ strokeOpacity: 0.15, strokeWidth: 1.5 }}
                animate={{
                  strokeOpacity: 0.45,
                  strokeWidth: 2.8,
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 3.2,
                  delay: 0.3,
                  ease: 'easeInOut',
                }}
              />
              {/* Majuli High Risk Polygon - Subtle Breathing Fill & Stroke with Smooth Yoyo Loop */}
              <motion.path
                d="M 270 310 C 370 290, 430 320, 410 380 C 350 420, 280 400, 260 350 Z"
                fill="#ea580c"
                stroke="#c2410c"
                initial={{ fillOpacity: 0.16, strokeOpacity: 0.65, strokeWidth: 1.5 }}
                animate={{
                  fillOpacity: 0.25,
                  strokeOpacity: 0.90,
                  strokeWidth: 2.0,
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 3.2,
                  delay: 0.3,
                  ease: 'easeInOut',
                }}
              />

              {/* Lakhimpur Moderate Risk Polygon */}
              <path
                d="M 180 200 C 260 190, 320 230, 300 290 C 240 330, 170 300, 160 250 Z"
                fill="#f59e0b"
                fillOpacity="0.20"
                stroke="#d97706"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* PREDICTED INUNDATION OVERLAY (Water-Spread Polygons with Timeline Opacity) */}
          {showInundation && (
            <g filter="url(#flood-glow)">
              {/* Dhemaji Active Inundation Water-spread */}
              <path
                d="M 370 150 C 450 130, 515 175, 485 255 C 435 295, 365 275, 345 210 Z"
                fill="#38bdf8"
                fillOpacity={currentTimelineStep.inundationOpacity || 0.6}
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeDasharray="5 2"
              />

              {/* Water Wave Texture */}
              <path
                d="M 370 150 C 450 130, 515 175, 485 255 C 435 295, 365 275, 345 210 Z"
                fill="url(#water-wave)"
                opacity="0.45"
              />

              {/* Majuli Active Inundation Water-spread */}
              <path
                d="M 285 330 C 355 315, 415 340, 395 385 C 345 405, 290 385, 275 355 Z"
                fill="#38bdf8"
                fillOpacity={(currentTimelineStep.inundationOpacity || 0.6) * 0.9}
                stroke="#0284c7"
                strokeWidth="2"
              />

              {/* Inundation Path Vector Arrows */}
              <g stroke="#0369a1" strokeWidth="2" fill="none">
                <path d="M 430 150 L 405 195" markerEnd="url(#arrow)" />
                <path d="M 405 195 L 380 240" />
                <path d="M 380 240 L 360 270" />
              </g>
              <text x="365" y="195" fill="#0369a1" fontSize="10" fontWeight="bold" fontFamily="monospace">
                Surge Vector: Batgharia Breach → Moridhal Lowlands
              </text>
            </g>
          )}

          {/* ROADS & HIGHWAYS (With inundated sections highlighted) */}
          {showRoads && (
            <g>
              {/* NH-15 Trunk Line */}
              <path d="M 120 280 L 260 240 L 410 210 L 560 170 L 720 140" fill="none" stroke="#64748b" strokeWidth="3" />
              {/* Breached / Flooded NH-15 Section near Dhemaji */}
              <path d="M 380 215 L 440 205" fill="none" stroke="#ef4444" strokeWidth="4.5" strokeDasharray="4 2" />
              <text x="320" y="225" fill="#ef4444" fontSize="10" fontWeight="bold">
                NH-15 Water Overtopping (Batgharia)
              </text>

              {/* NH-37 South Bank */}
              <path d="M 80 460 L 320 440 L 550 430 L 760 410" fill="none" stroke="#64748b" strokeWidth="2.5" />
            </g>
          )}

          {/* CRITICAL INFRASTRUCTURE MARKERS (Hospitals, Schools, Bridges) */}
          {showHospitals && infraItems.filter(i => i.type === 'hospital').map((item) => (
            <g
              key={item.id}
              className="cursor-pointer group"
              onClick={() => setSelectedAsset(item)}
              transform={`translate(${item.coordinates.x}, ${item.coordinates.y})`}
            >
              <circle r="9" className={item.riskLevel === 'CRITICAL' ? 'fill-red-600' : 'fill-orange-500'} stroke="#ffffff" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">H</text>
              <text y="-12" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold" className="group-hover:block drop-shadow-sm">
                {item.name}
              </text>
            </g>
          ))}

          {showSchools && infraItems.filter(i => i.type === 'school').map((item) => (
            <g
              key={item.id}
              className="cursor-pointer group"
              onClick={() => setSelectedAsset(item)}
              transform={`translate(${item.coordinates.x}, ${item.coordinates.y})`}
            >
              <circle r="8" className={item.status.includes('Safe') ? 'fill-emerald-600' : 'fill-red-500'} stroke="#ffffff" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">S</text>
              <text y="-11" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">
                {item.name}
              </text>
            </g>
          ))}

          {showBridges && infraItems.filter(i => i.type === 'bridge').map((item) => (
            <g
              key={item.id}
              className="cursor-pointer group"
              onClick={() => setSelectedAsset(item)}
              transform={`translate(${item.coordinates.x}, ${item.coordinates.y})`}
            >
              <rect x="-8" y="-8" width="16" height="16" rx="3" className="fill-slate-800" stroke="#f59e0b" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">B</text>
            </g>
          ))}

          {/* CWC RIVER GAUGE STATIONS (Clickable with Live Stage Deltas) */}
          {showGauges && CWC_GAUGE_STATIONS.slice(0, 7).map((gauge, idx) => {
            const pos = [
              { x: 420, y: 180 }, // Jiadhal
              { x: 370, y: 380 }, // Nematighat
              { x: 250, y: 270 }, // Garamur
              { x: 570, y: 220 }, // Dibrugarh
              { x: 740, y: 170 }, // Dhola
              { x: 310, y: 440 }, // Tezpur
              { x: 190, y: 460 }, // Pandu
            ][idx] || { x: 400, y: 300 };

            const isRising = gauge.trend === 'rising';

            return (
              <g
                key={gauge.id}
                className="cursor-pointer group"
                onClick={() => setSelectedGauge(gauge)}
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                <circle r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="8" y="-12" width="70" height="20" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                <text x="12" y="1" fill="#0b1c30" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  {gauge.river}: {gauge.currentStage}m
                </text>
                <text x="68" y="1" fill={isRising ? '#dc2626' : '#16a34a'} fontSize="8" fontWeight="bold">
                  {isRising ? '▲' : '▼'}
                </text>
              </g>
            );
          })}

          {/* SECTOR DISTRICT CENTROIDS & PINS */}
          {Object.entries(ASSAM_SECTORS).map(([id, s]) => {
            const pos = sectorCoordinatesMap[id] || { x: 500, y: 300 };
            const isSelected = s.id === currentSector.id;
            const isCritical = s.hazardLevel === 'CRITICAL' || s.hazardLevel === 'HIGH';

            return (
              <g
                key={s.id}
                className="cursor-pointer group"
                onClick={() => onSelectSector(s.id)}
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                {/* Ping ring if selected */}
                {isSelected && (
                  <circle r="18" fill="none" stroke="#0284c7" strokeWidth="2" opacity="0.6">
                    <animate attributeName="r" values="12;24;12" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Subtle pulsing danger alert ring for Critical / High Hazard Zones using Framer Motion smooth yoyo loop */}
                {isCritical && !isSelected && (
                  <motion.circle
                    r={12}
                    fill="none"
                    stroke="#dc2626"
                    initial={{ r: 10, strokeOpacity: 0.58, strokeWidth: 1.6 }}
                    animate={{
                      r: 16,
                      strokeOpacity: 0.14,
                      strokeWidth: 0.8,
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: 'reverse',
                      duration: 2.4,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Pin Circle */}
                <circle
                  r={isSelected ? '9' : '6'}
                  fill={isCritical ? '#dc2626' : s.hazardLevel === 'MODERATE' ? '#d97706' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* District Label Tag */}
                <rect
                  x="-35"
                  y="12"
                  width="70"
                  height="18"
                  rx="3"
                  fill={isSelected ? '#0b1c30' : '#ffffff'}
                  stroke={isSelected ? '#0284c7' : '#94a3b8'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                />
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#0f172a'}
                  fontSize="9"
                  fontWeight="bold"
                >
                  {s.district}
                </text>
              </g>
            );
          })}
        </svg>

        {/* MAP POPUP CARD (When an Asset or Gauge is clicked) */}
        {selectedAsset && (
          <div className="absolute bottom-16 left-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-800 rounded-xl p-4 shadow-xl max-w-sm map-popup animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  selectedAsset.riskLevel === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300' :
                  selectedAsset.riskLevel === 'HIGH' ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300' :
                  'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {selectedAsset.type.toUpperCase()} • {selectedAsset.riskLevel} RISK
                </span>
                <h4 className="font-bold text-sm text-[#0b1c30] dark:text-slate-100 mt-1">{selectedAsset.name}</h4>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">Status:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedAsset.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">Distance from Inundation:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedAsset.distanceFromInundationM} meters</span>
              </div>
              {selectedAsset.capacityOrBeds && (
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500 dark:text-slate-400">Capacity:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedAsset.capacityOrBeds}</span>
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                {selectedAsset.details}
              </p>
            </div>
          </div>
        )}

        {/* GAUGE POPUP CARD (When CWC station is clicked) */}
        {selectedGauge && (
          <div className="absolute bottom-16 right-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-800 rounded-xl p-4 shadow-xl max-w-sm map-popup animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-transparent dark:border-sky-800/60">
                  CWC TELEMETRIC HYDRO-STATION
                </span>
                <h4 className="font-bold text-sm text-[#0b1c30] dark:text-slate-100 mt-1">{selectedGauge.name}</h4>
              </div>
              <button
                onClick={() => setSelectedGauge(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Current Stage:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedGauge.currentStage?.toFixed(2) ?? '0.00'} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Danger Level:</span>
                <span className="text-red-600 dark:text-red-400 font-bold">{selectedGauge.dangerLevel?.toFixed(2) ?? '0.00'} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Historical Peak (HFL):</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedGauge.highestFloodLevel?.toFixed(2) ?? '0.00'} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Trend & Flow:</span>
                <span className="font-bold uppercase text-sky-700 dark:text-sky-400">{selectedGauge.trend || 'Steady'} • {(selectedGauge.discharge ?? 0).toLocaleString()} m³/s</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM FLOATING TIMELINE SIMULATION CONTROLS (Phase 5) */}
      <div className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-4 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300/90 dark:border-slate-800/90 rounded-xl p-2.5 shadow-md transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Left: Playback & Active Time */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayback}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition ${
                isPlaying
                  ? 'bg-red-600 text-white'
                  : 'bg-[#0b1c30] dark:bg-sky-600 text-white hover:bg-slate-800 dark:hover:bg-sky-500'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
            </button>

            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100">{currentTimelineStep.label}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-1.5 hidden sm:inline">
                Inundation Extent: <strong className="text-slate-800 dark:text-slate-200">{currentTimelineStep.inundationAreaKm2} km²</strong>
              </span>
            </div>
          </div>

          {/* Center: Timeline Step Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {timelineSteps.map((hr) => {
              const isActive = forecastHour === hr;
              return (
                <button
                  key={hr}
                  onClick={() => onForecastHourChange && onForecastHourChange(hr)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition ${
                    isActive
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {hr === 0 ? 'Now' : `+${hr}h`}
                </button>
              );
            })}
          </div>

          {/* Right: Quick Inundation Metric Pill */}
          <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 hidden md:flex items-center gap-3">
            <span>Risk: <strong className="text-red-700 dark:text-red-400">{currentTimelineStep.riskScore}/100</strong></span>
            <span>Pop Exposed: <strong className="text-slate-800 dark:text-slate-200">{(currentTimelineStep.populationAtRisk / 1000).toFixed(0)}K</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
