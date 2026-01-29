import { Router } from 'express';
import { registrarPago, obtenerPagosAdmin, actualizarEstadoPago } from '../controllers/pagoController.js';

const pagoRoutes = Router();

pagoRoutes.post('/registrar', registrarPago);

pagoRoutes.get('/', obtenerPagosAdmin);       
pagoRoutes.put('/:id', actualizarEstadoPago); 
export default pagoRoutes;