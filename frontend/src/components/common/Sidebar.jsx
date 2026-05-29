import React from 'react';

const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  targetEmotion = 'calma', 
  onEmotionChange, 
  themeMode = 'auto', 
  onThemeModeChange 
}) => {
  const tabs = [
    { id: 'library', label: 'Biblioteca', icon: 'library_music' },
    { id: 'survey', label: 'Encuesta', icon: 'assignment' },
    { id: 'settings', label: 'Ajustes', icon: 'settings' },
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'library') onTabChange('dashboard');
    if (tabId === 'survey') onTabChange('final-evaluation');
    if (tabId === 'settings') onTabChange('settings');
  };

  const getTabId = (tabId) => {
    if (tabId === 'dashboard') return 'library';
    if (tabId === 'final-evaluation') return 'survey';
    return tabId;
  };

  const currentActive = getTabId(activeTab);

  const emotionsList = [
    { id: 'calma', name: 'Calma', color: '#0d6efd', icon: 'sentiment_satisfied' },
    { id: 'relajacion', name: 'Relajación', color: '#198754', icon: 'spa' },
    { id: 'foco', name: 'Foco', color: '#fd7e14', icon: 'bolt' },
    { id: 'zen', name: 'Zen', color: '#6f42c1', icon: 'self_improvement' }
  ];

  return (
    <div className="d-flex flex-column flex-shrink-0 bg-white border-end border-light-subtle h-100 py-4 align-items-center align-items-md-start" style={{ width: 'var(--sidebar-width, 70px)', transition: 'width 0.3s' }}>
      {/* Dynamic inline variable for responsive width */}
      <style>{`
        @media (min-width: 768px) {
          div.flex-shrink-0 {
            width: 220px !important;
          }
        }
      `}</style>

      {/* Brand Header */}
      <div className="px-3 mb-4 d-flex align-items-center gap-2">
        <span className="material-symbols-outlined text-primary fs-3">headphones</span>
        <span className="font-headline-md text-headline-md text-on-surface fw-bold d-none d-md-inline">
          NeuroSound
        </span>
      </div>

      {/* Nav List */}
      <ul className="nav nav-pills flex-column mb-auto w-100 px-2 gap-2">
        {tabs.map((tab) => {
          const isActive = currentActive === tab.id;
          return (
            <li key={tab.id} className="nav-item">
              <button
                onClick={() => handleTabClick(tab.id)}
                className={`nav-link w-100 d-flex align-items-center gap-3 justify-content-center justify-content-md-start py-3 px-3 rounded-pill transition-all ${
                  isActive 
                    ? 'active bg-primary text-white shadow-sm' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ border: 'none' }}
              >
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                  {tab.icon}
                </span>
                <span className="d-none d-md-inline font-label-sm">{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Dynamic Theme / Emotion Custom Controls */}
      <div className="px-2 py-3 w-100 border-top border-light-subtle d-flex flex-column align-items-center align-items-md-start">
        {/* Section title for desktop */}
        <div className="px-2 mb-2 d-none d-md-block">
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
            Foco de Fondo
          </span>
        </div>

        {/* Mode Toggle Switch */}
        <div className="mb-3 px-1">
          <button
            onClick={() => onThemeModeChange(themeMode === 'auto' ? 'manual' : 'auto')}
            className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-pill border-0 px-2.5 py-1 transition-all ${
              themeMode === 'auto'
                ? 'btn-primary text-white shadow-sm'
                : 'bg-light text-secondary'
            }`}
            style={{ fontSize: '10px' }}
            title={themeMode === 'auto' ? "Cambiando según canción" : "Fijo por emoción"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {themeMode === 'auto' ? 'sync' : 'tune'}
            </span>
            <span className="d-none d-md-inline">
              {themeMode === 'auto' ? 'Auto (Sincro)' : 'Fijar Color'}
            </span>
          </button>
        </div>

        {/* Color buttons for selecting emotion */}
        <div className="d-flex flex-column flex-md-row gap-2 justify-content-center align-items-center px-1">
          {emotionsList.map((emo) => {
            const isActive = themeMode === 'manual' && targetEmotion === emo.id;
            return (
              <button
                key={emo.id}
                onClick={() => onEmotionChange(emo.id)}
                className={`rounded-circle d-flex align-items-center justify-content-center border-0 transition-all ${
                  isActive ? 'scale-110 shadow-sm' : 'opacity-60 hover-opacity-100'
                }`}
                style={{
                  width: '22px',
                  height: '22px',
                  backgroundColor: emo.color,
                  cursor: 'pointer',
                  border: isActive ? '2.5px solid white' : 'none',
                  boxShadow: isActive ? '0 0 0 1.5px var(--bs-primary)' : 'none'
                }}
                title={emo.name}
              >
                {isActive && (
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Branding for Desktop */}
      <div className="px-3 mt-auto d-none d-md-block opacity-50">
        <p className="text-muted text-center mb-0" style={{ fontSize: '10px' }}>
          v2.0 • Terapia Sonora
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
