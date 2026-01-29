import mongoose from 'mongoose';

const pagoSchema = new mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'usuarios', 
        required: true 
    },
    usuario_nombre: String, 
    disciplina: String,
    frecuencia: String, 
    monto: Number,
    referencia: String,
    comprobante_url: String, 
    estado: { 
        type: String, 
        enum: ['pendiente', 'aprobado', 'rechazado'], 
        default: 'pendiente' 
    },
    mesCorrespondiente: Number, 
    anioCorrespondiente: Number
}, {
    timestamps: true
});

const Pago = mongoose.model('pagos', pagoSchema);

export default Pago;