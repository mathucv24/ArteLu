import Actividades from '../models/actividades.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const crearActividad = async (req, res) => {
    try {
        const { titulo, tipo, fecha, hora, precio, descripcion, lugar, activa } = req.body;
        
        let imagenData = null;

        if (req.files && req.files.imagen) {
            const file = req.files.imagen;
            
            const extension = path.extname(file.name).toLowerCase();
            const extensionesValidas = ['.png', '.jpg', '.jpeg', '.webp'];
            
            if (!extensionesValidas.includes(extension)) {
                return res.status(400).json({ mensaje: 'Formato de imagen no válido' });
            }

            const nombreArchivo = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
            
            const uploadPath = path.join(__dirname, '../public/uploads/actividades', nombreArchivo);
            
            await file.mv(uploadPath);
            
            imagenData = { 
                public_id: null,
                url: `/uploads/actividades/${nombreArchivo}` 
            };
        }

        const nuevaActividad = new Actividades({
            titulo, 
            tipo, 
            fecha, 
            hora, 
            precio, 
            descripcion, 
            lugar,
            activa: activa === 'true',
            imagen: imagenData
        });

        await nuevaActividad.save();
        res.status(201).json({ mensaje: 'Actividad creada con éxito' });

    } catch (error) {
        console.error("Error al crear actividad:", error);
        res.status(500).json({ mensaje: 'Error interno al crear la actividad' });
    }
};

const obtenerActividades = async (req, res) => {
    try {
        const filtro = req.query.admin ? {} : { activa: true };
        const actividades = await Actividades.find(filtro).sort({ fecha: 1 }); 
        res.json(actividades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener actividades' });
    }
};

const eliminarActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const actividad = await Actividades.findById(id);

        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        if (actividad.imagen && actividad.imagen.url) {
            const nombreArchivo = actividad.imagen.url.split('/').pop();
            const rutaArchivo = path.join(__dirname, '../public/uploads/actividades', nombreArchivo);

            if (fs.existsSync(rutaArchivo)) {
                fs.unlinkSync(rutaArchivo);
            }
        }

        await Actividades.findByIdAndDelete(id);
        res.json({ mensaje: 'Actividad eliminada correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar la actividad' });
    }
};

export { crearActividad, obtenerActividades, eliminarActividad };