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
app.use(morgan('dev')); // Logging
app.use(helmet()); // Security Headers
app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger Documentation
app.use('/swagger', swaggerUi.serve as any);
app.get('/swagger', swaggerUi.setup(swaggerSpec) as any);

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
