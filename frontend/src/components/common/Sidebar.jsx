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

  const sidebarWidth = isCollapsed ? '70px' : '220px';
  const displayClass = isCollapsed ? 'd-none' : 'd-none d-md-inline';
  const displayBlockClass = isCollapsed ? 'd-none' : 'd-none d-md-block';

  return (
    <div className="sidebar-container d-flex flex-column flex-shrink-0 bg-white border-end border-light-subtle h-100 py-4 align-items-center align-items-md-start" style={{ width: '70px', transition: 'width 0.3s' }}>
      {/* Variable inline para ancho responsivo */}
      <style>{`
        @media (min-width: 768px) {
          .sidebar-container {
            width: ${sidebarWidth} !important;
          }
        }
      `}</style>

      {/* Encabezado de marca */}
      <div className={`d-flex align-items-center ${isCollapsed ? 'flex-column gap-2 justify-content-center' : 'justify-content-between'} w-100 px-3 mb-4`}>
        <div className="d-flex align-items-center gap-2">
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
      <ul className="nav nav-pills flex-column mb-auto w-100 px-2 gap-2">
        {tabs.map((tab) => {
          const isActive = currentActive === tab.id;
          return (
            <li key={tab.id} className="nav-item">
              <button
                onClick={() => handleTabClick(tab.id)}
                className={`nav-link w-100 d-flex align-items-center gap-3 justify-content-center justify-content-md-start py-3 px-3 rounded-pill transition-all ${isActive
                    ? 'active bg-primary text-white shadow-sm'
                    : 'text-secondary hover-bg-light'
                  }`}
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
      <div className="px-2 py-3 w-100 border-top border-light-subtle d-flex flex-column align-items-center align-items-md-start">
        {/* Titulo de seccion en desktop */}
        <div className={`px-2 mb-2 ${displayBlockClass}`}>
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
            Foco de Fondo
          </span>
        </div>

        {/* Interruptor de modo */}
        <div className="mb-3 px-1">
          <button
            onClick={() => onThemeModeChange(themeMode === 'auto' ? 'manual' : 'auto')}
            className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-pill border-0 px-2.5 py-1 transition-all ${themeMode === 'auto'
                ? 'btn-primary text-white shadow-sm'
                : 'bg-light text-secondary'
              }`}
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
        <div className={`d-flex ${isCollapsed ? 'flex-column' : 'flex-column flex-md-row'} gap-2 justify-content-center align-items-center px-1`}>
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
      <div className={`px-3 mt-auto ${displayBlockClass} opacity-50`}>
        <p className="text-muted text-center mb-0" style={{ fontSize: '10px' }}>
          v2.0 • Terapia Sonora
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
