import React from 'react';
import { useTab, TAB_CONFIG } from '../contexts/TabContext';

const TabNavigation = () => {
  const { activeTab, setActiveTab, loading } = useTab();
  
  const handleTabClick = (tabId) => {
    console.log(`🖱️ TAB CLICKED: ${tabId}`);
    setActiveTab(tabId);
  };
  
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Mobile-first responsive tab navigation */}
        <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {Object.values(TAB_CONFIG).map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabClick(tab.id);
              }}
              disabled={loading}
              className={`
                px-2 py-3 sm:px-4 sm:py-3 flex items-center justify-center transition-all duration-200 
                min-w-fit flex-shrink-0 whitespace-nowrap
                ${activeTab === tab.id 
                  ? "bg-emerald-100 text-emerald-700 font-bold border-b-2 border-emerald-500" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
                ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                
                /* Mobile styles (< 640px) */
                text-xs
                
                /* Tablet styles (>= 640px) */
                sm:text-sm
                
                /* Desktop styles (>= 768px) */
                md:px-6 md:py-4 md:text-base
                
                /* Large desktop styles (>= 1024px) */
                lg:px-8 lg:py-4
                
                /* Extra responsive adjustments */
                xs:min-w-16 sm:min-w-20 md:min-w-24 lg:min-w-28
              `}
              title={tab.description}
            >
              {/* Icon - responsive sizing */}
              <span className="text-base sm:text-lg md:text-xl mr-1 sm:mr-2">{tab.icon}</span>
              
              {/* Label - responsive visibility and sizing */}
              <span className={`
                font-medium 
                hidden xs:inline
                text-xs sm:text-sm md:text-base
                truncate max-w-16 xs:max-w-20 sm:max-w-24 md:max-w-none
              `}>
                {tab.label}
              </span>
              
              {/* Active indicator - responsive sizing */}
              {activeTab === tab.id && (
                <span className="ml-1 text-xs bg-emerald-200 px-1 rounded hidden sm:inline">●</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Debug info - responsive */}
      <div className="bg-yellow-50 px-2 sm:px-4 py-1 text-xs text-yellow-700 border-t border-yellow-200">
        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
          <span>🎯 Active: <strong className="text-emerald-700">{activeTab}</strong></span>
          <span className="hidden xs:inline">|</span>
          <span>Status: <strong>{loading ? "Loading..." : "Ready"}</strong></span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;