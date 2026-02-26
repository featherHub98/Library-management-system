import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthService from '../services/AuthService';
import { UserModel } from '../models/mongo/User';

jest.mock('../models/mongo/User', () => ({
  UserModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user with hashed password', async () => {
      const user = { id: '1', username: 'testuser', email: 'test@example.com' };
      mockUserModel.create.mockResolvedValue(user as any);

      const result = await AuthService.register({ username: 'testuser', email: 'test@example.com', password: 'password123' });

      expect(mockUserModel.create).toHaveBeenCalledWith({ username: 'testuser', email: 'test@example.com', password: expect.any(String) });
      expect(result).toEqual(user);

      const hashedPassword = (mockUserModel.create.mock.calls[0][0] as any).password;
      const isValid = await bcrypt.compare('password123', hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const user = { id: '1', username: 'testuser', password: await bcrypt.hash('password123', 10) };
      mockUserModel.findOne.mockResolvedValue(user);

      const result = await AuthService.login({ username: 'testuser', password: 'password123' });

      expect(result.token).toBeDefined();
      expect(result.user).toEqual({ id: '1', username: 'testuser' });

      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'super-secret-jwt-key') as any;
      expect(decoded.id).toBe('1');
      expect(decoded.username).toBe('testuser');
    });

    it('should throw error for non-existent user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(AuthService.login({ username: 'testuser', password: 'password' })).rejects.toThrow('User not found');
    });

    it('should throw error for invalid password', async () => {
      const user = { id: '1', username: 'testuser', password: await bcrypt.hash('password123', 10) };
      mockUserModel.findOne.mockResolvedValue(user);

      await expect(AuthService.login({ username: 'testuser', password: 'wrongpassword' })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('requestPasswordReset', () => {
    it('should send reset code for valid email', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockUserModel.findOne.mockResolvedValue(user);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(undefined);

      const result = await AuthService.requestPasswordReset('test@example.com');

      expect(result.message).toBe('Reset code sent');
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('1', { resetCode: expect.stringMatching(/^\d{6}$/), resetExpires: expect.any(Date) });
    });

    it('should throw error for unregistered email', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(AuthService.requestPasswordReset('test@example.com')).rejects.toThrow('Email not registered');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid code', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        resetCode: '123456',
        resetExpires: new Date(Date.now() + 1000 * 60 * 60),
      };
      mockUserModel.findOne.mockResolvedValue(user);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(undefined);

      const result = await AuthService.resetPassword('test@example.com', '123456', 'newpassword');

      expect(result.message).toBe('Password updated');
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('1', { password: expect.any(String), resetCode: undefined, resetExpires: undefined });

      const hashedPassword = (mockUserModel.findByIdAndUpdate.mock.calls[0][1] as any).password;
      const isValid = await bcrypt.compare('newpassword', hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should throw error for invalid code', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        resetCode: '123456',
        resetExpires: new Date(Date.now() + 1000 * 60 * 60),
      };
      mockUserModel.findOne.mockResolvedValue(user);

      await expect(AuthService.resetPassword('test@example.com', 'wrongcode', 'newpassword')).rejects.toThrow('Invalid or expired reset code');
    });

    it('should throw error for expired code', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        resetCode: '123456',
        resetExpires: new Date(Date.now() - 1000),
      };
      mockUserModel.findOne.mockResolvedValue(user);

      await expect(AuthService.resetPassword('test@example.com', '123456', 'newpassword')).rejects.toThrow('Invalid or expired reset code');
    });
  });
});