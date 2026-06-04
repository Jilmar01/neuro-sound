import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Button from '../common/Button';
import { apiCall } from '../../utils/fetch.js';

/* ─── Avatar generativo ─── */
const DynamicAvatar = ({ name, size = 40 }) => {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = [
    'linear-gradient(135deg,#FF6B6B,#FF8E53)',
    'linear-gradient(135deg,#4E54C8,#8F94FB)',
    'linear-gradient(135deg,#11998E,#38EF7D)',
    'linear-gradient(135deg,#FC466B,#3F5EFB)',
    'linear-gradient(135deg,#f857a6,#ff5858)',
    'linear-gradient(135deg,#1D976C,#93F9B9)',
    'linear-gradient(135deg,#8A2387,#E94057,#F27121)',
    'linear-gradient(135deg,#00c6ff,#0072ff)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return (
    <div
      className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold"
      style={{ background: colors[Math.abs(hash) % colors.length], fontSize: size * 0.3, borderRadius: '50%' }}
    >
      {initials}
    </div>
  );
};

/* ─── Paleta de colores por índice de género ─── */
const GENRE_PALETTE = [
  { bar: 'linear-gradient(90deg,#4E54C8,#8F94FB)', dot: '#4E54C8' },
  { bar: 'linear-gradient(90deg,#FC466B,#f857a6)', dot: '#FC466B' },
  { bar: 'linear-gradient(90deg,#11998E,#38EF7D)', dot: '#11998E' },
  { bar: 'linear-gradient(90deg,#fd7e14,#ffc107)', dot: '#fd7e14' },
  { bar: 'linear-gradient(90deg,#8A2387,#E94057)', dot: '#8A2387' },
  { bar: 'linear-gradient(90deg,#00c6ff,#0072ff)', dot: '#0072ff' },
];

/* ─── Info del estado de Hawkins ─── */
const getHawkinsInfo = (freq) => {
  if (freq < 50)  return { name: 'Vergüenza',  emoji: '😔', desc: 'Reconocimiento profundo', color: '#6c757d' };
  if (freq < 75)  return { name: 'Culpa',       emoji: '😞', desc: 'Proceso de liberación',  color: '#6c757d' };
  if (freq < 100) return { name: 'Apatía',      emoji: '😶', desc: 'En búsqueda de energía', color: '#adb5bd' };
  if (freq < 125) return { name: 'Pena',        emoji: '😢', desc: 'Procesando emociones',   color: '#74c0fc' };
  if (freq < 150) return { name: 'Miedo',       emoji: '😨', desc: 'Liberando tensiones',    color: '#91a7ff' };
  if (freq < 175) return { name: 'Deseo',       emoji: '😤', desc: 'Buscando satisfacción',  color: '#ff9f43' };
  if (freq < 200) return { name: 'Ira',         emoji: '😠', desc: 'Canalizando energía',    color: '#ff6b6b' };
  if (freq < 250) return { name: 'Orgullo',     emoji: '😏', desc: 'Confianza creciente',    color: '#ffd43b' };
  if (freq < 310) return { name: 'Coraje',      emoji: '💪', desc: 'Punto de inflexión',     color: '#51cf66' };
  if (freq < 350) return { name: 'Neutralidad', emoji: '😌', desc: 'Equilibrio interior',    color: '#74c0fc' };
  if (freq < 400) return { name: 'Voluntad',    emoji: '🧘', desc: 'Autodisciplina activa',  color: '#0d6efd' };
  if (freq < 500) return { name: 'Aceptación',  emoji: '🌿', desc: 'Armonía con el presente',color: '#198754' };
  if (freq < 540) return { name: 'Amor',        emoji: '💙', desc: 'Amor incondicional',     color: '#fc5c7d' };
  if (freq < 600) return { name: 'Alegría',     emoji: '😊', desc: 'Bienestar profundo',     color: '#ffd43b' };
  if (freq < 700) return { name: 'Paz',         emoji: '☮️', desc: 'Serenidad total',        color: '#a9e34b' };
  return { name: 'Iluminación', emoji: '✨', desc: 'Estado de gracia', color: '#f8f9fa' };
};

const EMOTION_LABELS = ['Muy triste', 'Algo triste', 'Neutral', 'Algo feliz', 'Muy feliz'];
const PAGE_SIZE = 15;

/* ─── Tarjeta de artista compacta ─── */
const ArtistCard = ({ artist, isSelected, onClick }) => (
  <div
    onClick={() => onClick(artist)}
    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}
  >
    <div style={{
      width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0,
      boxShadow: isSelected
        ? '0 0 0 3px var(--bs-primary), 0 4px 16px rgba(13,110,253,0.35)'
        : '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
    }}>
      {artist.img
        ? <img src={artist.img} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <DynamicAvatar name={artist.name} size={72} />
      }
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'rgba(13,110,253,0.42)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s',
      }}>
        <span className="material-symbols-outlined notranslate text-white filled" translate="no" style={{ fontSize: 22 }}>check_circle</span>
      </div>
    </div>
    <span style={{
      fontSize: 10, lineHeight: 1.25, textAlign: 'center', marginTop: 5,
      fontWeight: 600, maxWidth: 80, wordBreak: 'break-word',
      color: isSelected ? 'var(--bs-primary)' : '#212529',
    }}>
      {artist.name}
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════
   Editor de artistas inline
══════════════════════════════════════════════════════════ */
const ArtistEditor = ({ preselected = [], onSave, onCancel }) => {
  const [baseArtists, setBaseArtists]   = useState([]);
  const [selected, setSelected]         = useState(new Set(preselected.map(a => a.id || a._id || a)));
  const [selectedMap, setSelectedMap]   = useState(new Map(preselected.map(a => [a.id || a._id || a, a])));
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);

  const dedupe = (list) => {
    const seen = new Set();
    return list.filter(a => { if (!a?.id || seen.has(a.id)) return false; seen.add(a.id); return true; });
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: PAGE_SIZE });
        if (searchQuery) params.set('search', searchQuery);
        const res = await apiCall('neuro', `/api/artists?${params}`, 'GET');
        if (res?.success && active) {
          const artistsList = res.data?.artists || (Array.isArray(res.data) ? res.data : []);
          const paginationInfo = res.data?.pagination || res.pagination;
          setBaseArtists(dedupe(artistsList));
          setTotalPages(paginationInfo?.totalPages || 1);
        }
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    };
    const t = setTimeout(load, searchQuery ? 350 : 0);
    return () => { active = false; clearTimeout(t); };
  }, [searchQuery, page]);

  useEffect(() => { setPage(1); }, [searchQuery]);

  const toggleArtist = (artistObj) => {
    const id = artistObj.id || artistObj._id;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSelectedMap(prev => {
      const next = new Map(prev);
      next.has(id) ? next.delete(id) : next.set(id, artistObj);
      return next;
    });
  };

  const handleSave = async () => {
    if (selected.size < 3) return;
    setSaving(true);
    const ids = [...selected];
    const data = [...selectedMap.values()];
    await onSave(ids, data);
    setSaving(false);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Barra de búsqueda */}
      <div className="mb-3" style={{ maxWidth: 380 }}>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 border-light-subtle rounded-start-pill text-secondary">
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16 }}>search</span>
          </span>
          <input
            type="text"
            className="form-control bg-white border-start-0 border-light-subtle rounded-end-pill py-2 small text-secondary"
            placeholder="Buscar artistas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contador de seleccionados */}
      {selected.size > 0 && (
        <div className="mb-3">
          <span className="badge bg-primary rounded-pill px-3 py-2 text-white small">
            {selected.size} {selected.size === 1 ? 'artista seleccionado' : 'artistas seleccionados'} — mínimo 3
          </span>
        </div>
      )}

      {/* Grid de artistas */}
      <div style={{ minHeight: 180 }}>
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-4">
            <div className="spinner-border text-primary mb-2" role="status" style={{ width: 24, height: 24 }} />
            <span className="text-muted small">Cargando artistas...</span>
          </div>
        ) : baseArtists.length === 0 ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined notranslate text-secondary mb-1" translate="no" style={{ fontSize: 32 }}>search_off</span>
            <p className="text-muted small mb-0">No se encontraron artistas.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '16px 10px' }}>
            {baseArtists.map(artist => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                isSelected={selected.has(artist.id)}
                onClick={toggleArtist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
          <button
            className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center"
            style={{ width: 30, height: 30 }} disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16 }}>chevron_left</span>
          </button>
          <span className="small text-muted">{page} / {totalPages}</span>
          <button
            className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center"
            style={{ width: 30, height: 30 }} disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16 }}>chevron_right</span>
          </button>
        </div>
      )}

      {/* Botones de acción */}
      <div className="d-flex gap-2 mt-4 justify-content-end">
        <button className="btn btn-light rounded-pill px-4 py-2 small" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="btn btn-primary rounded-pill px-4 py-2 small fw-semibold"
          disabled={selected.size < 3 || saving}
          onClick={handleSave}
        >
          {saving ? (
            <span className="d-flex align-items-center gap-2">
              <span className="spinner-border spinner-border-sm" role="status" />
              <span>Guardando...</span>
            </span>
          ) : (
            <span className="d-flex align-items-center gap-2">
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16 }}>save</span>
              <span>Guardar artistas</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   Pantalla de Resumen de Perfil Sonoro
══════════════════════════════════════════════════════════ */
const ProfileSummaryScreen = ({
  surveyData = {},
  selectedArtistsData = [],
  onContinue,
  fromOnboarding = false,
  onBack,
  onArtistsSaved, // callback(ids, artistsData) cuando se guardan artistas
}) => {
  const [editingArtists, setEditingArtists] = useState(false);
  // Artistas locales (se actualiza tras guardar sin recargar)
  const [localArtists, setLocalArtists] = useState(selectedArtistsData);

  // Sincronizar si la prop externa cambia
  useEffect(() => {
    setLocalArtists(selectedArtistsData);
  }, [selectedArtistsData]);

  /* ── Calcular distribución de géneros ── */
  const genreData = useMemo(() => {
    const counts = {};
    localArtists.forEach(artist => {
      const genres = Array.isArray(artist.genres) && artist.genres.length > 0
        ? artist.genres
        : artist.genre ? [artist.genre] : [];
      genres.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([name, count], i) => ({
      name, count, pct: Math.round((count / max) * 100),
      ...GENRE_PALETTE[i % GENRE_PALETTE.length],
    }));
  }, [localArtists]);

  const hawkinsFreq = surveyData?.volume ?? 200;
  const hawkinsInfo = getHawkinsInfo(hawkinsFreq);
  const comoSiente  = surveyData?.comoSiente  ?? 3;
  const comoQuiere  = surveyData?.comoQuiere  ?? 4;

  const handleArtistSave = async (ids, artistsData) => {
    // Actualizar caché local
    try {
      const cachedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
      cachedUser.selectedArtists = ids;
      localStorage.setItem('user', JSON.stringify(cachedUser));
      localStorage.setItem('selectedArtists', JSON.stringify(ids));
      localStorage.setItem('selectedArtistsData', JSON.stringify(artistsData));
    } catch (e) {
      console.error('Error saving local cache for artists:', e);
    }
    // Actualizar estado local y cerrar editor
    setLocalArtists(artistsData);
    setEditingArtists(false);
    // Notificar al padre para que actualice su estado global y guarde en backend
    if (onArtistsSaved) {
      await onArtistsSaved(ids, artistsData);
    }
  };

  return (
    <div className="w-100 py-3 d-flex flex-column align-items-center animate-fade-in-up">
      <div className="w-100" style={{ maxWidth: '780px' }}>

        {/* ── Encabezado ── */}
        {!editingArtists && (
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 64, height: 64,
                background: 'linear-gradient(135deg, var(--bs-primary), #8F94FB)',
                boxShadow: '0 4px 20px rgba(13,110,253,0.35)',
              }}
            >
              <span className="material-symbols-outlined notranslate text-white filled" translate="no" style={{ fontSize: 32 }}>
                person_pin
              </span>
            </div>
            <h2 className="h4 fw-bold text-dark mb-1">Tu Perfil Sonoro</h2>
            <p className="text-muted small mb-0">
              Basado en tus respuestas, hemos construido tu identidad musical y emocional.
            </p>
          </div>
        )}

        {/* ── Panel de edición de artistas (inline) ── */}
        {editingArtists ? (
          <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <button
                  className="btn btn-link p-0 text-secondary d-flex align-items-center"
                  onClick={() => setEditingArtists(false)}
                >
                  <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 20 }}>arrow_back</span>
                </button>
                <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: 20 }}>people</span>
                <span className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.6px' }}>
                  Selecciona tus artistas
                </span>
                <span className="text-muted small ms-1">— elige al menos 3</span>
              </div>
              <ArtistEditor
                preselected={localArtists}
                onSave={handleArtistSave}
                onCancel={() => setEditingArtists(false)}
              />
            </div>
          </div>
        ) : (
          /* ── Vista de perfil normal ── */
          <div className="row g-3">

            {/* Card: Géneros predominantes */}
            {genreData.length > 0 && (
              <div className="col-12 col-md-7">
                <div className="card border-0 shadow-sm h-100 rounded-4" style={{ background: 'rgba(255,255,255,0.85)' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: 20 }}>equalizer</span>
                      <span className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.6px' }}>Géneros Predominantes</span>
                    </div>
                    <div className="d-flex flex-column gap-3">
                      {genreData.map((g) => (
                        <div key={g.name}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.dot, flexShrink: 0 }} />
                              <span className="small fw-semibold text-dark text-capitalize">{g.name}</span>
                            </div>
                            <span className="small text-muted">{g.count} {g.count === 1 ? 'artista' : 'artistas'}</span>
                          </div>
                          <div style={{ height: 6, background: '#f0f2f5', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${g.pct}%`, background: g.bar, borderRadius: 99, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card: Estado emocional + Hawkins */}
            <div className={genreData.length > 0 ? 'col-12 col-md-5' : 'col-12'}>
              <div className="d-flex flex-column gap-3 h-100">
                <div className="card border-0 shadow-sm rounded-4 flex-grow-1" style={{ background: 'rgba(255,255,255,0.85)' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: 20 }}>mood</span>
                      <span className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.6px' }}>Estado Emocional</span>
                    </div>
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <p className="mb-1 text-muted" style={{ fontSize: 11 }}>Ahora me siento</p>
                        <div className="d-flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} style={{ flex: 1, height: 6, borderRadius: 99, background: n <= comoSiente ? 'var(--bs-primary)' : '#e9ecef', transition: 'background 0.3s' }} />
                          ))}
                        </div>
                        <p className="mt-1 fw-semibold text-dark mb-0" style={{ fontSize: 12 }}>{EMOTION_LABELS[comoSiente - 1] ?? 'Neutral'}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-muted" style={{ fontSize: 11 }}>Quiero sentirme</p>
                        <div className="d-flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} style={{ flex: 1, height: 6, borderRadius: 99, background: n <= comoQuiere ? '#198754' : '#e9ecef', transition: 'background 0.3s' }} />
                          ))}
                        </div>
                        <p className="mt-1 fw-semibold text-dark mb-0" style={{ fontSize: 12 }}>{EMOTION_LABELS[comoQuiere - 1] ?? 'Muy feliz'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Hawkins */}
                <div className="card border-0 shadow-sm rounded-4" style={{ background: `linear-gradient(135deg, ${hawkinsInfo.color}22, ${hawkinsInfo.color}08)` }}>
                  <div className="card-body p-3 d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 46, height: 46, background: hawkinsInfo.color + '22' }}>
                      <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 22, color: hawkinsInfo.color }}>psychology</span>
                    </div>
                    <div className="min-w-0">
                      <p className="mb-0 fw-bold text-dark" style={{ fontSize: 13 }}>{hawkinsInfo.name}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: 11 }}>{hawkinsInfo.desc}</p>
                      <span className="badge rounded-pill mt-1" style={{ background: hawkinsInfo.color + '22', color: hawkinsInfo.color, fontSize: 10 }}>
                        {hawkinsFreq} Hz
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Artistas seleccionados */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4" style={{ background: 'rgba(255,255,255,0.85)' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                    <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: 20 }}>people</span>
                    <span className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.6px' }}>Artistas que te inspiran</span>
                    <span className="badge bg-primary-subtle text-primary rounded-pill ms-1" style={{ fontSize: 11 }}>
                      {localArtists.length} seleccionados
                    </span>
                    {/* Botón editar — siempre visible */}
                    <button
                      onClick={() => setEditingArtists(true)}
                      className="btn btn-link btn-sm text-decoration-none text-primary p-0 d-flex align-items-center gap-1 ms-auto"
                      type="button"
                      style={{ fontSize: 12, border: 'none', background: 'none' }}
                    >
                      <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 15 }}>edit</span>
                      <span>Agregar / Modificar</span>
                    </button>
                  </div>
                  {localArtists.length === 0 ? (
                    <div className="text-center py-3">
                      <span className="material-symbols-outlined notranslate text-secondary mb-2" translate="no" style={{ fontSize: 36 }}>person_search</span>
                      <p className="text-muted small mb-2">No has seleccionado artistas aún.</p>
                      <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setEditingArtists(true)}>
                        Elegir artistas
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex gap-3 overflow-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {localArtists.map(artist => {
                        const key = artist.id || artist._id || artist.artist_id || artist.name;
                        const name = artist.name || '?';
                        return (
                          <div key={key} className="d-flex flex-column align-items-center flex-shrink-0" style={{ width: 68 }}>
                            <div style={{
                              width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
                              boxShadow: '0 2px 10px rgba(13,110,253,0.2)',
                              border: '2px solid var(--bs-primary)',
                            }}>
                              {artist.img
                                ? <img src={artist.img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <DynamicAvatar name={name} size={52} />
                              }
                            </div>
                            <span style={{ fontSize: 10, textAlign: 'center', marginTop: 5, fontWeight: 600, color: '#495057', lineHeight: 1.2, maxWidth: 68, wordBreak: 'break-word' }}>
                              {name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Botones de acción (solo cuando no está editando) ── */}
        {!editingArtists && (
          <div className="d-flex justify-content-center gap-3 mt-4">
            {!fromOnboarding && onBack && (
              <button className="btn btn-light rounded-pill px-4 py-2" onClick={onBack}>
                <span className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>arrow_back</span>
                  <span>Volver</span>
                </span>
              </button>
            )}
            {onContinue && (
              <Button onClick={onContinue} variant="secondary" className="rounded-pill px-5 py-2 shadow-sm">
                <span className="d-flex align-items-center gap-2">
                  <span>{fromOnboarding ? 'Comenzar sesión' : 'Ir al Dashboard'}</span>
                  <span className="material-symbols-outlined notranslate" translate="no">arrow_forward</span>
                </span>
              </Button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfileSummaryScreen;
