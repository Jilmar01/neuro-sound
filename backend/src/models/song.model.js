import mongoose from "mongoose";

const SongSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true
    },

    popularity: {
      type: Number,
      min: 0,
      max: 100
    },

    duration_ms: {
      type: Number,
      required: true
    },

    explicit: {
      type: Boolean,
      default: false
    },

    artists: {
      type: [String],
      required: true
    },

    id_artists: {
      type: [String],
      default: []
    },

    release_date: {
      type: Date
    },

    danceability: {
      type: Number,
      min: 0,
      max: 1
    },

    energy: {
      type: Number,
      min: 0,
      max: 1
    },

    key: {
      type: Number,
      min: 0,
      max: 11
    },

    loudness: {
      type: Number
    },

    mode: {
      type: Number,
      enum: [0, 1]
    },

    speechiness: {
      type: Number,
      min: 0,
      max: 1
    },

    acousticness: {
      type: Number,
      min: 0,
      max: 1
    },

    instrumentalness: {
      type: Number,
      min: 0,
      max: 1
    },

    liveness: {
      type: Number,
      min: 0,
      max: 1
    },

    valence: {
      type: Number,
      min: 0,
      max: 1
    },

    tempo: {
      type: Number
    },

    time_signature: {
      type: Number
    }
  },
  { timestamps: true }
);

export default mongoose.model("Song", SongSchema, "songsV2");