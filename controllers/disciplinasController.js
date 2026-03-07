import Disciplina from '../models/disciplinas.js';
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

const obtenerDisciplina = async (req, res) => {
    try {
       
        const disciplinas = await Disciplina.find();

        if (!disciplinas || disciplinas.length === 0) {
            return res.status(200).json({
                mensaje: 'No hay disciplinas registradas',
                disciplinas: []
            });
        };

        return res.status(200).json({
            mensaje: 'Consulta exitosa',
            disciplinas: disciplinas
        });

    } catch (error) {
        return res.status(500).json({
            mensaje: "Ha ocurrido un error al consultar las disciplinas... " + error
        });
    }
};

const crearDisciplina = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ mensaje: "No se recibieron datos en el formulario" });
        }

        const { nombre, descripcion, precioMensual, horarios, activa } = req.body;

        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        let imagenesGuardadas = [];

        if (req.files && req.files.fotos) {
            let fotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
            fotos = fotos.slice(0, 3);

            for (let i = 0; i < fotos.length; i++) {
                const foto = fotos[i];
                const nombreArchivo = `disciplinas/${Date.now()}-${i}-${foto.name.replace(/\s+/g, '-')}`;
                
                await s3.send(new PutObjectCommand({
                    Bucket: 'artelu-images', 
                    Key: nombreArchivo,
                    Body: foto.data,
                    ContentType: foto.mimetype,
                }));

                imagenesGuardadas.push({
                    url: `${URL_PUBLICA_R2}/${nombreArchivo}`, 
                    esPrincipal: i === 0
                });
            }
        }

        const nuevaDisciplina = {
            nombre,
            descripcion,
            precioMensual,
            horarios: typeof horarios === 'string' ? JSON.parse(horarios) : horarios,
            activa: activa !== undefined ? activa : true,
            imagenes: imagenesGuardadas
        };

        const disciplinaCreada = await Disciplina.create(nuevaDisciplina);

        return res.status(201).json({
            mensaje: "Disciplina creada correctamente",
            disciplina: disciplinaCreada
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error al crear: " + error.message });
    }
};

const actualizarDisciplina = async (req, res) => {
    try {
        const { id, nombre, descripcion, precioMensual, horarios, activa } = req.body;

        const disciplina = await Disciplina.findById(id);

        if (!disciplina) {
            return res.status(404).json({ mensaje: 'Disciplina no encontrada' });
        }

        if (nombre) disciplina.nombre = nombre;
        if (descripcion !== undefined) disciplina.descripcion = descripcion;
        if (precioMensual !== undefined) disciplina.precioMensual = precioMensual;
        
        if (horarios) {
            disciplina.horarios = typeof horarios === 'string' ? JSON.parse(horarios) : horarios;
        }
        
        if (activa !== undefined) {
            disciplina.activa = String(activa) === 'true';
        }

        if (req.files && req.files.fotos) {
            let nuevasFotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
            
            const totalImagenes = disciplina.imagenes.length + nuevasFotos.length;
            if (totalImagenes > 3) {
                return res.status(400).json({ mensaje: `Solo puedes tener 3 imágenes. Tienes ${disciplina.imagenes.length} y quieres subir ${nuevasFotos.length}.` });
            }

            for (let i = 0; i < nuevasFotos.length; i++) {
                const foto = nuevasFotos[i];
                const nombreArchivo = `disciplinas/${Date.now()}-${i}-${foto.name.replace(/\s+/g, '-')}`;

                await s3.send(new PutObjectCommand({
                    Bucket: 'artelu-images',
                    Key: nombreArchivo,
                    Body: foto.data,
                    ContentType: foto.mimetype,
                }));

                disciplina.imagenes.push({
                    url: `${URL_PUBLICA_R2}/${nombreArchivo}`,
                    esPrincipal: false 
                });
            }
        }

        if (disciplina.imagenes.length > 0) {
            disciplina.imagenes.forEach((img, index) => {
                img.esPrincipal = index === 0;
            });
        }

        const disciplinaActualizada = await disciplina.save();

        return res.status(200).json({
            mensaje: 'Actualizado correctamente',
            disciplina: disciplinaActualizada
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error al actualizar: " + error.message });
    }
};

const eliminarImagenDisciplina = async (req, res) => {
    try {
        const { idDisciplina, idImagen } = req.params;

        const disciplina = await Disciplina.findById(idDisciplina);
        if (!disciplina) return res.status(404).json({ mensaje: 'Disciplina no encontrada' });

        const imagen = disciplina.imagenes.id(idImagen);
        if (imagen) {
            const urlParts = imagen.url.split('/');
            const nombreArchivo = urlParts[urlParts.length - 1];
            const key = `disciplinas/${nombreArchivo}`; 

            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: 'artelu-images',
                    Key: key
                }));
            } catch (errorCloudflare) {
                console.error("Error al eliminar imagen de R2:", errorCloudflare);
            }
            
            disciplina.imagenes.pull(idImagen); 
        }

        if (disciplina.imagenes.length > 0) {
            disciplina.imagenes.forEach((img, index) => {
                img.esPrincipal = index === 0;
            });
        }

        await disciplina.save();

        return res.json({ 
            mensaje: 'Imagen eliminada', 
            imagenes: disciplina.imagenes 
        });

    } catch (error) {
        return res.status(500).json({ mensaje: "Error al eliminar imagen: " + error.message });
    }
};

const eliminarDisciplina = async (req, res) => {
    try {
        const { id } = req.params;

        const disciplina = await Disciplina.findById(id);

        if (!disciplina) {
            return res.status(404).json({
                mensaje: 'No existe la disciplina con el id proporcionado'
            });
        }

        if (disciplina.imagenes && disciplina.imagenes.length > 0) {
            for (const img of disciplina.imagenes) {
                const urlParts = img.url.split('/');
                const nombreArchivo = urlParts[urlParts.length - 1];
                const key = `disciplinas/${nombreArchivo}`;

                try {
                    await s3.send(new DeleteObjectCommand({
                        Bucket: 'artelu-images',
                        Key: key
                    }));
                } catch (errorCloudflare) {
                    console.error("Error al limpiar imagen huérfana en R2:", errorCloudflare);
                }
            }
        }

        await Disciplina.findByIdAndDelete(id);

        return res.status(200).json({
            mensaje: 'Disciplina y sus imágenes eliminadas correctamente de la base de datos',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje: "Ha ocurrido un error al eliminar la disciplina: " + error.message
        });
    }
};

export { obtenerDisciplina, crearDisciplina, actualizarDisciplina, eliminarDisciplina, eliminarImagenDisciplina };