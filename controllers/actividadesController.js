import Actividades from '../models/actividades.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

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

            const nombreArchivo = `actividades/${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
            
            await s3.send(new PutObjectCommand({
                Bucket: 'artelu-images', 
                Key: nombreArchivo,
                Body: file.data,
                ContentType: file.mimetype,
            }));

            const urlPublicaR2 = "https://pub-91cda52a619f47388d183c1312680b2e.r2.dev"; 
            
            imagenData = { 
                public_id: null,
                url: `${urlPublicaR2}/${nombreArchivo}` 
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
            const urlParts = actividad.imagen.url.split('/');
            const nombreArchivo = urlParts[urlParts.length - 1];
            
            const key = `actividades/${nombreArchivo}`;

            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: 'artelu-images', 
                    Key: key
                }));
                console.log("Imagen eliminada de R2 exitosamente");
            } catch (errorCloudflare) {
                console.error("Error al eliminar la imagen de R2:", errorCloudflare);
            }
        }

        await Actividades.findByIdAndDelete(id);
        res.json({ mensaje: 'Actividad y su imagen eliminadas correctamente' });

    } catch (error) {
        console.error("Error general al eliminar:", error);
        res.status(500).json({ mensaje: 'Error al eliminar la actividad' });
    }
};

export { crearActividad, obtenerActividades, eliminarActividad };