import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireApiKey } from '../middlewares/security';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));
// Protected Routes
router.get('/profile', requireApiKey, authController.getProfile.bind(authController));

export default router;
