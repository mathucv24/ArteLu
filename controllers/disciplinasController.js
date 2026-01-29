import Disciplina from '../models/disciplinas.js';
import path from 'path';


const obtenerDisciplina = async (req, res) => {
    try {
        const disciplinas = await Disciplina.find({ fecha_eliminado: null });

        if (!disciplinas || disciplinas.length === 0) {
            return res.status(200).json({
                mensaje: 'No hay disciplinas registradas',
                disciplinas: disciplinas || []
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
                const nombreArchivo = `${Date.now()}-${i}-${foto.name}`;
                const rutaGuardado = path.join(process.cwd(), 'public/uploads', nombreArchivo);

                await foto.mv(rutaGuardado);

                imagenesGuardadas.push({
                    url: `/uploads/${nombreArchivo}`,
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
        if (horarios) disciplina.horarios = horarios;
        if (activa !== undefined) disciplina.activa = activa;

        const disciplinaActualizada = await disciplina.save();

        return res.status(200).json({
            mensaje: 'Actualizado correctamente',
            disciplina: disciplinaActualizada
        });

    } catch (error) {
        return res.status(500).json({ mensaje: "Error al actualizar: " + error });
    }
};

const eliminarDisciplina = async (req, res) => {

    try {

        const id = req.params.id;

        const disciplina = await Disciplina.findById(id);

        if (!disciplina) {
            return res.status(400).json({
                mensaje: 'No existe la disciplina con el id proporcionado'
            });
        }
        disciplina.fecha_eliminado = new Date();

        const disciplinaEliminada = await disciplina.save();

        if (disciplinaEliminada) {
            return res.status(200).json({
                mensaje: 'Disciplina eliminada correctamente',
                disciplina: disciplinaEliminada
            });
        } else {
            return res.status(400).json({
                mensaje: 'No se pudo eliminar la disciplina'
            });
        }

    } catch (error) {
        return res.json({
            mensaje: "Ha ocurrido un error al actualizar la disciplina... " + error
        });
    }

};

export { obtenerDisciplina, crearDisciplina, actualizarDisciplina, eliminarDisciplina };