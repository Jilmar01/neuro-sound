import React, { useState } from 'react';
import Button from '../common/Button';

const initialArtists = [
  { id: 'ludovico', name: 'Ludovico Einaudi', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS0RRVXNwdo0kaeuRTWF2kL7EtkPW6wMaHDy55LM_fIs_LCz7LkfYn-OPHBDT5gUTxr4W2N3RUS_MCKqu7mQsTic08uWtPmn3WNxt00bE8VyjibLKesY1f11P0fzphxSVo2CHbM-tym8Wz8AjOWsYQt5sF3Km486YF5391phlKH2hwNAfNJzM8XidUtsgPbcgvks9CwUmQHeGhmpFQuwc7XefSKh95x1USGzk2k7qRHCtumopbrkSaQnj7jVIRBcAm7p9auTFK2vU' },
  { id: 'eno', name: 'Brian Eno', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTq-AqUHC7yZ35JG_-0sl73Gqz7Ilro8Aim5Oth549eLWFuse87cAuR8bHn1vM9Ead557Lrtfel30DaHCgoT3mLt9GY7_S2GUW5ZExwYZjDYmafOSusRd6YqAtX5jEJWaWgdFGj38hbs27cJaxbW_GvvcymYeWob2z-H4JBeFRS_9hYmgYQFC6QN-IIJmRhTTbJBqy-_LXbqAPNEBLpV5AKF-4OtPh8eEV0vse-pFNj2Pjliceh6ajaftuE0ZPNLmEmC-MmHNNIv8' },
  { id: 'richter', name: 'Max Richter', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATb_B69O9m32kJTVm5fft7_C4YyENfxBQZqeVtu6G1ns7F4dW12BJr6wQYvLSeeiPaj8UlkosrBUw_mMZYnrrWKTXGj-z0IIMdtH_fTNHGRQS57Upwlg_v87jSdzDA8IMcZkLs2MQYVSQIqigOd2fP_-_AguCmt1pm-uojvWVAhCgVoh6ZZyF4hFzXKcnXvjoJViIqTjI2DyEW0CIWept4_gm5zr_m5t0-TGssrzyRWvCuA3TJC1OsElUF9MdUtCKc8BYHopcc3Jo' },
  { id: 'enya', name: 'Enya', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgdYnyvrgF72DrkYHJXLL8K9tCNpV1Wq4f4nyBUIUMPjx1vI50ChO3sSHkavlCdRfkRtq9Kr21oVN79bQBJKaWKbZQ0fwAKpNH-J9hS-RNkaNH0eqS3t6ymNsiEzjHGqIry3JMLUgezD_KdUD3aPYDjXnQT1F4ObG-mjOuH6yCVQcOPZavRbzStAR1CHHC8PxSpjcB4FmV6zvlQLW8s19FRpVXJGGTE4CLQWkopcwxImWaZJaov9vKmmv4wLZytFfCkk-JXYoOD2Y' },
  { id: 'marconi', name: 'Marconi Union', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDko8a6gj9E8Z4HQSX-JePgSg8KllZL7GxTpEuHZ1NDXt-AHaoUM9VJzrjp2aqdj2aYgLQvzf8FcZyyyO2_TqnJAXZ4dZ67IT9CfCh6FDvNfYEpEwJlTe4gfcoo8xxvqzvBfezy9a0v8wnk1FHgLHaXkcsgAf0GdX8voh68tWaY20DS_Ans4konqI4SQF1EZm2GUY7RZpwZVTar2kIMsQBaLsD7nPed9XljWGL-sK29AkxaeoXMo1HokFo9wFGJX1T836oCl9w0964' },
  { id: 'sigur', name: 'Sigur Rós', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoQ-sgVQi37PpArWQLoMenF63Bnn5Bd61UhncX4eCsgXsWojUI2Ac9_a261cubxaKYIpF9hZ7UKZga0rtTAvI_3wcgrdLnu3t5i7a6ru5enEAlCgzGgmBhW_R4ipGOlnGBJa3ys7k2HyCv-Q40fNi53G7nKJfoTmZ7kNsQJZsT7NTEBEytUicZBA1V10lsYFKuxD4PWUoKxxm_ct0TLAu3PGcr8YS_Jmgjj0Wt4YWh1uJKAPgT9-4RYMTrjfGYqOPJNRM5S9nC6xc' },
  { id: 'boniver', name: 'Bon Iver', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARmGgVZUU7p_J1coLRVIqyID7syyiaQQ5iWYALTpmlqFserKjNgDZ1phP7tIe406BIRdEkWl-CO-qnhG6SGIw-u3Xg7IKgaD1D4w5NVb-Hk2YkoCJydQ6UJszc2YmMeSp8iTPH4CsyMhzGNZgo2n2FO-8XDyoIU5OOn7o_fBPwYHD4DjaME-exDGlLWDRP9Qe_we0oWV5KbNlaoNu9hOS86YOm4nosqgiJrqxmDCFxLNFIjf7v1986L1RRhlYleyewC-CEPqT0h_c' },
  { id: 'nils', name: 'Nils Frahm', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFLZxa5PE2pAE0Da9CXBSjV8zVkoh3lGD6X02WiHOJn6XbOn2djuJ93pyLe36iZ1maCG3d9FJnZqBMte9Ll8cDoiTjD_BZphStbOYCGddb6c7NaNnnPvV-3W7atlyStlSIxYh-TT8Q0WIYT4Kyc2MYFBv_WnJ66NlNygyLpWUh6mkiNu770SsyhPZlnt_SXK-8G6dYvxOkHFrP7u9FvDJzCcujiSVjJFC9FNMDX8mHy-Q5wDXzn6i48YpcHgGDf7p9l2s3PVXSe4s' }
];

const ArtistSurvey = ({ onConfirm, onBack }) => {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleArtist = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleContinue = () => {
    if (selected.length < 3) return;
    setSubmitting(true);
    setTimeout(() => {
      onConfirm(selected);
    }, 1200);
  };

  const filteredArtists = initialArtists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-100 py-3 d-flex flex-column align-items-center justify-content-center">
      <main className="w-100 d-flex flex-column align-items-center p-3 animate-fade-in-up" style={{ maxWidth: '850px' }}>
        {/* Headline Section */}
        <section className="mb-4 text-center">
          <h2 className="h4 text-dark mb-1 fw-bold">¿Qué música te inspira?</h2>
          <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: '600px' }}>
            Elige al menos 3 artistas que te ayuden a encontrar calma o enfoque.
          </p>
        </section>

        {/* Search Bar Section */}
        <section className="mb-4 w-100 d-flex justify-content-center" style={{ maxWidth: '400px' }}>
          <div className="input-group">
            <span className="input-group-text bg-white bg-opacity-20 border-end-0 border-light-subtle rounded-start-pill text-secondary">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input 
              type="text" 
              className="form-control bg-white bg-opacity-10 border-start-0 border-light-subtle rounded-end-pill py-2 text-secondary"
              placeholder="Buscar artistas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Artist Grid */}
        <section className="row justify-content-center g-4 w-100 mb-4">
          {filteredArtists.map((artist) => {
            const isSelected = selected.includes(artist.id);
            return (
              <div 
                key={artist.id} 
                className="col-6 col-sm-4 col-md-3 d-flex flex-column align-items-center cursor-pointer"
                onClick={() => toggleArtist(artist.id)}
              >
                <div 
                  className="position-relative rounded-circle overflow-hidden mb-2 border border-4 border-transparent hover:border-light-subtle shadow-sm transition-all"
                  style={{ 
                    width: '120px', 
                    height: '120px',
                    boxShadow: isSelected ? '0 0 0 4px var(--bs-primary)' : 'none',
                    transition: 'all 0.3s'
                  }}
                >
                  <img 
                    src={artist.img} 
                    alt={artist.name} 
                    className="w-100 h-100 object-cover" 
                  />
                  {/* Selection Overlay */}
                  <div 
                    className="position-absolute inset-0 bg-dark bg-opacity-25 d-flex align-items-center justify-content-center transition-opacity"
                    style={{ opacity: isSelected ? 1 : 0 }}
                  >
                    <span className="material-symbols-outlined text-white text-3xl filled">
                      check_circle
                    </span>
                  </div>
                </div>
                <span className="fw-semibold text-center small text-dark mt-1">
                  {artist.name}
                </span>
              </div>
            );
          })}
        </section>

        {/* Actions Area */}
        <div className="w-100 d-flex justify-content-center gap-2 mt-2" style={{ maxWidth: '360px' }}>
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              icon="arrow_back"
              className="w-50 py-3 rounded-pill"
              disabled={submitting}
            >
              Regresar
            </Button>
          )}
          <Button
            onClick={handleContinue}
            variant="secondary"
            className={onBack ? "w-50 py-3 shadow-lg rounded-pill" : "w-100 py-3 shadow-lg rounded-pill"}
            disabled={selected.length < 3 || submitting}
          >
            {submitting ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" />
                <span>Personalizando...</span>
              </span>
            ) : (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span>Continuar</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ArtistSurvey;
