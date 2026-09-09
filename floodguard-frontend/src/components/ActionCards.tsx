import React from 'react';
import {
  FileText,
  Droplets,
  BatteryCharging,
  ShieldCheck,
  AlertOctagon,
  ZapOff,
  Radio,
  Building,
  Info,
  Download,
  Phone,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/assamData';

interface ActionCardsProps {
  onOpenGuideModal: () => void;
  onCallNumber: (number: string) => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  onOpenGuideModal,
  onCallNumber,
}) => {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 01: Before Inundation Hits */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            {/* Header badges */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="w-7 h-7 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-extrabold text-xs flex items-center justify-center font-mono">
                01
              </span>
              <span className="px-2.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-bold tracking-wide uppercase">
                Immediate Action
              </span>
            </div>

            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0b1c30] dark:text-slate-100 mt-3.5 mb-4">
              Before Inundation Hits
            </h3>

            {/* Checklist items */}
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <span>
                  Pack Aadhaar, land deeds, and ration cards into airtight waterproof poly-sleeves.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <span>
                  Store 72 hours of sealed clean drinking water, chlorine tablets, and dry roasted grains.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <BatteryCharging className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <span>
                  Charge handsets, high-drain torchlights, and battery power banks fully right now.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <span>
                  Untie domestic cattle and livestock; shift them to raised earth embankments (high bunds).
                </span>
              </li>
            </ul>
          </div>

          {/* Bottom callout advice */}
          <div className="mt-5 p-3 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 text-sky-900 dark:text-sky-200 flex items-center gap-2.5 text-xs font-medium">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span>Do not wait for water to enter courtyard before moving.</span>
          </div>
        </div>

        {/* Card 02: During Active Spate */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            {/* Header badges */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="w-7 h-7 rounded bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-extrabold text-xs flex items-center justify-center font-mono">
                02
              </span>
              <span className="px-2.5 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-[11px] font-bold tracking-wide uppercase">
                Active Survival
              </span>
            </div>

            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0b1c30] dark:text-slate-100 mt-3.5 mb-4">
              During Active Spate
            </h3>

            {/* Checklist items */}
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Never walk or swim through flowing water.</strong> 15 cm of moving water can knock an adult down.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <ZapOff className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  Strictly stay clear of severed transformers, electrical lines, and flooded iron lampposts.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Radio className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  Tune AM transistor to All India Radio Guwahati / DD Assam for broadcast siren notices.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Building className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  If trapped, climb to reinforced roof slabs. Signal rescuers with brightly colored cloths.
                </span>
              </li>
            </ul>
          </div>

          {/* Bottom callout warning */}
          <div className="mt-5 p-3 rounded bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900 text-red-900 dark:text-red-200 flex items-center gap-2.5 text-xs font-medium">
            <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>Turn Around, Don't Drown. Vehicles easily float in 30cm flow.</span>
          </div>
        </div>

        {/* Card 03: Emergency Hotlines & Dispatch */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1 transition-colors">
          <div>
            {/* Header badges */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center font-mono">
                03
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold tracking-wide uppercase">
                Field Dispatch
              </span>
            </div>

            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0b1c30] dark:text-slate-100 mt-3.5 mb-4">
              Emergency Hotlines
            </h3>

            {/* Contacts list */}
            <div className="space-y-2.5">
              {EMERGENCY_CONTACTS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onCallNumber(item.numbers[0])}
                  className="p-2.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-sky-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">{item.available}</div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-sky-400 transition-colors">
                    <span>{item.numbers.join(' / ')}</span>
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-700 dark:group-hover:text-sky-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download Guide Button */}
          <div className="mt-5">
            <button
              onClick={onOpenGuideModal}
              id="download-offline-guide-btn"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-[#eff4ff] dark:bg-sky-950/60 hover:bg-sky-100/80 dark:hover:bg-sky-900/60 active:bg-sky-200 text-[#006398] dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs sm:text-sm font-semibold tracking-wide transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Offline Bodo & Assamese Guides</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
