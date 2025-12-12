async function obtenerRecomendaciones() {
    console.log("📡 Conectando al servidor (IP Local)...");

    // USAMOS TU URL QUE SI FUNCIONA
    const apiUrl = 'http://10.40.36.219:5000/api/recommend/music';
    
    // USAMOS TU BODY QUE SI FUNCIONA
    const requestBody ={};

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`Error servidor: ${response.status}`);
        
        const data = await response.json();

        // --- EL PUNTO CLAVE: EL MAPEO EXACTO ---
        // Usamos data.files como en tu ejemplo funcional
        const formattedPlaylist = data.files.map(song => ({
            // Mapeamos al formato que tu LocalPlayer espera (title, src, artist, cover)
            title: song.name,             
            src: song.url,                
            artist: "Biblioteca Local",   
            cover: "img/defaultcover.png" 
        }));

        console.log(`✅ Datos recibidos y formateados: ${formattedPlaylist.length} canciones.`);
        return formattedPlaylist; // Devolvemos la lista limpia al Engine

    } catch (error) {
        console.error("❌ Fallo obteniendo recomendaciones:", error);
        return [];
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
    //songArtist.innerText = song.artists.join(", "); 
    songArtist.innerText = song.artist || "Artista Desconocido";
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