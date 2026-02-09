import { Router } from "express";
import {
    registrarUsuario,
    verificarUsuario,
    iniciarSesion,
    actualizarPerfil,
    obtenerTodosLosUsuarios,
    obtenerDetalleUsuarioAdmin,
    cambiarEstadoUsuario,
    solicitarRecuperacion,
    restablecerPassword

} from '../controllers/sesionController.js';



const sesionRoutes = Router();

sesionRoutes.post('/registrar-usuario', registrarUsuario);
sesionRoutes.post('/iniciar-sesion', iniciarSesion);
sesionRoutes.put('/actualizar-usuario', actualizarPerfil);
sesionRoutes.get('/todos-los-usuarios', obtenerTodosLosUsuarios);
sesionRoutes.get('/usuario-detalle/:id', obtenerDetalleUsuarioAdmin);
sesionRoutes.put('/cambiar-estado/:id', cambiarEstadoUsuario);
sesionRoutes.post('/verificar-usuario', verificarUsuario);
sesionRoutes.post('/solicitar-recuperacion', solicitarRecuperacion);
sesionRoutes.put('/restablecer-password', restablecerPassword);
export default sesionRoutes;