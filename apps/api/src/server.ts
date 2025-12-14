import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import routes from './api/routes/index';
import { errorHandler } from './api/middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));//loggins
app.use(helmet()); // Security Headers
app.use(cors({
    origin: [
        'http://localhost:4200',
        'http://localhost:5173',
        'http://localhost:3000', // Por si acaso
        process.env.FRONTEND_URL //  LA CLAVE MAESTRA
    ].filter(Boolean) as string[], // Filtra valores nulos si la variable no existe]
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Swagger Documentation
app.use('/swagger', swaggerUi.serve as any);
app.get('/swagger', swaggerUi.setup(swaggerSpec) as any);

// NUEVA RUTA PARA ORVAL
// Esto sirve el objeto JSON crudo que Orval consumirá para generar código
app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Routes
app.use('/api', routes); // Prefixing with /api for better structure, or keep root if legacy requires it.
// Legacy index.js used app.use(require('./api/routes/index')), which likely mounted on root.
// Let's mount on root to be safe, or check legacy routes.
// Legacy: app.use(require('./api/routes/index'))
// If legacy routes defined paths like '/ot', then mounting on root is correct.
app.use(routes);

// 404 Handler
app.use((req, res, next) => {
    const error: any = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
