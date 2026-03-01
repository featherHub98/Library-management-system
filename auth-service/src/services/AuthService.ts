import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/mongo/User';
import { SignupDto, LoginDto } from '../dtos/auth.dto';

export class AuthService {

  async register(userData: SignupDto): Promise<any> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const role = userData.role === 'admin' ? 'admin' : 'public';
    const user = await UserModel.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'super-secret-jwt-key',
      { expiresIn: '1h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    };
  };

  async login(credentials: LoginDto): Promise<any> {
    const user = await UserModel.findOne({ username: credentials.username });
    
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET || 'super-secret-jwt-key', 
      { expiresIn: '1h' }
    );

    return { 
      token, 
      user: { id: user.id, username: user.username, email: user.email, role: user.role } 
    };
  };

  async requestPasswordReset(email: string): Promise<any> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Email not registered');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await UserModel.findByIdAndUpdate(user.id, { resetCode: code, resetExpires: expires });
    console.log(`Password reset code for ${email}: ${code}`);
    return { message: 'Reset code sent' };
  };

  async resetPassword(email: string, code: string, newPassword: string): Promise<any> {
    const user = await UserModel.findOne({ email });
    if (!user || !user.resetCode || !user.resetExpires) {
      throw new Error('Invalid or expired reset code');
    }
    if (user.resetCode !== code || user.resetExpires < new Date()) {
      throw new Error('Invalid or expired reset code');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(user.id, { password: hashed, resetCode: undefined, resetExpires: undefined });
    return { message: 'Password updated' };
  };

}

export default new AuthService();