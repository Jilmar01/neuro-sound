
const SpotifyRecommender = {

    async getRecommendations(token) {
        console.log("Motor Spotify iniciado (modo playlists → tracks)");

        try {
            // 1. Obtener datos de api
            const survey = await this.fetchUserSurvey();
            
            if (!survey || !survey.genres) {
                console.warn("No se pudo obtener la encuesta o géneros.");
                return [];
            }

            // 2. Buscar playlists (Con factor ALEATORIO)
            const playlists = await this.searchPlaylists(token, survey);
            if (playlists.length === 0) return [];

            // 3. Extraer canciones únicas
            const tracks = await this.extractTracks(token, playlists);
            if (tracks.length === 0) return [];

            // 4. Rankear y mezclar
            const ranked = this.rankTracks(tracks, survey);

            console.log(`${ranked.length} canciones recomendadas`);
            return ranked;

        } catch (err) {
            console.error("Error en motor Spotify:", err);
            return [];
        }
    },


    async searchPlaylists(token, survey) {

        const shuffledGenres = (survey.genres || [])
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        const keywords = [
            survey.emotion,     
            ...shuffledGenres,  
            "mix"               
        ].filter(Boolean);

        const query = keywords.join(" ");
        
        // B. Generar un OFFSET aleatorio (0 a 10)
        const randomOffset = Math.floor(Math.random() * 10);

        console.log(`Buscando playlists: "${query}" (Offset: ${randomOffset})`);

        // Usamos el endpoint de búsqueda (Search API)
        const url = `https://api.spotify.com/v1/search` +
            `?q=${encodeURIComponent(query)}` +
            `&type=playlist` +
            `&limit=5` + 
            `&offset=${randomOffset}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return [];

        const data = await res.json();
        return (data.playlists?.items || []).filter(Boolean);
    },

    async extractTracks(token, playlists) {
        let tracks = [];
        const seen = new Set();

        // Mezclamos el orden de las playlists para no priorizar siempre la primera
        const shuffledPlaylists = playlists.sort(() => 0.5 - Math.random());

        for (const pl of shuffledPlaylists) {
            // Pedimos tracks de la playlist
            const res = await fetch(`${pl.tracks.href}?limit=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) continue;

            const data = await res.json();

            data.items.forEach(item => {
                const track = item.track;
                // Filtramos que tenga ID, que no sea local y que tenga preview o uri válida
                if (track && track.id && !seen.has(track.id) && !track.is_local) {
                    seen.add(track.id);
                    tracks.push(track);
                }
            });
        }

        return tracks;
    },

    rankTracks(tracks, survey) {
        tracks.forEach(t => {
            t.__score = 0;

            if (survey.artist_interest?.some(a =>
                t.artists.some(ar =>
                    ar.name.toLowerCase().includes(a.toLowerCase())
                )
            )) {
                t.__score += 5;
            }

            const albumName = t.album?.name?.toLowerCase() || "";
            survey.genres?.forEach(g => {
                if (albumName.includes(g.toLowerCase())) {
                    t.__score += 1;
                }
            });

            if (survey.emotion === "calma") {
                t.__score += 1;
            }

            t.__score += Math.random() * 2;
        });

        return tracks
            .sort((a, b) => b.__score - a.__score)
            .slice(0, 20)
            .map(t => this.formatTrack(t));
    },


    formatTrack(track) {
        const image = (track.album && track.album.images && track.album.images.length > 0)
            ? track.album.images[0].url 
            : "/assets/img/defaultcover.png";

        return {
            title: track.name,
            artist: track.artists.map(a => a.name).join(", "),
            album: track.album?.name || "",
            cover: image,
            uri: track.uri,
            type: "spotify",
            details: "Recomendado para ti"
        };
    },

    async fetchUserSurvey() {
        try {
            const localToken = localStorage.getItem('token');
            // Endpoint real
            const url = `${API_BASE_URL}/api/survey/get-register`;
            
            console.log("📡 Obteniendo preferencias del usuario...");

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localToken}`
                }
            });

            if (!response.ok) throw new Error("Error conectando con API de encuestas");

            const json = await response.json();
            const surveyData = json.data || json;
            
            console.log("Perfil cargado:", surveyData.emotion, surveyData.genres);
            return surveyData;

        } catch (e) {
            console.error("Error fetchUserSurvey:", e);
            return null;
        }
    }
};