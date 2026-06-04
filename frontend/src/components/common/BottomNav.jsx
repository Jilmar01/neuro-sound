import React from 'react';

/**
 * Barra inferior de navegacion para pantallas moviles.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.activeTab - Id de la pestana activa.
 * @param {(tabId: string) => void} props.onTabChange - Callback al seleccionar una pestana.
 * @returns {JSX.Element}
 */
const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'analysis', label: 'Análisis', icon: 'insights' },
    { id: 'library', label: 'Biblioteca', icon: 'library_music' },
    { id: 'timer', label: 'Timer', icon: 'schedule' },
    { id: 'survey', label: 'Encuesta', icon: 'assignment' },
    { id: 'settings', label: 'Ajustes', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md border-t border-surface-container flex justify-center items-center h-[80px] z-50">
      <div className="flex items-center justify-around w-full max-w-[600px] px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-20 h-full transition-colors group ${isActive ? 'text-on-primary-container' : 'text-on-surface-variant hover:text-primary'
                }`}
            >
              {isActive ? (
                <div className="bg-primary-container rounded-full px-5 py-1 mb-1">
                  <span className="material-symbols-outlined notranslate text-2xl text-on-primary-container filled" translate="no">
                    {tab.icon}
                  </span>
                </div>
              ) : (
                <span className="material-symbols-outlined notranslate text-2xl mb-1 group-hover:bg-surface-container-highest rounded-full px-4 py-1 transition-all duration-300" translate="no">
                  {tab.icon}
                </span>
              )}
              <span className="text-xs font-medium font-label-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
