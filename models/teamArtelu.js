import mongoose from "mongoose";

const teamArteLuSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    cargo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: String,
    activa: {
        type: Boolean,
        default: true
    },
    imagenes: {
        url: String,
    }
}, {
    timestamps: true
});

const TeamArteLu = mongoose.model('teamArtelu', teamArteLuSchema);

export default TeamArteLu;