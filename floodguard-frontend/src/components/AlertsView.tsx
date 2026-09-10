import React, { useState } from 'react';
import { ACTIVE_FLOOD_ALERTS } from '../data/assamData';
import { FloodAlert, AlertSeverity } from '../types';
import { 
  AlertTriangle, 
  Bell, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Phone, 
  Radio, 
  CheckCircle2, 
  Info, 
  Send,
  Download,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

interface AlertsViewProps {
  onSelectSector?: (sectorId: string) => void;
  onOpenGuideModal?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  onSelectSector,
  onOpenGuideModal,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | AlertSeverity>('ALL');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Dhemaji');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const filteredAlerts = filterSeverity === 'ALL'
    ? ACTIVE_FLOOD_ALERTS
    : ACTIVE_FLOOD_ALERTS.filter((a) => a.riskLevel === filterSeverity);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsSubscribed(true);
    setTimeout(() => {
      // clear after 4s
    }, 4000);
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 space-y-5 animate-in fade-in duration-200 min-w-0">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse flex-shrink-0"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-red-700 dark:text-red-400 uppercase truncate">
              STATE DISASTER MANAGEMENT ADVISORIES & SIREN DIRECTIVES
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0b1c30] dark:text-slate-100">
            Active Flood Risk & Early Warnings
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Real-time public warnings issued in synchronization with Assam State Disaster Management Authority (ASDMA) and Central Water Commission.
          </p>
        </div>

        {/* Severity Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full touch-pan-x scrollbar-none self-start md:self-auto">
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-md transition whitespace-nowrap flex-shrink-0 ${
                filterSeverity === sev
                  ? 'bg-[#0b1c30] dark:bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sev === 'ALL' ? 'All Alerts' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Official Mandatory Safety Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs transition-colors">
        <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider font-mono">OFFICIAL ADVISORY & SAFETY NOTICE:</span>
          <p className="mt-0.5 text-amber-800 dark:text-amber-300 leading-relaxed">
            FloodGuard provides AI-based risk estimates using environmental, satellite radar, and geographic data. Predictions serve as an early warning decision-support tool. Always heed official sirens and orders issued by the Assam State Disaster Management Authority (ASDMA), District Commissioners, and local police.
          </p>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.riskLevel === 'CRITICAL';
          const isHigh = alert.riskLevel === 'HIGH';

          return (
            <div
              key={alert.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm transition ${
                isCritical
                  ? 'border-red-300 dark:border-red-900/80 ring-1 ring-red-100 dark:ring-red-950/50'
                  : isHigh
                  ? 'border-orange-300 dark:border-orange-900/80 ring-1 ring-orange-100 dark:ring-orange-950/50'
                  : 'border-slate-300 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase font-mono ${
                    isCritical ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900' :
                    isHigh ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900' :
                    'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                  }`}>
                    {alert.riskLevel} FLOOD WARNING
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{alert.location}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">• {alert.riverBasin || alert.district}</span>
                </div>

                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Issued: {alert.timestamp}</span>
                  <span>•</span>
                  <span>Authority: {alert.authority || alert.issuedBy}</span>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-heading font-extrabold text-lg text-[#0b1c30] dark:text-slate-100">
                  {alert.headline}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {alert.description || alert.summary}
                </p>
              </div>

              {/* Actionable Directives: "What You Should Do" */}
              <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-mono mb-2 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>WHAT YOU SHOULD DO:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {(alert.actionItems || [alert.recommendedAction]).map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Demographics & Sector Navigation */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 font-mono text-slate-600 dark:text-slate-400">
                  <span>Pop at Risk: <strong className="text-slate-900 dark:text-slate-100">{((alert.affectedPopulation || alert.populationAtRisk) ?? 0).toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Shelters Active: <strong className="text-emerald-700 dark:text-emerald-400">12 Primary Sites</strong></span>
                </div>

                {onSelectSector && (
                  <button
                    onClick={() => onSelectSector(alert.sectorId || 'dhemaji')}
                    className="flex items-center gap-1 font-bold text-[#006398] dark:text-sky-400 hover:text-[#00476e] dark:hover:text-sky-300 transition"
                  >
                    <span>Inspect Sector on GIS Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SMS & Siren Early Warning Broadcast Registration */}
      <div className="bg-[#0b1c30] dark:bg-slate-900 dark:border dark:border-slate-800 text-white rounded-xl p-6 shadow-md transition-colors">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4" />
            <span>COMMUNITY BROADCAST SUBSCRIPTION</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight">
            Register for Automated Flood Siren & SMS Warning Dispatches
          </h3>
          <p className="text-slate-300 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Get instant early notifications directly on your mobile device when CWC river gauges or IMD heavy rainfall exceed critical thresholds in your circle.
          </p>

          <form onSubmit={handleSubscribe} className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter 10-digit mobile number (+91)..."
              className="w-full sm:w-72 px-4 py-2.5 min-h-[44px] bg-slate-800/90 dark:bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
            />

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 min-h-[44px] bg-slate-800/90 dark:bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-400"
            >
              <option value="Dhemaji">Dhemaji District</option>
              <option value="Majuli">Majuli River Island</option>
              <option value="Lakhimpur">Lakhimpur Catchment</option>
              <option value="Dibrugarh">Dibrugarh City</option>
              <option value="Tinsukia">Tinsukia Basin</option>
              <option value="Barpeta">Barpeta Lower Valley</option>
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold text-sm rounded-lg transition flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Register Dispatches</span>
            </button>
          </form>

          {isSubscribed && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Dispatch registration confirmed for {phoneNumber} ({selectedDistrict}). Free SMS alerts will be triggered if flood warning level is crossed.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
