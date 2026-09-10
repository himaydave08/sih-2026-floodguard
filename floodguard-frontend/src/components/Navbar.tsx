import React, { useState } from 'react';
import { Bell, MapPin, Layers, Info, AlertTriangle, BarChart3, Activity, Clock } from 'lucide-react';
import { ACTIVE_FLOOD_ALERTS } from '../data/assamData';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { FloodGuardBrandText } from './FloodGuardBrandText';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCheckMyRisk: () => void;
  onSearchSelect?: (sectorId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onCheckMyRisk,
  onSearchSelect
}) => {
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const criticalAlertCount = ACTIVE_FLOOD_ALERTS.filter(a => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH').length;

  const primaryNavItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'map', label: 'Risk Map', icon: MapPin },
    { id: 'predictions', label: 'Predictions', icon: Activity },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: criticalAlertCount },
    { id: 'historical', label: 'History', icon: Clock },
  ];

  const allNavItems = [
    ...primaryNavItems,
    { id: 'methodology', label: 'How It Works', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Main Top Navigation */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none flex-shrink-0 min-w-0"
          id="brand-logo-floodguard"
        >
          <Logo size={34} className="flex-shrink-0 sm:w-9 sm:h-9" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FloodGuardBrandText />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400 hidden sm:inline-block"></span>
            </div>
            <span className="hidden sm:block text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.14em] font-bold text-slate-500 dark:text-slate-400 uppercase -mt-0.5 font-mono truncate">
              INUNDATION INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Center: Simplified Primary Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-2 text-xs xl:text-sm font-medium transition-colors flex items-center gap-1.5 rounded-md ${
                  isActive
                    ? 'text-[#0b1c30] dark:text-white font-bold bg-slate-100/90 dark:bg-slate-800/90'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#0b1c30] dark:bg-sky-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Secondary Utility (How It Works), Theme Toggle, Notification Indicator & Primary Action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Secondary Utility: How It Works */}
          <button
            id="nav-link-methodology"
            onClick={() => setActiveTab('methodology')}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              activeTab === 'methodology'
                ? 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border-sky-200 dark:border-sky-800 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800'
            }`}
            title="How FloodGuard Hydro-AI Platform Works"
          >
            <Info className="w-3.5 h-3.5 opacity-75" />
            <span>How It Works</span>
          </button>

          {/* Theme Toggle Component */}
          <ThemeToggle />

          {/* Notification Indicator with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAlertDrawerOpen(!isAlertDrawerOpen)}
              id="nav-notification-indicator"
              className="relative min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 touch-manipulation"
              title="Active Flood Risk Alerts"
              aria-label="Active Flood Risk Alerts"
            >
              <Bell className="w-5 h-5" />
              {criticalAlertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
              )}
            </button>

            {/* Notification Flyout */}
            {isAlertDrawerOpen && (
              <div 
                className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-24px))] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                id="notification-flyout"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-bold text-sm text-[#0b1c30] dark:text-slate-100">Active Flood Risk Alerts</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 rounded border border-transparent dark:border-red-800/50">
                    {ACTIVE_FLOOD_ALERTS.length} Active
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto mt-2">
                  {ACTIVE_FLOOD_ALERTS.slice(0, 3).map((alert) => (
                    <div 
                      key={alert.id} 
                      className="py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded px-1 transition"
                      onClick={() => {
                        setIsAlertDrawerOpen(false);
                        setActiveTab('alerts');
                      }}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{alert.location}</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          alert.riskLevel === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300' :
                          alert.riskLevel === 'HIGH' ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300' :
                          'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                        }`}>
                          {alert.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{alert.headline}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{alert.timestamp}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsAlertDrawerOpen(false);
                      setActiveTab('alerts');
                    }}
                    className="text-xs text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 font-bold"
                  >
                    View All Flood Alerts →
                  </button>
                  <button
                    onClick={() => setIsAlertDrawerOpen(false)}
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button: "Check My Risk" */}
          <button
            onClick={onCheckMyRisk}
            id="nav-check-risk-btn"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 min-h-[40px] sm:min-h-[44px] rounded-lg bg-[#0b1c30] dark:bg-sky-600 hover:bg-[#1a2b42] dark:hover:bg-sky-500 active:bg-[#020617] text-white text-[11px] sm:text-sm font-semibold tracking-wide transition-all shadow-sm hover:shadow whitespace-nowrap touch-manipulation"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 dark:bg-white animate-pulse flex-shrink-0"></span>
            <span>Check My Risk</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-white dark:bg-slate-900 text-xs gap-1.5 scrollbar-none touch-pan-x transition-colors">
        {allNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-2 min-h-[40px] whitespace-nowrap rounded-md font-medium text-xs flex items-center gap-1.5 touch-manipulation ${
                isActive
                  ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
