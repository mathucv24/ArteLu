import jwt from 'jsonwebtoken';
import Pago from '../models/pago.js';
import Usuario from '../models/usuario.js'; 
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const URL_PUBLICA_R2 = "https://pub-91cda52a619f47388d183c1312680b2e.r2.dev";

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
        
        const nombreArchivo = `comprobantes/${Date.now()}_${archivo.name.replace(/\s/g, '_')}`;
        
        await s3.send(new PutObjectCommand({
            Bucket: 'artelu-images',
            Key: nombreArchivo,
            Body: archivo.data,
            ContentType: archivo.mimetype,
        }));

        const publicUrl = `${URL_PUBLICA_R2}/${nombreArchivo}`;

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