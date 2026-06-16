import React from 'react';

/**
 * Sidebar de navegacion y controles de tema.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.activeTab - Tab/pantalla activa.
 * @param {(tabId: string) => void} props.onTabChange - Navegacion por tab.
 * @param {string} [props.targetEmotion] - Emocion objetivo para tema manual.
 * @param {(emoId: string) => void} props.onEmotionChange - Cambia emocion objetivo.
 * @param {"auto"|"manual"} [props.themeMode] - Modo de tema actual.
 * @param {(mode: "auto"|"manual") => void} props.onThemeModeChange - Cambia modo.
 * @returns {JSX.Element}
 */
const Sidebar = ({
  activeTab,
  onTabChange,
  targetEmotion = 'calma',
  onEmotionChange,
  themeMode = 'auto',
  onThemeModeChange
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
    window.dispatchEvent(new Event('sidebar-collapse-toggle'));
  };

  const tabs = [
    { id: 'library', label: 'Biblioteca', icon: 'library_music' },
    { id: 'profile', label: 'Mi Perfil',   icon: 'person' },
    { id: 'survey',  label: 'Encuesta',   icon: 'assignment' },
    { id: 'settings',label: 'Ajustes',    icon: 'settings' },
  ];

  /**
   * Traduce el tab del sidebar a la pantalla correspondiente.
   * @param {string} tabId - Id del tab del sidebar.
   * @returns {void}
   */
  const handleTabClick = (tabId) => {
    if (tabId === 'library')  onTabChange('dashboard');
    if (tabId === 'profile')  onTabChange('profile');
    if (tabId === 'survey')   onTabChange('final-evaluation');
    if (tabId === 'settings') onTabChange('settings');
  };

  /**
   * Normaliza la pantalla activa al id de tab del sidebar.
   * @param {string} tabId - Pantalla actual.
   * @returns {string} id del tab del sidebar.
   */
  const getTabId = (tabId) => {
    if (tabId === 'dashboard')        return 'library';
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

  const sidebarWidth = isCollapsed ? '80px' : '240px';
  const displayClass = isCollapsed ? 'd-none' : 'd-none d-md-inline';
  const displayBlockClass = isCollapsed ? 'd-none' : 'd-none d-md-block';

  return (
    <div className="sidebar-container d-flex bg-white py-2 py-md-4 align-items-center align-items-md-start" style={{ transition: 'width 0.3s' }}>
      <style>{`
        .sidebar-container {
          width: 100% !important;
          height: 60px !important;
          flex-direction: row !important;
          padding: 0.5rem 1rem !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
          border-right: none !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
        .theme-controls-container {
          border-top: none !important;
        }
        @media (min-width: 768px) {
          .sidebar-container {
            width: ${sidebarWidth} !important;
            flex-shrink: 0 !important;
            height: 100% !important;
            flex-direction: column !important;
            padding: 1.5rem 0 !important;
            border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
            border-bottom: none !important;
            justify-content: flex-start !important;
            align-items: ${isCollapsed ? 'center' : 'flex-start'} !important;
          }
          .theme-controls-container {
            border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
          }
          .sidebar-nav-btn-collapsed {
            width: 48px !important;
            height: 48px !important;
            border-radius: 50% !important;
            padding: 0 !important;
            justify-content: center !important;
            margin: 0 auto !important;
          }
          .sidebar-mode-btn-collapsed {
            width: 36px !important;
            height: 36px !important;
            border-radius: 50% !important;
            padding: 0 !important;
            justify-content: center !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      {/* Encabezado de marca */}
      <div className={`d-flex align-items-center w-auto w-md-100 mb-0 mb-md-4 ${
        isCollapsed 
          ? 'flex-md-column justify-content-center gap-2 px-1' 
          : 'justify-content-between px-1 px-md-3'
      }`}>
        <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center' : 'gap-2'}`}>
          <span className="material-symbols-outlined notranslate text-primary fs-3" translate="no">headphones</span>
          <span className={`font-headline-md text-headline-md text-on-surface fw-bold ${displayClass}`}>
            NeuroSound
          </span>
        </div>
        
        <button
          onClick={toggleCollapse}
          className="btn btn-link text-secondary p-0 d-none d-md-flex align-items-center justify-content-center"
          style={{ width: '28px', height: '28px', border: 'none', background: 'none' }}
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '20px' }}>
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Lista de navegacion */}
      <ul className="nav nav-pills flex-nowrap flex-row flex-md-column mb-0 mb-md-auto w-auto w-md-100 px-1 px-md-2 gap-1 gap-md-2">
        {tabs.map((tab) => {
          const isActive = currentActive === tab.id;
          return (
            <li key={tab.id} className="nav-item w-md-100">
              <button
                onClick={() => handleTabClick(tab.id)}
                className={`nav-link w-auto w-md-100 d-flex align-items-center gap-2 gap-md-3 justify-content-center justify-content-md-start py-2 py-md-3 px-2 px-md-3 rounded-pill transition-all ${isActive
                    ? 'active bg-primary text-white shadow-sm'
                    : 'text-secondary hover-bg-light'
                  } ${isCollapsed ? 'sidebar-nav-btn-collapsed' : ''}`}
                style={{ border: 'none' }}
              >
                <span className={`material-symbols-outlined notranslate ${isActive ? 'filled' : ''}`} translate="no">
                  {tab.icon}
                </span>
                <span className={`${displayClass} font-label-sm`}>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Controles de tema/emocion */}
      <div className={`theme-controls-container px-1 px-md-2 py-0 py-md-3 w-auto w-md-100 d-flex flex-row flex-md-column align-items-center gap-2 gap-md-0 ${
        isCollapsed ? 'align-items-md-center' : 'align-items-md-start'
      }`}>
        {/* Titulo de seccion en desktop */}
        <div className={`px-2 mb-2 ${displayBlockClass}`}>
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
            Foco de Fondo
          </span>
        </div>

        {/* Interruptor de modo */}
        <div className={`mb-0 mb-md-3 px-0 px-md-1 w-md-100 ${isCollapsed ? 'd-flex justify-content-center' : ''}`}>
          <button
            onClick={() => onThemeModeChange(themeMode === 'auto' ? 'manual' : 'auto')}
            className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-pill border-0 px-2.5 py-1 transition-all ${themeMode === 'auto'
                ? 'btn-primary text-white shadow-sm'
                : 'bg-light text-secondary'
              } ${isCollapsed ? 'sidebar-mode-btn-collapsed' : ''}`}
            style={{ fontSize: '10px' }}
            title={themeMode === 'auto' ? "Cambiando según canción" : "Fijo por emoción"}
          >
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '14px' }}>
              {themeMode === 'auto' ? 'sync' : 'tune'}
            </span>
            <span className={displayClass}>
              {themeMode === 'auto' ? 'Auto (Sincro)' : 'Fijar Color'}
            </span>
          </button>
        </div>

        {/* Botones de color para seleccionar emocion */}
        <div className={`d-flex align-items-center justify-content-center px-0 px-md-1 ${
          isCollapsed 
            ? 'flex-row flex-md-column gap-2 w-md-100' 
            : 'flex-row flex-md-column flex-lg-row gap-1.5 gap-md-2'
        }`}>
          {emotionsList.map((emo) => {
            const isActive = themeMode === 'manual' && targetEmotion === emo.id;
            return (
              <button
                key={emo.id}
                onClick={() => onEmotionChange(emo.id)}
                className={`rounded-circle d-flex align-items-center justify-content-center border-0 transition-all ${isActive ? 'scale-110 shadow-sm' : 'opacity-60 hover-opacity-100'
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
                  <span className="material-symbols-outlined notranslate text-white" translate="no" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Marca en el pie (desktop) */}
      <div className="px-1 px-md-3 mt-auto d-none d-md-block opacity-50 w-100 text-center">
        <p className="text-muted text-center mb-0" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
          {isCollapsed ? 'v2.0' : 'v2.0 • Terapia Sonora'}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
