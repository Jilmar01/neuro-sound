/**
 * 1. Función para pedir las recomendaciones al Backend (Con Token)
 */
async function obtenerRecomendaciones() {
    console.log("📡 Conectando al servidor (IP Local)...");

    const apiUrl = 'https://8nlqb9lj-5000.use2.devtunnels.ms/api/recommend/music';
    const token = localStorage.getItem('token');

    if (!token) {
        console.error("❌ No hay token. Usuario no logueado.");
        return [];
    }

    try {
        // --- PASO 1: Obtener la lista "ideal" basada en emociones ---
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        const respuestaServidor = await response.json();
        
        // Extraemos el array crudo de canciones
        const rawSongs = respuestaServidor.data?.songs || [];

        if (!Array.isArray(rawSongs) || rawSongs.length === 0) {
            console.warn("⚠️ El servidor de recomendaciones no devolvió canciones.");
            return [];
        }

        // --- PASO 2: FILTRADO REAL (Batch Request) ---
        // Vamos a preguntar al servidor de archivos (5001) cuáles de estas sí tiene.
        
        // Extraemos solo los nombres para la consulta
        const songTitles = rawSongs.map(s => s.name); 
        console.log(`🔎 Verificando disponibilidad de ${songTitles.length} canciones...`);

        const validSongs = await filtrarCancionesDisponibles(songTitles);
        
        // --- PASO 3: CRUCE DE DATOS ---
        // Cruzamos la lista original (que tiene género, bpm, etc.) 
        // con la lista válida (que tiene la URL de audio).
        
        const finalPlaylist = [];

        rawSongs.forEach(originalSong => {
            // Buscamos si esta canción existe en la respuesta del servidor 5001
            // Usamos toLowerCase() para evitar errores por mayúsculas/minúsculas
            const match = validSongs.find(v => v.name.toLowerCase() === originalSong.name.toLowerCase());

            if (match) {
                // SI EXISTE: La agregamos a la lista final y le inyectamos la URL
                finalPlaylist.push({
                    title: originalSong.name,             
                    src: match.url || match.link, // <--- AQUÍ GUARDAMOS LA URL YA LISTA
                    artist: (originalSong.artists && originalSong.artists.length > 0) ? originalSong.artists[0] : "Artista Desconocido",
                    cover: "img/defaultcover.png",
                    genre: originalSong.genre,
                    bpm: originalSong.bpm,
                    energy: originalSong.energy || 0
                });
            }
            // SI NO EXISTE: Simplemente la ignoramos (no se agrega al array)
        });

        console.log(`✅ Resultado Final: ${finalPlaylist.length} canciones reproducibles (de ${rawSongs.length} originales).`);
        return finalPlaylist;

    } catch (error) {
        console.error("❌ Fallo obteniendo recomendaciones:", error);
        return [];
    }
}

/**
 * Función Auxiliar: Pregunta al servidor 5001 por un lote de canciones
 */
async function filtrarCancionesDisponibles(titlesArray) {
    try {
        const apiUrlStream = "https://8nlqb9lj-5001.use2.devtunnels.ms/get-songs";
        
        // Enviamos TODOS los títulos de una vez
        const bodyObject = { "songsRequested": titlesArray };

        const response = await fetch(apiUrlStream, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyObject)
        });

        if (!response.ok) return [];

        const data = await response.json();
        
        // El servidor devuelve { files: [ {name: "A", url: "..."}, {name: "B", url: "..."} ] }
        // Solo retornamos el array de archivos encontrados
        return data.files || []; 

    } catch (error) {
        console.error("⚠️ Error filtrando canciones en servidor 5001:", error);
        return []; // Si falla la verificación, devolvemos vacío por seguridad
    }
}

/**
 * 2. Función para Pintar las canciones en el HTML
 */
function setOnContainer(songsList) {
    const mainContainer = document.getElementById("mainPanel");
    mainContainer.innerHTML = ""; 

    if (songsList.length === 0) {
        mainContainer.innerHTML = `
            <div class="alert alert-warning text-center glass-panel" role="alert">
                No se encontraron canciones disponibles.
            </div>`;
        return;
    }

    songsList.forEach((song, index) => {
        let specificSongContainer = document.createElement("div");
        specificSongContainer.className = "card mb-3 shadow-sm song-card"; 
        specificSongContainer.style.cursor = "pointer";

        specificSongContainer.onclick = () => {
            console.log(`Reproduciendo: ${song.title}`);
            if (typeof LocalPlayer !== 'undefined') {
                LocalPlayer.loadTrack(index);
                LocalPlayer.togglePlay();
            }
        };

        let rowDiv = document.createElement("div");
        // 'g-0' quita los espacios entre columnas para que quede más compacto
        rowDiv.className = "row g-0 align-items-center h-100"; 

        // --- COLUMNA IMAGEN (IZQUIERDA) ---
        let colImg = document.createElement("div");
        // CAMBIO CLAVE: 'col-3' (o col-4) fuerza el ancho fijo en móvil y escritorio.
        // 'd-flex' y 'justify-content-center' centran la imagen en su cajita pequeña si sobra espacio
        colImg.className = "col-3 d-flex align-items-center justify-content-center p-2"; 

        let songCover = document.createElement("img");
        songCover.src = song.cover && song.cover !== "img/defaultcover.png"
                        ? song.cover 
                        : "https://placehold.co/100x100?text=" + (song.genre || "Music");
        songCover.className = "img-fluid rounded"; // 'rounded' para bordes suaves
        songCover.alt = "Cover";

        // --- COLUMNA TEXTO (DERECHA) ---
        let colBody = document.createElement("div");
        // CAMBIO CLAVE: 'col-9' complementa al col-3 (3+9=12 columnas totales)
        colBody.className = "col-9";

        let cardBody = document.createElement("div");
        // 'ps-0' quita el padding izquierdo extra para acercar el texto a la imagen
        cardBody.className = "card-body ps-0 py-2"; 

        let songTitle = document.createElement("h5");
        songTitle.className = "card-title fw-bold text-white mb-1";
        songTitle.style.fontSize = "1rem"; // Ajuste de tamaño
        songTitle.innerText = song.title;

        let songArtist = document.createElement("p");
        songArtist.className = "card-text text-white-50 mb-1";
        songArtist.style.fontSize = "0.85rem";
        songArtist.innerText = song.artist;

        let songMeta = document.createElement("span");
        // Badge pequeño para el BPM
        songMeta.className = "badge bg-secondary bg-opacity-50 text-white fw-light";
        songMeta.style.fontSize = "0.7rem";
        const bpmInfo = song.bpm ? `BPM: ${song.bpm}` : "BPM: N/A";
        songMeta.innerText = `${bpmInfo}`;

        // Appends
        colImg.appendChild(songCover);
        cardBody.appendChild(songTitle);
        cardBody.appendChild(songArtist);
        cardBody.appendChild(songMeta);
        colBody.appendChild(cardBody);
        rowDiv.appendChild(colImg);
        rowDiv.appendChild(colBody);
        specificSongContainer.appendChild(rowDiv);
        mainContainer.appendChild(specificSongContainer);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const canciones = await obtenerRecomendaciones();
    
    if (canciones.length > 0) {
        if (typeof LocalPlayer !== 'undefined') {
            // Inicializamos el player con la lista YA VALIDADA y con URLs
            await LocalPlayer.init(canciones);
        }
        setOnContainer(canciones);
    } else {
        setOnContainer([]); // Mostrar mensaje de vacío
    }
});