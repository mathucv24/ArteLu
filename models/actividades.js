import mongoose from "mongoose";

const actividadSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    tipo: { type: String, enum: ['Taller', 'Competencia', 'Evento', 'Promoción'], default: 'Evento' },
    fecha: { type: Date },
    hora: { type: String },
    precio: { type: Number, default: 0 },
    descripcion: { type: String },
    lugar: { type: String, default: 'Sede Principal' },
    imagen: {
        public_id: String,
        url: String
    },
    activa: { type: Boolean, default: true }
}, { timestamps: true });

const Actividades = mongoose.model('Actividad', actividadSchema);

export default Actividades;