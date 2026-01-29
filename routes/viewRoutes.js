import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario.js'
import Pago from '../models/pago.js';
import Disciplina from '../models/disciplinas.js';
import TeamArteLu from '../models/teamArtelu.js';

const viewRoutes = Router();

viewRoutes.get('/', async (req, res) => {
    try {
        const disciplinas = await Disciplina.find({ activa: true });

        return res.render('inicio', { 
            disciplinas: disciplinas 
        });
    } catch (error) {
        console.error("Error al cargar inicio:", error);
        return res.render('inicio', { disciplinas: [] });
    }
});

viewRoutes.get('/teamArteLu', async(req, res) => {
    const equipo = await TeamArteLu.find({ activa: true });
    res.render('teamArteLu', { equipo });
});

viewRoutes.get('/iniciar-sesion', (req, res) => {
    return res.render('iniciar-sesion');
});

viewRoutes.get('/registrar-usuario', (req, res) => {
    return res.render('registrar-usuario');
});

viewRoutes.get('/cerrar-sesion',(req, res) => {
    
    res.cookie('userToken','', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.redirect('/');
});

viewRoutes.get('/dashboard', async (req, res) => {
    const userToken = req.cookies.userToken;
    if (!userToken) return res.redirect('/');

    try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        
        const usuarioDB = await Usuario.findById(decoded.id);

        if (usuarioDB.rol === 'USUARIO') {
            const pagosUsuario = await Pago.find({ usuario: decoded.id }).sort({ createdAt: -1 });

            res.render('dashboard-user', { 
                usuario: usuarioDB, 
                pagos: pagosUsuario 
            });
        } else {
            res.render('dashboard-admin', { usuario: usuarioDB });
        }
    } catch (error) {
        console.error(error);
        res.redirect('/iniciar-sesion');
    }
});

viewRoutes.get('/dashboard-user', async (req, res) => {
    try {
        const token = req.cookies.jwt; 
        
        if (!token) {
            return res.redirect('/');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRETO || 'secret_key');
        const usuarioId = decoded.id;

        const usuario = await Usuario.findById(usuarioId);
        const pagos = await Pago.find({ usuario: usuarioId }).sort({ createdAt: -1 });

        res.render('dashboard-user', { 
            user: usuario, 
            pagos: pagos,   
            mensaje: req.query.pago === 'exitoso' ? '¡Pago subido correctamente!' : null
        });

    } catch (error) {
        console.error(error);
        res.clearCookie('jwt');
        res.redirect('/');
    }
});


export default viewRoutes;