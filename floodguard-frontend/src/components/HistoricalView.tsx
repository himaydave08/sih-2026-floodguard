import React, { useState } from 'react';
import { HISTORICAL_DATA } from '../data/assamData';
import { HistoricalYearRecord } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  Clock, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Waves, 
  Droplets, 
  AlertTriangle, 
  FileText, 
  Download,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ComposedChart 
} from 'recharts';

export const HistoricalView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
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

  const activeRecord = HISTORICAL_DATA.find((d) => d.year === selectedYear) || HISTORICAL_DATA[0];

  // Chart data: Rainfall vs Inundation Area
  const correlationData = HISTORICAL_DATA.map((d) => ({
    year: d.year.toString(),
    rainfallMm: d.monsoonRainfallMm,
    inundationKm2: d.floodInundationAreaKm2,
    populationM: Number((d.affectedPopulationTotal / 1000000).toFixed(2)),
    damagesCr: d.damagesCrInr,
  }));

  return (
    <div className="w-full max-w-[1536px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 space-y-5 animate-in fade-in duration-200 min-w-0">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 flex-shrink-0"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase truncate">
              ASSAM FLOOD TELEMETRY ARCHIVE • 2018–2025
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0b1c30] dark:text-slate-100">
            Historical Flood Analysis & Recurrence
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Correlating annual monsoonal rainfall precipitation with flood inundation extent, human displacement, and infrastructure damage across the Brahmaputra valley.
          </p>
        </div>

        {/* Year Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full touch-pan-x scrollbar-none self-start md:self-auto">
          {HISTORICAL_DATA.map((d) => (
            <button
              key={d.year}
              onClick={() => setSelectedYear(d.year)}
              className={`px-3 py-1.5 min-h-[36px] text-xs font-bold font-mono rounded-md transition whitespace-nowrap flex-shrink-0 ${
                selectedYear === d.year
                  ? 'bg-[#0b1c30] dark:bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {d.year}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Year Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-[#0b1c30] dark:text-slate-100 font-heading">{activeRecord.year} Monsoonal Flood Event</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase font-mono ${
                (activeRecord.severityCategory || 'Severe') === 'Catastrophic' ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-transparent dark:border-red-900' :
                (activeRecord.severityCategory || 'Severe') === 'Severe' ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-transparent dark:border-orange-900' :
                'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-900'
              }`}>
                {activeRecord.severityCategory || 'Severe'} Severity
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Peak Month: {activeRecord.peakMonth || 'July - August'} • Districts Impacted: {activeRecord.affectedDistrictsCount || activeRecord.districtsAffectedCount} of 35
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-500 dark:text-slate-400">
            <div>Economic Damage Estimate</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">₹{(activeRecord.damagesCrInr ?? 0).toLocaleString()} Cr</div>
          </div>
        </div>

        {/* 4 Key Historical Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">Monsoon Rainfall</div>
            <div className="text-xl font-extrabold text-blue-700 dark:text-blue-400 font-mono mt-1">{activeRecord.monsoonRainfallMm} mm</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Basin Average</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">Inundation Extent</div>
            <div className="text-xl font-extrabold text-sky-700 dark:text-sky-400 font-mono mt-1">{(activeRecord.floodInundationAreaKm2 ?? 0).toLocaleString()} km²</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Submerged Area</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">People Affected</div>
            <div className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100 font-mono mt-1">{(((activeRecord.affectedPopulationTotal ?? 0) / 1000000)).toFixed(2)} Million</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{activeRecord.affectedDistrictsCount || activeRecord.districtsAffectedCount} Districts</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">Embankment Breaches</div>
            <div className="text-xl font-extrabold text-red-700 dark:text-red-400 font-mono mt-1">{activeRecord.embankmentBreachesCount || 18} Dykes</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Reported Failures</div>
          </div>
        </div>

        {/* Historical Narrative */}
        <div className="mt-4 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-slate-100 uppercase font-mono text-[11px] block mb-1">Key Hydrological Drivers & Post-Event Assessment:</strong>
          {activeRecord.summaryNarrative || activeRecord.keyEvents}
        </div>
      </div>

      {/* Historical Longitudinal Trends & Correlation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">
        {/* CHART 1: Rainfall vs Inundation Spread Correlation */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-3 transition-colors min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#0b1c30] dark:text-slate-100 uppercase tracking-wider font-mono truncate">
              Rainfall (mm) vs Inundation Area (km²)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex-shrink-0 ml-2">2018–2024</span>
          </div>

          <div className="h-64 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="year" stroke={axisStroke} fontSize={11} />
                <YAxis yAxisId="left" stroke="#0284c7" fontSize={11} label={{ value: 'Inundation (km²)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#0284c7' }} />
                <YAxis yAxisId="right" orientation="right" stroke={axisStroke} fontSize={11} label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', fontSize: 10, fill: axisStroke }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar yAxisId="left" dataKey="inundationKm2" fill="#38bdf8" name="Inundation Area (km²)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="rainfallMm" stroke={isDark ? '#60a5fa' : '#0f172a'} strokeWidth={2} name="Monsoon Rain (mm)" dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center">
            Notice how embankment failure in 2022 and 2024 amplified inundation area even with moderate rain anomalies.
          </div>
        </div>

        {/* CHART 2: Population Affected & Damages Trend */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-3 transition-colors min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#0b1c30] dark:text-slate-100 uppercase tracking-wider font-mono truncate">
              Affected Population (Millions) & Economic Damage
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex-shrink-0 ml-2">INR Crores</span>
          </div>

          <div className="h-64 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="year" stroke={axisStroke} fontSize={11} />
                <YAxis stroke={axisStroke} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="populationM" fill="#ef4444" name="Exposed Pop (Millions)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="damagesCr" fill="#f59e0b" name="Damage (₹ Cr)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center">
            2022 marked the highest urban economic loss due to the Barak Valley Silchar deluge.
          </div>
        </div>
      </div>
    </div>
  );
};
