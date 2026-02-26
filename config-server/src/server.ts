import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 8888;

const GITHUB_OWNER = 'featherHub98';
const GITHUB_REPO = 'configs';
const GITHUB_BRANCH = 'main';
const CONFIG_PATH_PREFIX = '';

// Default configurations for development
const defaultConfigs: Record<string, Record<string, any>> = {
  'auth-service': {
    dev: {
      db: {
        username: 'admin',
        password: 'secret',
        host: 'localhost',
        database: 'auth_db'
      },
      jwt: {
        secret: 'your-secret-key-change-in-production'
      }
    }
  },
  'book-service': {
    dev: {
      db: {
        username: 'admin',
        password: 'secret',
        host: 'localhost',
        database: 'bookstore'
      }
    }
  }
};

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/:serviceName/:profile', async (req: Request, res: Response) => {
  const { serviceName, profile } = req.params;

  const githubUrl = `${CONFIG_PATH_PREFIX}${serviceName}/${profile}.json`;
  const fullUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${githubUrl}`;

  try {
    console.log(`📡 Fetching config from GitHub: ${fullUrl}`);
    const response = await axios.get(fullUrl, { timeout: 5000 });
    console.log('✅ Config fetched from GitHub');
    res.json(response.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️ GitHub fetch failed: ${message}`);
    
    // Try to use default config
    const defaultConfig = defaultConfigs[serviceName]?.[profile];
    if (defaultConfig) {
      console.log(`📍 Using default config for ${serviceName}/${profile}`);
      return res.json(defaultConfig);
    }

    console.error(`❌ No configuration found for ${serviceName}/${profile}`);
    res.status(404).json({
      error: `Configuration not found for ${serviceName}/${profile}`,
      url: fullUrl,
      availableServices: Object.keys(defaultConfigs)
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Config Server running on port ${PORT}`);
  console.log(`📍 GitHub: ${GITHUB_OWNER}/${GITHUB_REPO} (${GITHUB_BRANCH})`);
  console.log(`📦 Default configs available for: ${Object.keys(defaultConfigs).join(', ')}`);
});
