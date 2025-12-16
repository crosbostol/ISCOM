import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';

const authService = new AuthService();

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({ message: 'Username and password are required' });
                return;
            }

            const result = await authService.login(username, password);
            res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'Invalid Credentials') {
                res.status(401).json({ message: 'Invalid Credentials' });
            } else {
                next(error);
            }
        }

    }

    async getProfile(req: Request, res: Response): Promise<void> {
        // req.user is populated by the SecurityMiddleware
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        res.status(200).json(req.user);
    }
}
