import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../common/Button';
import { apiCall } from '../../utils/fetch.js';
import { fetchArtistImageFromITunes, enrichArtistsWithITunesImages } from '../../utils/artistCovers.js';

const PAGE_SIZE = 15;

/* ---------- Avatar generativo ---------- */
const DynamicAvatar = ({ name, size }) => {
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
      className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold mb-0"
      style={{ background: colors[Math.abs(hash) % colors.length], borderRadius: '50%', fontSize: size ? size * 0.27 : 16 }}
    >
      {initials}
    </div>
  );
};

/* ---------- Tarjeta de artista ---------- */
const ArtistCard = ({ artist, isSelected, isInjected, onClick, size = 86 }) => {
  const [imgUrl, setImgUrl] = useState(artist.img || null);

  useEffect(() => {
    let active = true;
    if (artist.img) {
      setImgUrl(artist.img);
    } else if (artist.name) {
      fetchArtistImageFromITunes(artist.name).then(url => {
        if (active && url) {
          setImgUrl(url);
          artist.img = url;
        }
      });
    }
    return () => { active = false; };
  }, [artist.img, artist.name]);

  return (
    <div
      onClick={() => onClick(artist)}
      style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      className="animate-fade-in-up"
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: isSelected
            ? '0 0 0 3px var(--bs-primary), 0 4px 16px rgba(13,110,253,0.35)'
            : isInjected
            ? '0 0 0 2px rgba(13,110,253,0.25), 0 2px 8px rgba(0,0,0,0.1)'
            : '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.25s ease, transform 0.2s ease',
          transform: isSelected ? 'scale(1.07)' : 'scale(1)',
          flexShrink: 0,
        }}
      >
        {imgUrl
          ? <img src={imgUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <DynamicAvatar name={artist.name} size={size} />
        }
        {/* Overlay seleccion */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(13,110,253,0.42)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s',
        }}>
          <span className="material-symbols-outlined notranslate text-white filled" translate="no" style={{ fontSize: 26 }}>
            check_circle
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: 11, lineHeight: 1.25, textAlign: 'center', marginTop: 6,
          fontWeight: 600, maxWidth: size + 12, wordBreak: 'break-word',
          color: isSelected ? 'var(--bs-primary)' : '#212529',
        }}
      >
        {artist.name}
      </span>
    </div>
  );
};

/* ======================================================
   Componente principal
====================================================== */
const ArtistSurvey = ({ onConfirm }) => {
  const [baseArtists, setBaseArtists] = useState([]);   // artistas de la pagina actual
  const [selected, setSelected]       = useState(new Set());
  // Mapa de id → objeto artista completo (para pasar al perfil)
  const [selectedMap, setSelectedMap] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  // Expansiones inline: { artistId: [relatedArtists] }
  const [injected, setInjected]       = useState({});
  // Cual artista esta actualmente "abierto" (solo uno a la vez)
  const [openId, setOpenId]           = useState(null);

  const relatedCache = useRef({});

  /* ---------- Deduplicar ---------- */
  const dedupe = (list) => {
    const seen = new Set();
    return list.filter(a => { if (!a?.id || seen.has(a.id)) return false; seen.add(a.id); return true; });
  };

  /* ---------- Cargar artistas base ---------- */
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
          const deduped = dedupe(artistsList);
          setBaseArtists(deduped);
          setTotalPages(paginationInfo?.totalPages || 1);
          setInjected({});
          setOpenId(null);

          enrichArtistsWithITunesImages(deduped).then(enriched => {
            if (active) setBaseArtists(enriched);
          });
        }
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    };
    const t = setTimeout(load, searchQuery ? 350 : 0);
    return () => { active = false; clearTimeout(t); };
  }, [searchQuery, page]);

  useEffect(() => { setPage(1); }, [searchQuery]);

  /* ---------- Cargar relacionados y expandir inline ---------- */
  const expandArtist = useCallback(async (artist) => {
    const id = artist.id;

    // Si ya esta abierto, cerrar
    if (openId === id) {
      setOpenId(null);
      return;
    }

    setOpenId(id);

    // Cache hit
    if (relatedCache.current[id]) {
      setInjected(prev => ({ ...prev, [id]: relatedCache.current[id] }));
      return;
    }

    try {
      // Usamos el género principal del artista para buscar "relacionados" (similares)
      const primaryGenre = (artist.genres && artist.genres.length > 0) ? artist.genres[0] : '';
      const queryParams = new URLSearchParams({ limit: 6 });
      if (primaryGenre) queryParams.set('genre', primaryGenre);
      
      const res = await apiCall('neuro', `/api/artists?${queryParams.toString()}`, 'GET');
      if (res?.success) {
        // Filtrar los que ya estan en la base (y al propio artista)
        const baseIds = new Set(baseArtists.map(a => a.id));
        baseIds.add(id);
        const artistsList = res.data?.artists || (Array.isArray(res.data) ? res.data : []);
        const filtered = dedupe(artistsList).filter(a => !baseIds.has(a.id)).slice(0, 6);
        relatedCache.current[id] = filtered;
        setInjected(prev => ({ ...prev, [id]: filtered }));

        enrichArtistsWithITunesImages(filtered).then(enriched => {
          relatedCache.current[id] = enriched;
          setInjected(prev => ({ ...prev, [id]: enriched }));
        });
      }
    } catch (e) { console.error(e); }
  }, [openId, baseArtists]);

  /* ---------- Alternar selección de artista ---------- */
  const toggleArtist = (artistObj) => {
    const id = typeof artistObj === 'string' ? artistObj : artistObj.id;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    if (typeof artistObj !== 'string') {
      setSelectedMap(prev => {
        const next = new Map(prev);
        next.has(id) ? next.delete(id) : next.set(id, artistObj);
        return next;
      });
    }
  };

  /* ---------- Click en tarjeta ---------- */
  const handleCardClick = (artist) => {
    toggleArtist(artist);
    // Los artistas inyectados (relacionados) solo alternan su seleccion.
    // No llamar expandArtist en ellos para no cambiar openId y que no desaparezcan del grid.
    if (!artist._isInjected) {
      expandArtist(artist);
    }
  };

  /* ---------- Construir lista plana para el grid ---------- */
  const flatList = [];
  for (const artist of baseArtists) {
    flatList.push({ ...artist, _isBase: true });
    // Si este artista esta abierto, agregar sus relacionados justo despues
    if (openId === artist.id && injected[artist.id]) {
      for (const rel of injected[artist.id]) {
        flatList.push({ ...rel, _isInjected: true, _parentId: artist.id });
      }
    }
  }

  const handleContinue = () => {
    if (selected.size < 3) return;
    setSubmitting(true);
    setTimeout(() => {
      // Pasar IDs y objetos completos para el perfil
      onConfirm([...selected], [...selectedMap.values()]);
    }, 1200);
  };

  return (
    <div className="w-100 py-3 d-flex flex-column align-items-center">
      <main
        className="w-100 d-flex flex-column align-items-center p-3 animate-fade-in-up"
        style={{ maxWidth: '840px' }}
      >
        {/* Titulo */}
        <section className="mb-3 text-center">
          <h2 className="h4 text-dark mb-1 fw-bold">¿Qué música te inspira?</h2>
          <p className="text-muted small mb-0">
            Elige al menos 3 artistas. Al seleccionar uno, descubrirás más artistas similares.
          </p>
        </section>

        {/* Busqueda */}
        <section className="mb-3 w-100" style={{ maxWidth: '440px' }}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 border-light-subtle rounded-start-pill text-secondary">
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>search</span>
            </span>
            <input
              type="text"
              className="form-control bg-white border-start-0 border-light-subtle rounded-end-pill py-2 small text-secondary"
              placeholder="Buscar artistas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Badge de seleccion */}
        {selected.size > 0 && (
          <section className="mb-3">
            <span className="badge bg-primary rounded-pill px-3 py-2 text-white small">
              {selected.size} {selected.size === 1 ? 'artista seleccionado' : 'artistas seleccionados'} — mínimo 3
            </span>
          </section>
        )}

        {/* Grid de artistas */}
        <section className="w-100 mb-3" style={{ minHeight: 220 }}>
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <div className="spinner-border text-primary mb-2" role="status" />
              <span className="text-muted small">Cargando artistas...</span>
            </div>
          ) : baseArtists.length === 0 ? (
            <div className="text-center py-5">
              <span className="material-symbols-outlined notranslate text-secondary mb-2" translate="no" style={{ fontSize: 40 }}>search_off</span>
              <p className="text-muted small">No se encontraron artistas con ese nombre.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '20px 12px',
              }}
            >
              {flatList.map((artist) => (
                <ArtistCard
                  key={`${artist.id}-${artist._isInjected ? 'inj' : 'base'}`}
                  artist={artist}
                  isSelected={selected.has(artist.id)}
                  isInjected={!!artist._isInjected}
                  onClick={handleCardClick}
                  size={86}
                />
              ))}
            </div>
          )}
        </section>

        {/* Paginacion */}
        {!loading && totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
            <button
              className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: 34, height: 34 }}
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '…' ? (
                  <span key={`e${i}`} className="text-muted small px-1">…</span>
                ) : (
                  <button
                    key={item}
                    className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center fw-semibold ${page === item ? 'btn-primary text-white' : 'btn-light text-dark'}`}
                    style={{ width: 34, height: 34, fontSize: 12 }}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                )
              )
            }

            <button
              className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: 34, height: 34 }}
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
          </div>
        )}

        {/* Boton continuar */}
        {selected.size >= 3 && (
          <div className="w-100 d-flex justify-content-center animate-fade-in-up">
            <Button
              onClick={handleContinue}
              variant="secondary"
              className="w-full max-w-xs py-3 shadow-lg rounded-pill"
              disabled={submitting}
            >
              {submitting ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" />
                  <span>Personalizando tu experiencia...</span>
                </span>
              ) : (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span>Continuar</span>
                  <span className="material-symbols-outlined notranslate" translate="no">arrow_forward</span>
                </span>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArtistSurvey;
