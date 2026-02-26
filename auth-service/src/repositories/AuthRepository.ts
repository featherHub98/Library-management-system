import { UserModel } from '../models/mongo/User';

export const createAuthRepository = () => {
  
  const findByUsername = async (username: string) => {
    return UserModel.findOne({ username });
  };

  const findByEmail = async (email: string) => {
    return UserModel.findOne({ email });
  };

  const createUser = async (username: string, email: string, hashedPassword: string) => {
    return UserModel.create({ username, email, password: hashedPassword });
  };

  const saveReset = async (userId: string, code: string, expires: Date) => {
    return UserModel.findByIdAndUpdate(userId, { resetCode: code, resetExpires: expires });
  };

  const resetPassword = async (userId: string, hash: string) => {
    return UserModel.findByIdAndUpdate(userId, { password: hash, resetCode: null, resetExpires: null });
  };

  return {
    findByUsername,
    findByEmail,
    createUser,
    saveReset,
    resetPassword,
  };
};