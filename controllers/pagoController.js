import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import Pago from '../models/pago.js';
import Usuario from '../models/usuario.js'; 

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const registrarPago = async (req, res) => {
    try {
        if (!req.files || !req.files.comprobante) {
            return res.status(400).send('Debes subir una imagen del comprobante.');
        }

        const token = req.cookies.userToken;
        if (!token) return res.redirect('/');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuarioId = decoded.id;
        const usuarioData = await Usuario.findById(usuarioId);
        const archivo = req.files.comprobante;
        const nombreArchivo = `${Date.now()}_${archivo.name.replace(/\s/g, '_')}`;
        const uploadPath = path.join(__dirname, '../public/uploads/', nombreArchivo);
        const publicUrl = `/uploads/${nombreArchivo}`;

        archivo.mv(uploadPath, async (err) => {
            if (err) return res.status(500).send(err);

            const { disciplina, frecuencia, monto, referencia } = req.body;

            await Pago.create({
                usuario: usuarioId, 
                usuario_nombre: usuarioData.nombre, 
                disciplina,
                frecuencia,
                monto,
                referencia,
                comprobante_url: publicUrl
            });

            res.redirect('/dashboard');
        });

    } catch (error) {
        console.error("Error al registrar pago:", error);
        res.status(500).send("Ocurrió un error en el servidor.");
    }
};

const obtenerPagosAdmin = async (req, res) => {
    try {
        const pagos = await Pago.find({ estado: 'pendiente' }).sort({ createdAt: -1 });
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
};

const actualizarEstadoPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, mesCorrespondiente, anioCorrespondiente } = req.body;
        const updateData = { estado };
        
        if (mesCorrespondiente !== undefined) {
            updateData.mesCorrespondiente = mesCorrespondiente;
        }
        if (anioCorrespondiente !== undefined) {
            updateData.anioCorrespondiente = anioCorrespondiente;
        }

        await Pago.findByIdAndUpdate(id, updateData);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

export { registrarPago, obtenerPagosAdmin, actualizarEstadoPago };