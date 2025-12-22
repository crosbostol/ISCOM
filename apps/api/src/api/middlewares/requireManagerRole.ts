import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to MANAGER and ADMIN roles only
 * Must be used AFTER requireApiKey middleware
 */
export const requireManagerRole = (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated (set by requireApiKey middleware)
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    // Extract user role
    const userRole = req.user.role as string;

    // Allow only MANAGER and ADMIN roles
    if (userRole === 'MANAGER') {
        return next();
    }

    // Forbidden for other roles
    return res.status(403).json({
        error: 'Forbidden: Insufficient privileges. Only MANAGER roles can access payroll data.'
    });
};
