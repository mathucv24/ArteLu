import mongoose from "mongoose";

const ENUM_ROL = [
    'USUARIO',
    'ADMIN'
];

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
    },
    lesiones: {
        type: String,
    },
    fecha_nacimiento_ppal: {
        type: Date,
    },
    rol_user: {
        type: Boolean,
        default: false,
    },
    alumno: {
        type:  String,
    },
    fecha_nacimiento_alumno: {
        type: Date,
    },
    edad: {
        type: Number,
    },
    activo: {
        type: Boolean,
        default: true,
    },
    rol: {
        type: String,
        enum: ENUM_ROL,
        default: ENUM_ROL[0],
    },
    verificado: {
        type: Boolean,
        default: false
    },
    codigoVerificacion: {
        type: Number, 
        default: null
    },
    codigoRecuperacion: {
        type: String,
        default: null
    }
}, 
{
    timestamps: true
});

const Usuario = mongoose.model('usuarios', usuarioSchema);

export default Usuario;