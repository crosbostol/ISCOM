import { Request, Response, NextFunction } from 'express';

export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.API_SECRET_KEY;

    if (!validKey) {
        console.error('[Security] API_SECRET_KEY not set in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    }

    next();
};
