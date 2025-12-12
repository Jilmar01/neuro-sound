async function obtenerRecomendaciones() {
    console.log("📡 Conectando con el servidor...");
    
    const url = 'https://8nlqb9lj-5001.use2.devtunnels.ms/get-songs';
    
    // El cuerpo de la petición que mostraste anteriormente
    const requestBody = {};

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();

        // VALIDACIÓN: Verificamos dónde viene la lista de canciones.
        // En tu código de LocalPlayer usabas 'data.files'. 
        // Si el servidor cambió y usa 'data.songs', el '||' lo manejará.
        const rawSongs = data.files || data.data?.songs || [];

        // MAPEO: Convertimos lo que llega del servidor al formato estándar de tu App
        const formattedPlaylist = rawSongs.map(song => ({
            id: song._id || song.name, // Un identificador único
            title: song.name,
            // Si el artista viene en array lo unimos, si no, ponemos un default
            artist: Array.isArray(song.artists) ? song.artists.join(", ") : (song.artist || "Artista Desconocido"),
            src: song.url, // IMPORTANTE: El servidor debe devolver la URL del audio
            cover: song.cover || "img/defaultcover.png",
            bpm: song.bpm || 0
        }));

        console.log(`✅ Se obtuvieron ${formattedPlaylist.length} canciones.`);
        return formattedPlaylist; // Retornamos la lista al PlayerEngine

    } catch (error) {
        console.error("❌ Fallo en la petición de recomendaciones:", error);
        return []; // Retornamos arreglo vacío para no romper el programa
    }
}

// La función debe recibir el array de canciones (response.data.songs)
function setOnContainer(songsList) {
  const mainContainer = document.getElementById("mainPanel");
  
  // 1. Limpiamos el contenedor por si ya tenía contenido previo
  mainContainer.innerHTML = ""; 

  // 2. Iteramos sobre cada canción del JSON
  songsList.forEach(song => {
    
    // --- CREACIÓN DE ELEMENTOS ---

    // Contenedor principal de la canción (usando clases de Bootstrap 5)
    let specificSongContainer = document.createElement("div");
    specificSongContainer.className = "card mb-3 shadow-sm"; 
    specificSongContainer.style.maxWidth = "540px"; // Opcional: limitar ancho

    specificSongContainer.onclick = () => {
            // Ya no cargamos datos, solo le decimos al player:
            // "¡Oye, muévete a la canción número 'index' y dale play!"
            LocalPlayer.loadTrack(index);
            LocalPlayer.togglePlay();
    };
    // Estructura interna (Fila para imagen a la izq, texto a la derecha)
    let rowDiv = document.createElement("div");
    rowDiv.className = "row g-0 align-items-center";

    // Columna para el Cover
    let colImg = document.createElement("div");
    colImg.className = "col-md-4 text-center p-2";

    let songCover = document.createElement("img");
    // NOTA: Tu JSON no trae URL de imagen, así que usaremos un placeholder
    songCover.src = "https://placehold.co/100x100?text=" + song.genre; 
    songCover.className = "img-fluid rounded-start";
    songCover.alt = "Cover de " + song.name;

    // Columna para el contenido (Título, artista)
    let colBody = document.createElement("div");
    colBody.className = "col-md-8";

    let cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Título de la canción
    let songTitle = document.createElement("h5");
    songTitle.className = "card-title fw-bold";
    songTitle.innerText = song.name;

    // Artista (Recuerda que en el JSON 'artists' es un array)
    let songArtist = document.createElement("p");
    songArtist.className = "card-text text-muted";
    songArtist.innerText = song.artists.join(", "); 

    // Score o BPM (Datos extra del JSON)
    let songMeta = document.createElement("small");
    songMeta.className = "text-primary";
    songMeta.innerText = `BPM: ${song.bpm} | Energía: ${song.energy}/10`;

    // --- ARMADO DEL DOM (APPENDS) ---

    // 1. Armar columna imagen
    colImg.appendChild(songCover);

    // 2. Armar cuerpo de texto
    cardBody.appendChild(songTitle);
    cardBody.appendChild(songArtist);
    cardBody.appendChild(songMeta);
    colBody.appendChild(cardBody);

    // 3. Juntar columnas en la fila
    rowDiv.appendChild(colImg);
    rowDiv.appendChild(colBody);

    // 4. Meter fila en la tarjeta
    specificSongContainer.appendChild(rowDiv);

    // 5. Meter tarjeta en el panel principal
    mainContainer.appendChild(specificSongContainer);
  });
}

// Llamar a la función
obtenerRecomendaciones();