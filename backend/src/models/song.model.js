import mongoose from "mongoose";

const SongSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    artists: { type: [String], required: true },  // varios artistas ✔
    genre: { type: String, required: true },
    mood: { type: String }, // calm, energetic, sad, uplifting...

    // Intensidad acústica
    energy: { type: Number, min: 1, max: 10 },

    // BPM y duración (obligatorios)
    bpm: { type: Number, required: true },
    duration: { type: Number }, // en segundos

    // Para recomendaciones 
    recommendedFor: { type: [String] }, // relax, focus, sleep, etc.

    // Tags de afinidad
    tags: { type: [String], default: [] },

    // Nuevos campos para compatibilidad con datos externos
    popularity: { type: Number },  // 0-100
    key: { type: String },         
    camelot: { type: String },
    timbre: { type: Number },
    drop_time: { type: Number },
    danceability: { type: Number },
    vocal_presence: { type: Number },

    // Frecuencia dominante detectada
    freq_class: { type: String }, // opcional (ej: Medios-Bajos)

  },
  { timestamps: true }
);

export default mongoose.model("Song", SongSchema);
