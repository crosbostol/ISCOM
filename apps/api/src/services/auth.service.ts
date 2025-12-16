import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository, User } from '../data/repositories/UserRepository';

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async login(username: string, pass: string): Promise<{ token: string; user: Omit<User, 'password_hash'> }> {
        const user = await this.userRepository.findByUsername(username);

        if (!user) {
            throw new Error('Invalid Credentials');
        }

        const isMatch = await bcrypt.compare(pass, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid Credentials');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES_IN || '12h' } as jwt.SignOptions
        );

        const { password_hash, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword
        };
    }
}
