import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, Droplets, MapPin, Users, HelpCircle, ShieldAlert, Waves, Flag } from 'lucide-react';
import { SectorData } from '../types';
import { DataInaccuracyModal } from './DataInaccuracyModal';

interface SectorInspectorProps {
  sector: SectorData;
  onOpenDiagnostic: () => void;
  onViewWeights: () => void;
  onFocusImpact?: () => void;
  onReportInaccuracy?: () => void;
}

export const SectorInspector: React.FC<SectorInspectorProps> = ({
  sector,
  onOpenDiagnostic,
  onViewWeights,
  onFocusImpact,
  onReportInaccuracy,
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const isCritical = sector.hazardLevel === 'CRITICAL';
  const isHigh = sector.hazardLevel === 'HIGH';
  const isMod = sector.hazardLevel === 'MODERATE';

  const accentColor = isCritical
    ? 'text-red-600'
    : isHigh
    ? 'text-orange-600'
    : isMod
    ? 'text-amber-600'
    : 'text-emerald-600';

  const strokeColor = isCritical
    ? '#dc2626'
    : isHigh
    ? '#ea580c'
    : isMod
    ? '#d97706'
    : '#059669';

  // Circular gauge
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (sector.vulnerabilityIndex / 100) * circumference;

  // Factors to display
  const displayFactors = sector.factors || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-col justify-between h-full transition-colors">
      <div>
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>INTELLIGENCE & RISK INSPECTOR</span>
          </span>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-[10px] font-extrabold tracking-wide uppercase">
            <span>ACTIVE FLOOD WATCH</span>
          </div>
        </div>

        {/* Sector Name & Technical Metadata */}
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading font-extrabold text-2xl tracking-tight text-[#0b1c30] dark:text-slate-100">
              {sector.district}
            </h2>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{sector.state}</span>
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
            <span>
              {sector.coordinates.lat.toFixed(4)}° N, {sector.coordinates.lng.toFixed(4)}° E
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{sector.stationCode}</span>
          </div>
        </div>

        {/* Vulnerability Index Score & Circular Gauge Container */}
        <div className="mt-3.5 p-3.5 rounded-lg bg-[#f8faff] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              COMPOSITE FLOOD RISK SCORE
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`font-heading font-extrabold text-4xl tracking-tight ${accentColor}`}>
                {sector.vulnerabilityIndex}
              </span>
              <span className="text-base font-medium text-slate-400 dark:text-slate-500">/100</span>
            </div>
            <div className={`text-xs font-bold tracking-wide uppercase mt-0.5 ${accentColor}`}>
              {sector.hazardLevel} RISK • {sector.statusSummary}
            </div>
          </div>

          {/* Circular Gauge */}
          <div className="relative w-18 h-18 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
              <circle
                cx="42"
                cy="42"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="42"
                cy="42"
                r={radius}
                stroke={strokeColor}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <AlertTriangle className={`w-3.5 h-3.5 ${accentColor} -mb-0.5`} />
              <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
                {sector.levelBadge}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Quick Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-md text-center">
          <div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">1. Will it Flood?</div>
            <div className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
              {sector.floodProb}%
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">{sector.confidence}% conf</div>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-800 pl-1">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">2. Where?</div>
            <div className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
              {sector.inundationAreaKm2} km²
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">Inundation</div>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-800 pl-1">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">3. Severity</div>
            <div className={`font-heading font-bold text-sm mt-0.5 font-mono ${accentColor}`}>
              {sector.riverStageDelta}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">Peak: {sector.waterDepthPeakM}m</div>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-800 pl-1">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">4. Affected</div>
            <div className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
              {((sector.populationAtRisk ?? 0) / 1000).toFixed(0)}K
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">{sector.infrastructureCounts.hospitals} Hospitals</div>
          </div>
        </div>

        {/* Explainability Section: "Why is this area at risk?" */}
        <div className="mt-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase font-mono">
                WHY IS THIS AREA AT RISK?
              </span>
            </div>
            <button
              onClick={onViewWeights}
              className="text-[11px] text-[#006398] dark:text-sky-400 hover:text-[#00476e] dark:hover:text-sky-300 font-semibold hover:underline"
            >
              Model Weights
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            AI/ML attribution showing contributing environmental and terrain features:
          </p>

          <div className="space-y-2">
            {displayFactors.slice(0, 4).map((factor) => {
              let barColor = 'bg-slate-700 dark:bg-slate-400';
              if (factor.status === 'CRITICAL') barColor = 'bg-red-600';
              else if (factor.status === 'HIGH') barColor = 'bg-orange-500';
              else if (factor.status === 'MODERATE') barColor = 'bg-amber-500';
              else barColor = 'bg-emerald-600';

              return (
                <div key={factor.id} className="p-2 rounded bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{factor.name}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{factor.contributionPercent}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{factor.observedValue}</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${factor.contributionPercent * 2}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3.5 mt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>IMD Doppler • CWC Telemetry</span>
          </div>

          <button
            onClick={onOpenDiagnostic}
            className="flex items-center gap-1 font-bold text-[#006398] dark:text-sky-400 hover:text-[#00476e] dark:hover:text-sky-300 transition-colors group text-xs"
          >
            <span>Full Diagnostic Sheet</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Subtle Human-in-the-loop Validation Action */}
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 dark:border-slate-800/80 text-[11px]">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span>Model feedback:</span>
          </span>
          <button
            type="button"
            id="btn-report-data-inaccuracy"
            onClick={() => {
              if (onReportInaccuracy) {
                onReportInaccuracy();
              } else {
                setIsReportModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium hover:underline text-[11px] group cursor-pointer"
            title="Submit ground truth feedback to improve model accuracy via human-in-the-loop validation"
          >
            <Flag className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            <span>Report Data Inaccuracy</span>
          </button>
        </div>
      </div>

      {/* Ground Truth Inaccuracy Modal */}
      <DataInaccuracyModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        sector={sector}
      />
    </div>
  );
};
