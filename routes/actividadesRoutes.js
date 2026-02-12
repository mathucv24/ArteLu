import { Router } from 'express';
import { crearActividad, obtenerActividades, eliminarActividad } from '../controllers/actividadesController.js';

const actividadesRoutes = Router();

actividadesRoutes.post('/crear-actividad', crearActividad);
actividadesRoutes.get('/ver-actividades', obtenerActividades);
actividadesRoutes.delete('/actividad/:id', eliminarActividad);

export default actividadesRoutes;