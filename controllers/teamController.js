import TeamArteLu from '../models/teamArtelu.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const URL_PUBLICA_R2 = "https://pub-91cda52a619f47388d183c1312680b2e.r2.dev";

const obtenerTeam = async (req, res) => {
    try {
        const miembros = await TeamArteLu.find({ activa: true });
        res.status(200).json(miembros);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el equipo: " + error.message });
    }
};

const crearMiembroTeam = async (req, res) => {
    try {
        const { nombre, cargo, descripcion } = req.body;
        let urlImagen = '';

        if (req.files && req.files.imagen) {
            const imagen = req.files.imagen;
            const nombreArchivo = `team/${Date.now()}_${imagen.name.replace(/\s+/g, '-')}`;
            
            await s3.send(new PutObjectCommand({
                Bucket: 'artelu-images',
                Key: nombreArchivo,
                Body: imagen.data,
                ContentType: imagen.mimetype,
            }));
            
            urlImagen = `${URL_PUBLICA_R2}/${nombreArchivo}`;
        }

        const nuevoMiembro = await TeamArteLu.create({
            nombre,
            cargo,
            descripcion,
            imagenes: { url: urlImagen }
        });

        res.status(201).json({ mensaje: "Nuevo miembro del equipo añadido", miembro: nuevoMiembro });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear: " + error.message });
    }
};

const actualizarMiembroTeam = async (req, res) => {
    try {
        const { id, nombre, cargo, descripcion } = req.body;
        
        const miembro = await TeamArteLu.findById(id);
        if (!miembro) {
            return res.status(404).json({ mensaje: "Miembro no encontrado" });
        }

        miembro.nombre = nombre;
        miembro.cargo = cargo;
        miembro.descripcion = descripcion;

        if (req.files && req.files.imagen) {
            if (miembro.imagenes && miembro.imagenes.url) {
                const urlParts = miembro.imagenes.url.split('/');
                const nombreViejo = urlParts[urlParts.length - 1];
                try {
                    await s3.send(new DeleteObjectCommand({
                        Bucket: 'artelu-images',
                        Key: `team/${nombreViejo}`
                    }));
                } catch (err) {
                    console.error("Error al borrar imagen anterior del team:", err);
                }
            }

            const imagen = req.files.imagen;
            const nombreArchivo = `team/${Date.now()}_${imagen.name.replace(/\s+/g, '-')}`;
            
            await s3.send(new PutObjectCommand({
                Bucket: 'artelu-images',
                Key: nombreArchivo,
                Body: imagen.data,
                ContentType: imagen.mimetype,
            }));

            miembro.imagenes = { url: `${URL_PUBLICA_R2}/${nombreArchivo}` };
        }

        await miembro.save();

        res.status(200).json({ mensaje: "Actualizado correctamente", miembro });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar: " + error.message });
    }
};

const eliminarMiembroTeam = async (req, res) => {
    try {
        const { id } = req.params;
        
        const miembro = await TeamArteLu.findById(id);
        if (!miembro) {
            return res.status(404).json({ mensaje: "Miembro no encontrado" });
        }

        if (miembro.imagenes && miembro.imagenes.url) {
            const urlParts = miembro.imagenes.url.split('/');
            const nombreArchivo = urlParts[urlParts.length - 1];
            
            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: 'artelu-images',
                    Key: `team/${nombreArchivo}`
                }));
            } catch (err) {
                console.error("Error al borrar imagen de R2:", err);
            }
        }

        await TeamArteLu.findByIdAndDelete(id);
        
        res.status(200).json({ mensaje: "Miembro eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar: " + error.message });
    }
};

export { obtenerTeam, crearMiembroTeam, actualizarMiembroTeam, eliminarMiembroTeam };