import mongoose from "mongoose";

const SongSchema = new mongoose.Schema(
  {
    track_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true
    },

    artists: {
      type: [String],
      required: true
    },

    genre: {
      type: String,
      required: true
    },

    energy: {
      type: Number,
      min: 1,
      max: 10
    },

    bpm: {
      type: Number,
      required: true
    },

    duration: {
      type: Number
    },

    tags: {
      type: [String],
      default: []
    },

    popularity: {
      type: Number,
      min: 0,
      max: 100
    },

    key: {
      type: String
    },

    camelot: {
      type: String
    },

    timbre: {
      type: Number
    },

    drop_time: {
      type: Number
    },

    danceability: {
      type: Number,
      min: 0,
      max: 1
    },

    vocal_presence: {
      type: Number,
      min: 0,
      max: 1
    },

    freq_class: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Song", SongSchema);
