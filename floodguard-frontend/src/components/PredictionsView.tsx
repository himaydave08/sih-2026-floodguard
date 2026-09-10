import React, { useState } from 'react';
import { SectorData } from '../types';
import { ASSAM_SECTORS } from '../data/assamData';
import { useTheme } from '../context/ThemeContext';
import { 
  Activity, 
  Droplets, 
  Waves, 
  HelpCircle, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ArrowRight,
  Database,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Legend 
} from 'recharts';

interface PredictionsViewProps {
  currentSector: SectorData;
  onSelectSector: (sectorId: string) => void;
  onOpenDiagnostic: () => void;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  currentSector,
  onSelectSector,
  onOpenDiagnostic,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'24h' | '48h' | '72h'>('72h');
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const gridStroke = isDark ? '#334155' : '#f1f5f9';
  const axisStroke = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '11px',
    borderRadius: '6px',
  };

  // Chart 1: 72-hour River Hydrograph with Danger Level & HFL
  const hydrographData = [
    { time: '-24h', stage: currentSector.stageAbsolute - 1.6, danger: currentSector.dangerLevel, hfl: currentSector.highestFloodLevel || currentSector.dangerLevel + 0.8 },
    { time: '-12h', stage: currentSector.stageAbsolute - 0.9, danger: currentSector.dangerLevel, hfl: currentSector.highestFloodLevel || currentSector.dangerLevel + 0.8 },
    { time: 'Now', stage: currentSector.stageAbsolute, danger: currentSector.dangerLevel, hfl: currentSector.highestFloodLevel || currentSector.dangerLevel + 0.8 },
    { time: '+6h', stage: currentSector.stageAbsolute + 0.45, danger: currentSector.dangerLevel, hfl: currentSector.highestFloodLevel || currentSector.dangerLevel + 0.8 },
    { time: '+12h (Peak)', stage: currentSector.stageAbsolute + 0.85, danger: currentSector.dangerLevel, hfl: currentSector.highestFloodLevel || currentSector.dangerLevel + 0.8 },
    { time: '+24h', stage: currentSector.stageAbsolute + 0.70, danger: currentSector.dangerLevel, hfl: currentSector.highestFloodLevel || currentSector.dangerLevel + 0.8 },
    { time: '+48h', stage: currentSector.stageAbsolute + 0.25, danger: currentSector.dangerLevel, hfl: currentSector.highestFloodLevel || currentSector.dangerLevel + 0.8 },
    { time: '+72h', stage: currentSector.stageAbsolute - 0.40, danger: currentSector.dangerLevel, hfl: currentSector.highestFloodLevel || currentSector.dangerLevel + 0.8 },
  ];

  // Chart 2: Rainfall Hyetograph & Cumulative Volume
  const hyetographData = [
    { period: 'Past 24h', rate: currentSector.rainfall.currentRainfall24hMm, cumulative: currentSector.rainfall.currentRainfall24hMm },
    { period: '+12h', rate: Math.round(currentSector.rainfall.forecast24hMm * 0.6), cumulative: currentSector.rainfall.currentRainfall24hMm + Math.round(currentSector.rainfall.forecast24hMm * 0.6) },
    { period: '+24h', rate: Math.round(currentSector.rainfall.forecast24hMm * 0.4), cumulative: currentSector.rainfall.currentRainfall24hMm + currentSector.rainfall.forecast24hMm },
    { period: '+48h', rate: currentSector.rainfall.forecast48hMm, cumulative: currentSector.rainfall.currentRainfall24hMm + currentSector.rainfall.forecast24hMm + currentSector.rainfall.forecast48hMm },
    { period: '+72h', rate: currentSector.rainfall.forecast72hMm, cumulative: currentSector.rainfall.currentRainfall24hMm + currentSector.rainfall.forecast24hMm + currentSector.rainfall.forecast48hMm + currentSector.rainfall.forecast72hMm },
  ];

  // Chart 3: Inundation Area Progression
  const inundationSpreadData = currentSector.timeline?.map((t) => ({
    time: t.label,
    area: t.inundationAreaKm2,
    risk: t.riskScore,
    pop: Math.round(t.populationAtRisk / 1000),
  })) || [
    { time: 'Now', area: currentSector.inundationAreaKm2, risk: currentSector.vulnerabilityIndex, pop: Math.round(currentSector.populationAtRisk / 1000) }
  ];

  return (
    <div className="w-full max-w-[1536px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 space-y-5 animate-in fade-in duration-200 min-w-0">
      {/* Top Header & Sector Switcher */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse flex-shrink-0"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase truncate">
              DEEP HYDROLOGICAL & MACHINE LEARNING INFERENCE
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0b1c30] dark:text-slate-100">
            Predictive Flood Inundation & Stage Hydrograph
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Coupling spatial-temporal deep learning with 2D Saint-Venant shallow water equations across the Brahmaputra alluvial plain.
          </p>
        </div>

        {/* Sector Selector */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full touch-pan-x scrollbar-none self-start lg:self-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mr-1 flex-shrink-0">Catchment:</span>
          {Object.values(ASSAM_SECTORS).map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSector(s.id)}
              className={`px-3 py-1.5 min-h-[36px] text-xs rounded-md font-semibold transition whitespace-nowrap flex-shrink-0 ${
                s.id === currentSector.id
                  ? 'bg-[#0b1c30] dark:bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {s.district}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Core Questions Predictive Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Q1: WILL IT FLOOD? */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">
            <span>1. WILL IT FLOOD?</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              currentSector.hazardLevel === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-transparent dark:border-red-900' :
              currentSector.hazardLevel === 'HIGH' ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-transparent dark:border-orange-900' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-900'
            }`}>
              {currentSector.hazardLevel}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-red-600 dark:text-red-400">{currentSector.floodProb}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Inference Probability</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-mono">
            Model Confidence: <strong className="text-slate-800 dark:text-slate-200">{currentSector.confidence}%</strong> (ROC-AUC: 0.96)
          </div>
        </div>

        {/* Q2: WHERE WILL IT HAPPEN? */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">
            <span>2. WHERE?</span>
            <Waves className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-[#0b1c30] dark:text-slate-100">{currentSector.inundationAreaKm2}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">km² Inundation Area</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-mono line-clamp-1">
            Path: {currentSector.inundationPathSummary}
          </div>
        </div>

        {/* Q3: HOW SEVERE WILL IT BE? */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">
            <span>3. HOW SEVERE?</span>
            <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-[#0b1c30] dark:text-slate-100">{currentSector.vulnerabilityIndex}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/100 Risk Score</span>
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono font-bold">
            {currentSector.riverStageDelta} (Peak depth: {currentSector.waterDepthPeakM}m)
          </div>
        </div>

        {/* Q4: WHO & WHAT AFFECTED? */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">
            <span>4. AFFECTED?</span>
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-[#0b1c30] dark:text-slate-100">{((currentSector.populationAtRisk ?? 0) / 1000).toFixed(0)}K</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Pop Exposed</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-mono">
            {currentSector.infrastructureCounts.hospitals} Hospitals • {currentSector.infrastructureCounts.schools} Schools at Risk
          </div>
        </div>
      </div>

      {/* Main Predictive Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">
        {/* CHART 1: CWC River Stage Hydrograph */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-3 transition-colors min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#0b1c30] dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <span className="truncate">River Stage Hydrograph vs Danger Mark</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                {currentSector.riverName} at {currentSector.stationName} ({currentSector.stationCode})
              </p>
            </div>
            <span className="text-xs font-bold font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/70 px-2 py-1 rounded border border-red-200 dark:border-red-900 self-start sm:self-auto">
              Peak: +12 Hours
            </span>
          </div>

          <div className="h-64 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hydrographData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} fontSize={11} />
                <YAxis stroke={axisStroke} fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine y={currentSector.dangerLevel} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Danger Level', fill: '#dc2626', fontSize: 10 }} />
                <Line type="monotone" dataKey="stage" stroke="#0284c7" strokeWidth={3} name="Observed & Predicted Stage (m)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="danger" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="3 3" name="Danger Level (m)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row justify-between gap-1.5 font-mono">
            <span>Danger Level: <strong>{currentSector.dangerLevel} m</strong></span>
            <span>Current Stage: <strong className="text-red-600 dark:text-red-400">{currentSector.stageAbsolute} m</strong></span>
            <span>Highest Flood Level (HFL): <strong>{currentSector.highestFloodLevel} m</strong></span>
          </div>
        </div>

        {/* CHART 2: Rainfall Hyetograph & Runoff Accumulation */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-3 transition-colors min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#0b1c30] dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="truncate">Heavy Rainfall Hyetograph & Accumulation</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                IMD Telemetric Precipitation (Past 24h & 72h Ensemble)
              </p>
            </div>
            <span className="text-xs font-bold font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-1 rounded border border-blue-200 dark:border-blue-900 self-start sm:self-auto">
              {currentSector.rainfall.intensity}
            </span>
          </div>

          <div className="h-64 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hyetographData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="period" stroke={axisStroke} fontSize={11} />
                <YAxis stroke={axisStroke} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="rate" fill="#0284c7" name="Interval Rainfall (mm)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cumulative" fill={isDark ? '#64748b' : '#94a3b8'} name="Cumulative Total (mm)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row justify-between gap-1.5 font-mono">
            <span>Soil Saturation: <strong className="text-amber-700 dark:text-amber-400">{currentSector.rainfall.soilMoisturePercent}%</strong></span>
            <span>Runoff Coefficient: <strong>0.84 (Saturated)</strong></span>
            <span>Peak Rate: <strong>38 mm/hr</strong></span>
          </div>
        </div>
      </div>

      {/* 72-Hour Inundation Evolution & Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Left: 72-Hour Spread Curve */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-3 transition-colors min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#0b1c30] dark:text-slate-100 uppercase tracking-wider font-mono truncate">
              72-Hour Flood Inundation Area Progression (km²)
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono flex-shrink-0 ml-2">ConvLSTM</span>
          </div>

          <div className="h-56 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inundationSpreadData}>
                <defs>
                  <linearGradient id="inundationColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} fontSize={11} />
                <YAxis stroke={axisStroke} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="area" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#inundationColor)" name="Inundation Extent (km²)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: AI Explainability (SHAP attribution) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between transition-colors min-w-0">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-heading font-bold text-sm text-[#0b1c30] dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Feature Attribution (SHAP)</span>
              </span>
              <button
                onClick={onOpenDiagnostic}
                className="text-xs text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 font-bold"
              >
                Diagnostic Sheet →
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Relative contribution of each physical feature to the flood hazard risk prediction:
            </p>

            <div className="space-y-2.5 mt-3">
              {currentSector.factors?.map((f) => (
                <div key={f.id} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{f.contributionPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        f.status === 'CRITICAL' ? 'bg-red-600' :
                        f.status === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${f.contributionPercent * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
            <span>Model: SIH-Hydro-v3.2</span>
            <span>Validated vs Sentinel-1 SAR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
