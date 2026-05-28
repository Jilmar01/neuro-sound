import mongoose from 'mongoose';

const MusicServerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    domainUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^(https?:\/\/)(localhost|(\d{1,3}\.){3}\d{1,3}|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/.*)?$/,
        'URL de dominio no válida'
      ]
    },

    isActive: {
      type: Boolean,
      default: true
    },

    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('MusicServer', MusicServerSchema);
