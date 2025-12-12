import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  emotion: {
    type: String,
    required: true
  },

  intensity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },

  tones: {
    group: {
      type: [Number],
      required: true
    },

    molestias: {
      tone1: { type: Number, required: true },
      tone2: { type: Number, required: true },
      tone3: { type: Number, required: true }
    },

    favorite: {
      type: String,
      required: true
    },

    least_favorite: {
      type: String,
      required: true
    }
  },

  genres: {
    type: [String],
    required: true
  },

  artist_interest: {
    type: [String],
    default: null
  },

  tempo_preference: {
    type: String,
    default: null
  },

  intent: {
    type: Number,
    default: null
  }

}, { timestamps: true });

export default mongoose.model("Survey", surveySchema);
