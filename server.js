import express from 'express';
import 'dotenv/config';
import db from './config/db.js';
import fileUpload from 'express-fileupload';
import pagoRoutes from './routes/pagoRoutes.js';
import viewRoutes from './routes/viewRoutes.js';
import sesionRoutes from './routes/sesionRoutes.js';
import cookieParser from 'cookie-parser';
import disciplinasRoutes from './routes/disciplinasRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import actividadesRoutes from './routes/actividadesRoutes.js';




const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    abortOnLimit: true,
    responseOnLimit: 'El archivo excede el tamaño permitido (10Mb)'
}));

db();

app.use('/', viewRoutes);
app.use('/api/sesion', sesionRoutes);
app.use('/api', disciplinasRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/team', teamRoutes);
app.use('/api', actividadesRoutes);

app.post('/registrar-pago', (req, res) => {
    res.redirect(307, '/api/pagos/registrar'); 
});

app.listen(PORT, () => {
    console.log(`La API esta ejecutandose en http://localhost:` + PORT);
    db();
});