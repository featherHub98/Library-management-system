import express, { Express } from 'express';
import mongoose from 'mongoose';
import consul from 'consul';
import axios from 'axios';

import authRoutes from './routes/authRoutes';
import userProfileRoutes from './routes/userProfile.routes';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';

const SERVICE_NAME = 'auth-service';
const SERVICE_PORT = 3001;
const PROFILE = process.env.PROFILE || 'dev';

interface Config {
  db: {
    username: string;
    password: string;
    host: string;
    database: string;
  };
  jwt: {
    secret: string;
  };
}

const defaultConfig: Config = {
  db: {
    username: 'admin',
    password: 'secret',
    host: 'localhost',
    database: 'auth_db'
  },
  jwt: {
    secret: 'super-secret-jwt-key'
  }
};

async function bootstrap() {
  const app: Express = express();
  app.use(express.json());
  app.use(cors());

  console.log(`[${SERVICE_NAME}] Starting service (profile: ${PROFILE})...`);

  let config: Config = defaultConfig;
  
  try {
    const configUrl = `http://localhost:8888/${SERVICE_NAME}/${PROFILE}`;
    console.log(`[${SERVICE_NAME}] Trying to fetch config from ${configUrl}...`);
    const response = await axios.get<Config>(configUrl, { timeout: 5000 });
    config = response.data;
    console.log(`[${SERVICE_NAME}] Config fetched from config-server`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[${SERVICE_NAME}] Config-server unavailable, using defaults. Error: ${message}`);
  }

  console.log(`[${SERVICE_NAME}] Connecting to MongoDB...`);
  const mongoUri = `mongodb://${config.db.username}:${config.db.password}@${config.db.host}:27017/${config.db.database}?authSource=admin`;
  
  try {
    await mongoose.connect(mongoUri);
    console.log(`[${SERVICE_NAME}] MongoDB connected successfully`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[${SERVICE_NAME}] MongoDB connection failed: ${message}`);
    console.warn(`[${SERVICE_NAME}] Continuing without database...`);
  }

  app.use('/', authRoutes);
  app.use('/user', userProfileRoutes);

  app.use(errorHandler);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  try {
    const consulClient = new consul({ host: 'localhost', port: 8500 });
    await consulClient.agent.service.register({
      name: SERVICE_NAME,
      address: 'localhost',
      port: SERVICE_PORT,
      check: {
        name: `${SERVICE_NAME}-health`,
        http: `http://localhost:${SERVICE_PORT}/health`,
        interval: '10s',
        timeout: '5s'
      },
    });
    console.log(`[${SERVICE_NAME}] Registered with Consul`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[${SERVICE_NAME}]  Consul registration failed, service will run without discovery: ${message}`);
  }

  app.listen(SERVICE_PORT, '0.0.0.0', () => {
    console.log(`[${SERVICE_NAME}]  Running on port ${SERVICE_PORT}`);
  });
}

bootstrap().catch(err => {
  console.error(`[${SERVICE_NAME}] Bootstrap failed:`, err);
  process.exit(1);
});