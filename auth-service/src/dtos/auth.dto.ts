export interface LoginDto {
  username: string;
  password: string;
}

export interface SignupDto {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'public';
}

export interface ResetPasswordDto {
  email: string;
}

export interface ChangePasswordDto {
  token: string;
  newPassword: string;
}

export interface AuthResponseDto {
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'public';
  };
}