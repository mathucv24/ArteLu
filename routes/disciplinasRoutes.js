import { Router } from "express";
import { obtenerDisciplina, crearDisciplina, actualizarDisciplina, eliminarDisciplina } from '../controllers/disciplinasController.js';


const disciplinasRoutes = Router();

disciplinasRoutes.get('/ver-disciplinas', obtenerDisciplina);
disciplinasRoutes.post('/crear-disciplina', crearDisciplina);
disciplinasRoutes.put('/actualizar-disciplina', actualizarDisciplina);
disciplinasRoutes.delete('/:id', eliminarDisciplina);

export default disciplinasRoutes;