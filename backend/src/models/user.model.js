import mongoose from "mongoose";

/**
 * Esquema para la autenticación y gestión de usuarios.
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, 
    },

    photo: {
      type: String,
      default: null,
    },

    status: {
      type: Boolean,
      default: true,
    },

    resetToken: String,
    resetExpires: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


export default mongoose.model("User", UserSchema);
