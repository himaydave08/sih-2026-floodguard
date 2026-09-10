import React, { useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import { SectorInspector } from './SectorInspector';
import { SectorData } from '../types';
import { ASSAM_SECTORS } from '../data/assamData';
import { Clock, Waves, Compass, Layers, MapPin, Droplets, Users, ShieldAlert, Eye } from 'lucide-react';

interface FullMapViewProps {
  currentSector: SectorData;
  onSelectSector: (sectorId: string) => void;
  onOpenDiagnostic: () => void;
  onViewWeights: () => void;
}

export const FullMapView: React.FC<FullMapViewProps> = ({
  currentSector,
  onSelectSector,
  onOpenDiagnostic,
  onViewWeights,
}) => {
  const [forecastHour, setForecastHour] = useState<number>(0);

  return (
    <div className="w-full max-w-[1536px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 space-y-4 animate-in fade-in duration-200 min-w-0">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase truncate">
              GEOSPATIAL INUNDATION MAPPING SUITE • WGS-84
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0b1c30] dark:text-slate-100 mt-0.5">
            Brahmaputra Basin Flood & Inundation Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Toggle telemetry overlays, examine critical infrastructure exposure, and scrub the 72-hour flood inundation forecast.
          </p>
        </div>

        {/* Catchment quick switcher */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full touch-pan-x scrollbar-none self-start md:self-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mr-1 flex-shrink-0">Sector:</span>
          {Object.values(ASSAM_SECTORS).map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSector(s.id)}
              className={`px-2.5 py-1 min-h-[36px] text-xs rounded-md font-semibold transition whitespace-nowrap flex-shrink-0 ${
                s.id === currentSector.id
                  ? 'bg-[#0b1c30] dark:bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {s.district}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 8 cols Map + 4 cols Sector Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start min-w-0">
        <div className="lg:col-span-8 min-w-0 w-full">
          <InteractiveMap
            currentSector={currentSector}
            onSelectSector={onSelectSector}
            onOpenDiagnostic={onOpenDiagnostic}
            forecastHour={forecastHour}
            onForecastHourChange={setForecastHour}
          />
        </div>

        <div className="lg:col-span-4 min-w-0 w-full">
          <SectorInspector
            sector={currentSector}
            onOpenDiagnostic={onOpenDiagnostic}
            onViewWeights={onViewWeights}
          />
        </div>
      </div>

      {/* Map Layers Legend and GIS Guide */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Map Cartographic & Telemetric Symbology</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">Reference Scale: 1:50,000</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-red-500/50 border border-red-600"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Critical Risk Polygon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-sky-400/60 border border-sky-600 border-dashed"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Inundation Water Spread</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Hospital At Risk (H)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">School / Shelter (S)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-red-600 rounded"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Flooded Highway Segment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">CWC Telemetric Gauge</span>
          </div>
        </div>
      </div>
    </div>
  );
};
