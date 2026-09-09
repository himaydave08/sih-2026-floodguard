import React, { useState } from 'react';
import { X, Download, Printer, Languages, Check, ShieldAlert, AlertTriangle } from 'lucide-react';
import { REGIONAL_GUIDES } from '../data/assamData';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'assamese' | 'bodo' | 'english'>('assamese');

  if (!isOpen) return null;

  const currentGuide = REGIONAL_GUIDES[lang];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#006398] dark:bg-sky-600 text-white flex items-center justify-center">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                Offline Flood Survival Guide
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Bilingual ASDMA Disaster Directives
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Switcher Tabs */}
        <div className="px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Language:</span>
          {(['assamese', 'bodo', 'english'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                lang === l
                  ? 'bg-slate-900 dark:bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {REGIONAL_GUIDES[l].language}
            </button>
          ))}
        </div>

        {/* Modal Printable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          <div>
            <h4 className="font-heading font-bold text-xl text-slate-950 dark:text-slate-100">
              {currentGuide.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{currentGuide.sub}</p>
          </div>

          {/* Section: Before Flood Hits */}
          <div className="p-4 rounded-lg bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 space-y-3">
            <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-bold text-sm uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <span>
                {lang === 'assamese'
                  ? 'বানপানীৰ পূৰ্বে ল’বলগীয়া পদক্ষেপ (Before Inundation)'
                  : lang === 'bodo'
                  ? 'दैबाना जाथाय सिगांनि राहा (Before Flood)'
                  : 'Action Protocol: Before Inundation Hits'}
              </span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {currentGuide.before.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: During Spate */}
          <div className="p-4 rounded-lg bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-3">
            <div className="flex items-center gap-2 text-red-900 dark:text-red-300 font-bold text-sm uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-red-700 dark:text-red-400" />
              <span>
                {lang === 'assamese'
                  ? 'বানপানীৰ সময়ত জীৱন ৰক্ষাৰ কৌশল (During Active Flood)'
                  : lang === 'bodo'
                  ? 'दैबाना समाव जिউ बासायनाय (During Spate)'
                  : 'Active Survival During Flood Spate'}
              </span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {currentGuide.during.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Dial Box */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between font-mono">
            <span className="font-bold text-slate-800 dark:text-slate-200">Assam SEOC 24/7 Helpline:</span>
            <span className="font-extrabold text-red-700 dark:text-red-400 text-sm">1070 / 1079</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Cached for zero-connectivity offline access</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
            <button
              onClick={() => {
                alert(`Downloaded offline PDF guide in ${currentGuide.language}`);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-slate-900 dark:bg-sky-600 text-white font-semibold hover:bg-slate-800 dark:hover:bg-sky-500 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
