import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
    // 1. Check API Key (Legacy/Script Access)
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.API_SECRET_KEY;

    if (validKey && apiKey === validKey) {
        return next();
    }

    // 2. Check JWT (User Access)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            req.user = decoded as any; // Type assertion as decoded is generic object
            return next();
        } catch (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Token' });
        }
    }

    // 3. Fallback
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key or Token' });
};
