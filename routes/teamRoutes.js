import { Router } from "express";
import { obtenerTeam, crearMiembroTeam, actualizarMiembroTeam, eliminarMiembroTeam } from '../controllers/teamController.js';

const teamRoutes = Router();

teamRoutes.get('/ver-team', obtenerTeam);
teamRoutes.post('/crear-miembro', crearMiembroTeam);
teamRoutes.put('/actualizar-miembro', actualizarMiembroTeam);
teamRoutes.delete('/:id', eliminarMiembroTeam);

export default teamRoutes;