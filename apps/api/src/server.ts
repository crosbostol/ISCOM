import express from 'express';
import cors from 'cors';
import routes from './api/routes/index';
import { errorHandler } from './api/middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'http://localhost:4200'
}));

// Routes
app.use('/api', routes); // Prefixing with /api for better structure, or keep root if legacy requires it.
// Legacy index.js used app.use(require('./api/routes/index')), which likely mounted on root.
// Let's mount on root to be safe, or check legacy routes.
// Legacy: app.use(require('./api/routes/index'))
// If legacy routes defined paths like '/ot', then mounting on root is correct.
app.use(routes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
