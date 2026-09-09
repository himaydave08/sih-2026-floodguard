import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { InteractiveMap } from './components/InteractiveMap';
import { SectorInspector } from './components/SectorInspector';
import { AlertDirectiveBanner } from './components/AlertDirectiveBanner';
import { ActionCards } from './components/ActionCards';
import { ProximityMatrix } from './components/ProximityMatrix';
import { MethodologySection } from './components/MethodologySection';
import { Footer } from './components/Footer';
import { DiagnosticModal } from './components/DiagnosticModal';
import { ShelterModal } from './components/ShelterModal';
import { GuideModal } from './components/GuideModal';
import { FullMapView } from './components/FullMapView';
import { PredictionsView } from './components/PredictionsView';
import { ImpactView } from './components/ImpactView';
import { AlertsView } from './components/AlertsView';
import { HistoricalView } from './components/HistoricalView';
import { MethodologyView } from './components/MethodologyView';
import { ASSAM_SECTORS } from './data/assamData';
import { useGeolocation } from './hooks/useGeolocation';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('dhemaji');
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);
  const [isShelterOpen, setIsShelterOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [forecastHour, setForecastHour] = useState<number>(0);

  const currentSector = ASSAM_SECTORS[selectedSectorId] || ASSAM_SECTORS.dhemaji;

  const handleSelectSector = (id: string) => {
    if (ASSAM_SECTORS[id]) {
      setIsAnalyzing(true);
      setSelectedSectorId(id);
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 700);
    }
  };

  const { locationLoading, locationToast, handleUseLocation } = useGeolocation(handleSelectSector);

  const handleCallSeoc = () => {
    window.location.href = 'tel:1070';
  };

  const handleCallNumber = (num: string) => {
    window.location.href = `tel:${num.replace(/[^0-9]/g, '')}`;
  };

  const handleCheckMyRisk = () => {
    setActiveTab('overview');
    const input = document.getElementById('flood-risk-search-input');
    if (input) {
      input.focus();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 text-[#0b1c30] dark:text-slate-100 flex flex-col font-sans selection:bg-sky-200 selection:dark:bg-sky-900 transition-colors duration-200">
      {/* Top Authoritative Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCheckMyRisk={handleCheckMyRisk}
        onSearchSelect={handleSelectSector}
      />

      {/* Main Content Areas based on Tab */}
      <main className="flex-1">
        {/* Tab 1: Overview Command Center */}
        {activeTab === 'overview' && (
          <div className="pb-12 animate-in fade-in duration-200">
            {/* Location Toast — transient feedback for "Use My Location" */}
            {locationToast && (
              <div
                role="status"
                aria-live="polite"
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg border text-sm font-semibold max-w-sm w-full transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
                  locationToast.variant === 'error'
                    ? 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                    : locationToast.variant === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}
              >
                {locationToast.variant === 'error' && (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                {locationToast.variant === 'success' && (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                )}
                {locationToast.variant === 'warning' && (
                  <Info className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="flex-1">{locationToast.message}</span>
                <X className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              </div>
            )}

            {/* Hero Search Section with 4 Critical Questions Header Cards */}
            <HeroSearch
              currentSector={currentSector}
              onSelectSector={handleSelectSector}
              onUseLocation={handleUseLocation}
              locationLoading={locationLoading}
              isAnalyzing={isAnalyzing}
            />

            {/* Interactive Map & Active Sector Inspector Grid */}
            <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0b1c30] dark:text-slate-100 tracking-tight">
                  Brahmaputra Valley Flood Inundation & Risk Matrix
                </h2>
                <span className="px-2 py-0.5 rounded bg-sky-100/80 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-transparent dark:border-sky-800/50 font-mono font-bold text-xs">
                  BASIN: AS-BR-09 • {currentSector.district.toUpperCase()}
                </span>
              </div>

              {/* Map & Sector Inspector Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Left: Map Viewport (takes 8 cols on desktop) */}
                <div className="lg:col-span-8 flex flex-col">
                  <InteractiveMap
                    currentSector={currentSector}
                    onSelectSector={handleSelectSector}
                    onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
                    forecastHour={forecastHour}
                    onForecastHourChange={setForecastHour}
                  />
                </div>

                {/* Right: Active Sector Inspector (takes 4 cols) */}
                <div className="lg:col-span-4 flex flex-col">
                  <SectorInspector
                    sector={currentSector}
                    onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
                    onViewWeights={() => setIsDiagnosticOpen(true)}
                    onFocusImpact={() => setActiveTab('impact')}
                  />
                </div>
              </div>
            </div>

            {/* ASDMA Directive Banner */}
            <AlertDirectiveBanner
              sector={currentSector}
              onCallSeoc={handleCallSeoc}
              onOpenShelterMap={() => setIsShelterOpen(true)}
            />

            {/* 3-Column Action Cards */}
            <ActionCards
              onOpenGuideModal={() => setIsGuideOpen(true)}
              onCallNumber={handleCallNumber}
            />

            {/* Spatial Proximity Analytics (Neighboring Catchments) */}
            <ProximityMatrix
              currentSectorId={selectedSectorId}
              onSelectSector={handleSelectSector}
            />

            {/* How FloodGuard Predicts Hydrological Hazard */}
            <MethodologySection />
          </div>
        )}

        {/* Tab 2: Dedicated Full GIS Risk Map View */}
        {activeTab === 'map' && (
          <FullMapView
            currentSector={currentSector}
            onSelectSector={handleSelectSector}
            onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
            onViewWeights={() => setIsDiagnosticOpen(true)}
          />
        )}

        {/* Tab 3: Predictions View (Hydrograph, Hyetograph, SHAP explainability) */}
        {activeTab === 'predictions' && (
          <PredictionsView
            currentSector={currentSector}
            onSelectSector={handleSelectSector}
            onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
          />
        )}

        {/* Tab 4: Impact Assessment View (Demographics, Infrastructure, Shelters) */}
        {activeTab === 'impact' && (
          <ImpactView
            currentSector={currentSector}
            onSelectSector={handleSelectSector}
            onOpenShelterModal={() => setIsShelterOpen(true)}
          />
        )}

        {/* Tab 5: Alerts View (Active Public Directives & SMS Broadcast) */}
        {activeTab === 'alerts' && (
          <AlertsView
            onSelectSector={(id) => {
              handleSelectSector(id);
              setActiveTab('overview');
            }}
            onOpenGuideModal={() => setIsGuideOpen(true)}
          />
        )}

        {/* Tab 6: Historical Analysis View (2018–2025 Longitudinal Study) */}
        {activeTab === 'historical' && (
          <HistoricalView />
        )}

        {/* Tab 7: Methodology & Architecture View */}
        {activeTab === 'methodology' && (
          <MethodologyView />
        )}
      </main>

      {/* Institutional Advisory & Operational Footer */}
      <Footer
        onOpenMethodology={() => setActiveTab('methodology')}
        onOpenSafetyGuide={() => setIsGuideOpen(true)}
        onOpenTelemetry={() => setActiveTab('methodology')}
      />

      {/* Diagnostic Sheet Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        sector={currentSector}
      />

      {/* Shelter Map & Relief Camp Directory Modal */}
      <ShelterModal
        isOpen={isShelterOpen}
        onClose={() => setIsShelterOpen(false)}
        sector={currentSector}
      />

      {/* Offline Bilingual Survival Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
