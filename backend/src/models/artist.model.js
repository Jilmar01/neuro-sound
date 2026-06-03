import mongoose from "mongoose";

const ArtistSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    followers: {
        type: Number,
        required: true
    },
    genres: [{
        type: String
    }],
    name: {
        type: String,
        required: true
    },
    popularity: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Artist', ArtistSchema);