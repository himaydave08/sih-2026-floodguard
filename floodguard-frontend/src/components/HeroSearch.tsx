import React, { useState, useRef, useEffect } from 'react';
import { Search, Navigation, AlertTriangle, CheckCircle2, ShieldAlert, Droplets, MapPin, Users, Sparkles, ExternalLink } from 'lucide-react';
import { ASSAM_SECTORS } from '../data/assamData';
import { SectorData } from '../types';

interface HeroSearchProps {
  currentSector: SectorData;
  onSelectSector: (sectorId: string) => void;
  onUseLocation: () => void;
  locationLoading?: boolean;
  isAnalyzing?: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  currentSector,
  onSelectSector,
  onUseLocation,
  locationLoading = false,
  isAnalyzing = false,
}) => {
  const [query, setQuery] = useState(`${currentSector.district}`);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(currentSector.district);
  }, [currentSector.id, currentSector.district]);

  const hotspots = [
    { id: 'dhemaji', label: 'Dhemaji', level: 'HIGH (82)', color: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/90' },
    { id: 'majuli', label: 'Majuli', level: 'HIGH (78)', color: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/90' },
    { id: 'lakhimpur', label: 'Lakhimpur', level: 'MOD (58)', color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950/90' },
    { id: 'dibrugarh', label: 'Dibrugarh', level: 'MOD (46)', color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950/90' },
    { id: 'barpeta', label: 'Barpeta', level: 'LOW (18)', color: 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/90' },
    { id: 'cachar', label: 'Cachar', level: 'LOW (19)', color: 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/90' },
  ];

  // Filter sectors for autocompletion
  const filteredSectors = Object.values(ASSAM_SECTORS).filter((s) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      s.district.toLowerCase().includes(q) ||
      s.stationName.toLowerCase().includes(q) ||
      s.riverName.toLowerCase().includes(q) ||
      s.affectedNeighborhoods.some(n => n.toLowerCase().includes(q))
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = filteredSectors[0];
    if (match) {
      onSelectSector(match.id);
      setQuery(match.district);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="pt-6 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1536px] mx-auto transition-colors">
      {/* Title & Core Purpose */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-transparent dark:border-sky-800/60 font-bold text-[11px] tracking-wider uppercase">
            AI &amp; Satellite Disaster Intelligence
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
            Multi-Source Inundation Early Warning
          </span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[38px] tracking-tight text-[#0b1c30] dark:text-slate-100 leading-tight">
          Heavy Rainfall & Flood Inundation Prediction Platform
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-4xl">
          Combining satellite synthetic aperture radar (SAR), CWC river tele-gauges, IMD Doppler rainfall, and SRTM 30m terrain physics to forecast inundation extent and human exposure.
        </p>
      </div>

      {/* Search Bar & Official Government Portal Badge Row */}
      <div className="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div className="w-full max-w-4xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 rounded-lg p-1.5 shadow-sm focus-within:border-sky-600 dark:focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 dark:focus-within:ring-sky-950 transition-all">
            <div className="flex items-center flex-1 px-3">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-2.5 flex-shrink-0" />
              <input
                ref={inputRef}
                id="flood-risk-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search your area, city, village or district (e.g. Dhemaji, Majuli, Lakhimpur)..."
                className="w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none bg-transparent py-1.5"
              />
            </div>

            <button
              type="submit"
              id="hero-check-flood-risk-btn"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0b1c30] hover:bg-[#1a2b42] dark:bg-sky-600 dark:hover:bg-sky-500 active:bg-[#020617] text-white font-semibold text-xs sm:text-sm rounded-md transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search Area</span>
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto"
            >
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                <span>Assam Districts & River Basins</span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">Click to Inspect</span>
              </div>
              {filteredSectors.map((sector) => {
                const isSelected = sector.id === currentSector.id;
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => {
                      onSelectSector(sector.id);
                      setQuery(sector.district);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800/70 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 ${isSelected ? 'bg-sky-50/80 dark:bg-slate-800 font-semibold' : ''
                      }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{sector.district}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">• {sector.riverName}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>{sector.stationCode}</span>
                        <span>|</span>
                        <span>Rain: {sector.rainfall.currentRainfall24hMm}mm</span>
                        <span>|</span>
                        <span>Pop: {((sector.populationAtRisk ?? 0) / 1000).toFixed(0)}K</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${sector.hazardLevel === 'CRITICAL' || sector.hazardLevel === 'HIGH'
                          ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                          : sector.hazardLevel === 'MODERATE'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          }`}
                      >
                        {sector.hazardLevel}: {sector.vulnerabilityIndex}/100
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Official Government Portal Badge */}
        <a
          href="https://asdma.assam.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-400/50 shadow-sm text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline transition-all flex-shrink-0 self-start lg:self-center"
        >
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse flex-shrink-0" />
          <span>Official Government Portal: ASDMA &amp; NDMA Disaster Management</span>
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
        </a>
      </div>

      {/* GPS Location & Quick Hotspot Pills */}
      <div className="mt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs max-w-5xl">
        {/* Left: GPS In-Browser Action */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={onUseLocation}
            id="use-current-location-btn"
            disabled={locationLoading}
            className="inline-flex items-center gap-1.5 font-semibold text-[#006398] dark:text-sky-300 hover:text-[#00476e] dark:hover:text-sky-200 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100/80 dark:hover:bg-sky-900/60 px-3 py-1.5 rounded-md border border-sky-200 dark:border-sky-800 transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin text-sky-600 dark:text-sky-400' : ''}`} />
            <span>{locationLoading ? 'Detecting coordinates...' : 'Use My Location'}</span>
          </button>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Allow location access to check flood risk for your current area.
          </span>
        </div>

        {/* Right: Quick Hotspot Chips */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="font-bold text-[11px] tracking-wider text-slate-500 dark:text-slate-400 uppercase mr-1">
            HOTSPOTS:
          </span>
          {hotspots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => {
                onSelectSector(spot.id);
                setQuery(spot.label);
              }}
              id={`hotspot-${spot.id}`}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${spot.color
                } ${currentSector.id === spot.id ? 'ring-2 ring-offset-1 ring-slate-700 dark:ring-sky-400 font-bold shadow-sm' : ''}`}
            >
              <span>{spot.label}</span>
              <span className="ml-1 opacity-80 text-[10px]">({spot.level})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analyzing Banner Indicator */}
      {isAnalyzing && (
        <div className="mt-3 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs flex items-center gap-2.5 animate-pulse">
          <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin" />
          <span className="font-semibold">
            Analyzing environmental conditions & running SIH-Hydro spatial-temporal inference for {currentSector.district}...
          </span>
        </div>
      )}

      {/* THE 4 CRITICAL QUESTIONS EXECUTIVE BANNER CARDS */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Q1: WILL IT FLOOD? */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">1</span>
              <span>WILL IT FLOOD?</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${currentSector.hazardLevel === 'CRITICAL' || currentSector.hazardLevel === 'HIGH' ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300' :
              currentSector.hazardLevel === 'MODERATE' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
              }`}>
              {currentSector.hazardLevel} RISK
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-[#0b1c30] dark:text-slate-100">
              {currentSector.floodProb}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Probability</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            {currentSector.floodProb > 75
              ? `High probability of inundation within next ${currentSector.peakWindow}.`
              : currentSector.floodProb > 40
                ? 'Moderate waterlogging and channel swell anticipated.'
                : 'Flow contained within normal embankment banks.'}
          </p>
        </div>

        {/* Q2: WHERE WILL IT HAPPEN? */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">2</span>
              <span>WHERE WILL IT HAPPEN?</span>
            </span>
            <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-[#0b1c30] dark:text-slate-100">
              {currentSector.inundationAreaKm2} km²
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Spread Extent</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            {currentSector.affectedNeighborhoods[0] || 'Riparian lowlands'}, {currentSector.affectedNeighborhoods[1] || 'River corridor'}
          </p>
        </div>

        {/* Q3: HOW SEVERE WILL IT BE? */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">3</span>
              <span>HOW SEVERE WILL IT BE?</span>
            </span>
            <Droplets className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-[#0b1c30] dark:text-slate-100">
              {currentSector.vulnerabilityIndex}
              <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/100</span>
            </span>
            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">{currentSector.riverStageDelta}</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            Avg Depth: {currentSector.waterDepthAvgM}m (Peak: {currentSector.waterDepthPeakM}m) • {currentSector.rainfall.intensity} Rain
          </p>
        </div>

        {/* Q4: WHO AND WHAT WILL BE AFFECTED? */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">4</span>
              <span>WHO & WHAT AFFECTED?</span>
            </span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-[#0b1c30] dark:text-slate-100">
              {((currentSector.populationAtRisk ?? 0) / 1000).toFixed(0)}K
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">People Exposed</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            {currentSector.infrastructureCounts.hospitals} Hospitals • {currentSector.infrastructureCounts.schools} Schools • {currentSector.infrastructureCounts.roads} Roads • {currentSector.infrastructureCounts.bridges} Bridges
          </p>
        </div>
      </div>
    </section>
  );
};
