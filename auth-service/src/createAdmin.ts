import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserModel } from './models/mongo/User';

const createAdminAccount = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://admin:secret@localhost:27017/auth_db?authSource=admin';
    
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    const adminUsername = 'admin2';
    const adminEmail = 'admin@library.com';
    const adminPassword = 'admin123'; 

    const existingAdmin = await UserModel.findOne({ username: adminUsername });
    if (existingAdmin) {
      console.log(' Admin account already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await UserModel.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✓ Admin account created successfully');
    console.log(`  Username: ${adminUsername}`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Role: admin`);
    console.log(`  ID: ${admin.id}`);

    await mongoose.disconnect();
    console.log('✓ Connection closed');
    process.exit(0);

  } catch (error) {
    console.error('✗ Error creating admin account:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdminAccount();
