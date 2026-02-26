import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

export class AuthController {

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ 
          error: 'Username, email, and password are required' 
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ 
          error: 'Password must be at least 6 characters' 
        });
        return;
      }

      const user = await AuthService.register({ username, email, password });
      res.status(201).json({ 
        message: 'User created successfully', 
        userId: user.id,
        token: user.token
      });
    } catch (error: unknown) {
      console.error('Register error:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(500).json({ 
        error: message
      });
    }
  };

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ 
          error: 'Username and password are required' 
        });
        return;
      }

      const result = await AuthService.login({ username, password });
      res.status(200).json({
        message: 'Login successful',
        ...result
      });
    } catch (error: unknown) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Invalid credentials';
      res.status(401).json({ 
        error: message
      });
    }
  };

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }
      const result = await AuthService.requestPasswordReset(email);
      res.status(200).json(result);
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      const message = error instanceof Error ? error.message : 'Request failed';
      res.status(500).json({ error: message });
    }
  };

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        res.status(400).json({ error: 'Email, code and newPassword are required' });
        return;
      }
      const result = await AuthService.resetPassword(email, code, newPassword);
      res.status(200).json(result);
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      const message = error instanceof Error ? error.message : 'Reset failed';
      res.status(400).json({ error: message });
    }
  };

}

export default new AuthController();