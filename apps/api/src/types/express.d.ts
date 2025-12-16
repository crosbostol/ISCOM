
import { User } from '../../data/repositories/UserRepository';

declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'password_hash'>; // User without password
        }
    }
}
