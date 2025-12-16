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

// Ruta JSON para Generación de Código (Kubb)
// Esto sirve el objeto JSON crudo que Kubb consumirá para generar código
app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Routes
app.use('/api', routes); // Prefixing with /api for better structure.

app.use(routes);

// 404 Handler
app.use((req, res, next) => {
    const error: any = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// Error Handler
app.use(errorHandler);

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
    console.error('[FATAL] JWT_SECRET is not defined in .env. Server cannot start.');
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
