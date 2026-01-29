import TeamArteLu from '../models/teamArtelu.js';

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
        const { nombre,cargo, descripcion } = req.body;
        let urlImagen = '';

        if (req.files && req.files.imagen) {
            const imagen = req.files.imagen;
            const nombreArchivo = `${Date.now()}_${imagen.name}`;
            const rutaSubida = `./public/uploads/team/${nombreArchivo}`;
            
            await imagen.mv(rutaSubida);
            urlImagen = `/uploads/team/${nombreArchivo}`;
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
            const imagen = req.files.imagen;
            const nombreArchivo = `${Date.now()}_${imagen.name}`;
            const rutaSubida = `./public/uploads/team/${nombreArchivo}`;
            
            await imagen.mv(rutaSubida);
            miembro.imagenes = { url: `/uploads/team/${nombreArchivo}` };
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
        await TeamArteLu.findByIdAndDelete(id);
        
        res.status(200).json({ mensaje: "Miembro eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar: " + error.message });
    }
};

export { obtenerTeam, crearMiembroTeam, actualizarMiembroTeam, eliminarMiembroTeam };