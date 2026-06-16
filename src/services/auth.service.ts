import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_travel_invoice';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthService {
  private userRepository = new UserRepository();

  async register(data: RegisterDTO): Promise<{ user: any; token: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    const token = this.generateToken(user._id.toString(), user.email);

    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;

    return { user: safeUser, token };
  }

  async login(data: LoginDTO): Promise<{ user: any; token: string }> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user._id.toString(), user.email);

    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;

    return { user: safeUser, token };
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });
  }
}
