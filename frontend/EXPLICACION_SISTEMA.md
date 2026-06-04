# Guía del Frontend - NeuroSound

El frontend de **NeuroSound** está desarrollado en **React** y agrupado con **Vite**. Actúa como la interfaz de cara al usuario, gestionando la reproducción de música, la encuesta emocional (onboarding) y la visualización de datos de perfil.

## 🛠️ Tecnologías Utilizadas:
* **React 19:** Biblioteca principal para el desarrollo de la interfaz de usuario basada en componentes reactivos y estados.
* **Vite 8:** Compilador y agrupador (bundler) ultra-rápido optimizado para aplicaciones modernas de una sola página.
* **TailwindCSS 4:** Utilidades CSS de bajo nivel para dar un estilo altamente visual, responsivo y dinámico al reproductor y vistas.
* **PostCSS & Autoprefixer:** Herramientas de pre-procesamiento de estilos para asegurar la máxima compatibilidad de CSS moderno entre navegadores.
* **Firebase Hosting:** Configurado para la publicación del proyecto de cara a producción.
* **HTML5 Audio API:** Elemento nativo de audio (`<audio>`) que consume los streams generados y modulados por el backend en tiempo real.

---

## 📥 Lo que el Frontend espera recibir del Backend:

1. **Datos de Autenticación:**
   Confirmaciones con el estado de inicio de sesión de usuario y la información del usuario autenticado (`/api/auth/me`):
   ```json
   {
     "success": true,
     "data": {
       "id": "60d0fe4...",
       "name": "Nombre",
       "last_name": "Apellido",
       "email": "correo@ejemplo.com"
     }
   }
   ```

2. **Listas de Artistas:**
   Datos estructurados para desplegar en el onboarding o configuración:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "spotify_artist_id",
         "name": "Nombre de Artista",
         "img": "https://imagen-url.com",
         "genre": "pop",
         "genres": ["pop", "dance pop"]
       }
     ]
   }
   ```

3. **Playlists Recomendadas:**
   Una colección de pistas ordenadas por afinidad psicoacústica:
   ```json
   {
     "success": true,
     "recommendationId": "rec_9999",
     "songs": [
       {
         "track_id": "spotify_track_id",
         "name": "Canción Terapéutica",
         "artists": ["Nombre de Artista"],
         "bpm": 72,
         "camelot": "6B",
         "file_url": "http://127.0.0.1:5001/public/processed/cancion.m4a"
       }
     ]
   }
   ```

4. **Streaming de Audio:**
   Peticiones de streaming compatibles con el reproductor nativo del navegador, soportando solicitudes de rango parcial (`Range`) para saltar de posición de forma instantánea.

---

## 📤 Lo que el Frontend envía al Backend:

1. **Datos de Registro/Login:** Correo y contraseña cifrada o segura en texto plano para los formularios de registro.
2. **Encuesta Emocional (Valores de Ansiedad, Estrés y Tristeza):** Respuestas numéricas de la encuesta del usuario para calcular el perfil neuroacústico óptimo.
3. **Artistas Seleccionados (IDs):** Selección de artistas preferidos del onboarding para su uso en el algoritmo K-NN.
4. **Petición de Modulación de Audio:** Frecuencias preferidas para inyectar al reproductor de sonido.
