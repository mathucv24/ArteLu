import mongoose from "mongoose";

const disciplinaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: String,
    horarios: [{
        dia: String, 
        horaInicio: String, 
        horaFin: String, 
        cuposDisponibles: Number
    }],
    precioMensual: Number,
    activa: {
        type: Boolean,
        default: true
    },
    imagenes: [{
        url: String,
        esPrincipal: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

const Disciplina = mongoose.model('disciplinas', disciplinaSchema);

export default Disciplina;