# Security & Quality Fixes - Implementation Guide

This guide provides concrete code examples for implementing the critical recommendations from the audit report.

---

## 1. FIX JWT SECRET HANDLING

### 1.1 Update Auth Service Configuration

**File:** `auth-service/src/server.ts`

**Current Code:**
```typescript
const defaultConfig: Config = {
  db: {
    username: 'admin',
    password: 'secret',
    host: 'localhost',
    database: 'auth_db'
  },
  jwt: {
    secret: 'super-secret-jwt-key'  // ❌ HARDCODED
  }
};
```

**Fixed Code:**
```typescript
// Validate environment variables on startup
function validateConfig() {
  const requiredVars = ['JWT_SECRET', 'MONGO_USERNAME', 'MONGO_PASSWORD'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

const defaultConfig: Config = {
  db: {
    username: process.env.MONGO_USERNAME || 'admin',
    password: process.env.MONGO_PASSWORD || 'secret',
    host: process.env.MONGO_HOST || 'localhost',
    database: process.env.MONGO_DB || 'auth_db'
  },
  jwt: {
    secret: process.env.JWT_SECRET  // Now required!
  }
};

async function bootstrap() {
  try {
    validateConfig();  // Validate first!
    // ... rest of bootstrap
  } catch (error) {
    console.error('Configuration error:', error);
    process.exit(1);
  }
}
```

**Add to `.env.example`:**
```bash
# Database
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password_here
MONGO_HOST=localhost
MONGO_DB=auth_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Server
NODE_ENV=development
PROFILE=dev
PORT=3001
```

---

## 2. FIX PASSWORD STRENGTH VALIDATION

### 2.1 Create Password Validator Utility

**File:** `auth-service/src/utils/passwordValidator.ts` (NEW)

```typescript
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 12;
  private static readonly SPECIAL_CHARS = '@$!%*?&#';

  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];

    // Length check
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters`);
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Digit check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Special character check
    if (!new RegExp(`[${this.SPECIAL_CHARS}]`).test(password)) {
      errors.push(`Password must contain at least one special character: ${this.SPECIAL_CHARS}`);
    }

    // Common patterns to avoid
    const commonPatterns = ['password', '12345', 'qwerty', 'admin'];
    if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
      errors.push('Password contains common patterns. Choose a stronger password');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### 2.2 Update Auth Controller

**File:** `auth-service/src/controllers/AuthController.ts`

**Current Code:**
```typescript
if (password.length < 6) {
  res.status(400).json({ 
    error: 'Password must be at least 6 characters' 
  });
  return;
}
```

**Fixed Code:**
```typescript
import { PasswordValidator } from '../utils/passwordValidator';

async register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ 
        success: false,
        errors: ['Username, email, and password are required'] 
      });
      return;
    }

    // Validate password strength
    const validation = PasswordValidator.validate(password);
    if (!validation.isValid) {
      res.status(400).json({ 
        success: false,
        errors: validation.errors
      });
      return;
    }

    const result = await AuthService.register({ username, email, password, role });
    res.status(201).json({ 
      success: true,
      message: 'User created successfully', 
      data: result
    });
  } catch (error: unknown) {
    // ... error handling
  }
}
```

---

## 3. ADD RATE LIMITING TO AUTH ENDPOINTS

### 3.1 Create Rate Limiting Middleware

**File:** `auth-service/src/middleware/rateLimiter.middleware.ts` (NEW)

```typescript
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    attempts: number;
    resetTime: number;
    lockedUntil?: number;
  };
}

const WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;  // 15 minute lockout
const store: RateLimitStore = {};

export function createRateLimiter(identifier: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = identifier(req);
    const now = Date.now();

    if (!store[key]) {
      store[key] = {
        attempts: 0,
        resetTime: now + WINDOW_MS
      };
    }

    const userData = store[key];

    // Check if account is locked
    if (userData.lockedUntil && userData.lockedUntil > now) {
      const remainingTime = Math.ceil((userData.lockedUntil - now) / 1000);
      res.status(429).json({
        success: false,
        error: 'Too many failed attempts',
        message: `Account locked. Try again in ${remainingTime} seconds`
      });
      return;
    }

    // Reset window if expired
    if (now > userData.resetTime) {
      userData.attempts = 0;
      userData.resetTime = now + WINDOW_MS;
    }

    // Check attempt limit
    if (userData.attempts >= MAX_ATTEMPTS) {
      userData.lockedUntil = now + LOCKOUT_TIME;
      res.status(429).json({
        success: false,
        error: 'Too many failed attempts',
        message: `Account locked for ${Math.ceil(LOCKOUT_TIME / 1000)} seconds`
      });
      return;
    }

    // Store original send method
    const originalSend = res.json.bind(res);
    
    // Override json method to track failures
    res.json = function(body: any) {
      // If response is not successful, increment attempts
      if (!body.success && body.error) {
        userData.attempts++;
      } else if (body.error || res.statusCode >= 400) {
        userData.attempts++;
      }
      
      return originalSend(body);
    };

    next();
  };
}

// Export specific limiters
export const loginRateLimiter = createRateLimiter((req) => {
  return `login_${req.body.username || req.ip}`;
});

export const registerRateLimiter = createRateLimiter((req) => {
  return `register_${req.body.email || req.ip}`;
});

export const passwordResetRateLimiter = createRateLimiter((req) => {
  return `reset_${req.body.email || req.ip}`;
});
```

### 3.2 Update Auth Routes

**File:** `auth-service/src/routes/authRoutes.ts`

```typescript
import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { validateSignup, validateLogin, validateResetPassword } from '../middleware/validation.middleware';
import { 
  loginRateLimiter, 
  registerRateLimiter, 
  passwordResetRateLimiter 
} from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/register', registerRateLimiter, validateSignup, AuthController.register);
router.post('/login', loginRateLimiter, validateLogin, AuthController.login);
router.post('/forgot', passwordResetRateLimiter, validateResetPassword, AuthController.forgotPassword);
router.post('/reset', passwordResetRateLimiter, AuthController.resetPassword);

router.get('/health', (req, res) => res.send('OK'));

export default router;
```

---

## 4. FIX CORS CONFIGURATION

### 4.1 Update API Gateway

**File:** `api-gateway/src/server.ts`

**Current Code:**
```typescript
app.use(cors());  // ❌ Allows all origins!
```

**Fixed Code:**
```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001'
].filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn('⚠️ WARNING: No CORS origins configured, using default');
  allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // 24 hours
}));
```

**Add to `.env.example`:**
```bash
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 5. ADD SECURITY HEADERS (HELMET)

### 5.1 Install and Configure Helmet

**Terminal:**
```bash
cd api-gateway
npm install helmet
```

**File:** `api-gateway/src/server.ts`

```typescript
import helmet from 'helmet';

const app: Express = express();

// Add security headers middleware
app.use(helmet());

// Custom Content Security Policy for your needs
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'http://localhost:3001', 'http://localhost:3002']
  }
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
```

---

## 6. IMPLEMENT STRUCTURED LOGGING

### 6.1 Create Logger Utility

**File:** `auth-service/src/utils/logger.ts` (NEW)

```typescript
import winston from 'winston';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
      if (info.stack) {
        return JSON.stringify({
          timestamp: info.timestamp,
          level: info.level,
          message: info.message,
          error: {
            message: info.message,
            stack: info.stack
          }
        });
      }
      return JSON.stringify({
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        ...info
      });
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,  // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Sanitize sensitive information
function sanitizeData(data: any): any {
  if (!data) return data;
  
  const sensitive = ['password', 'token', 'secret', 'resetCode', 'resetExpires'];
  const sanitized = { ...data };
  
  for (const key of sensitive) {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

export const Log = {
  debug: (message: string, data?: any) => {
    logger.debug(message, sanitizeData(data));
  },
  info: (message: string, data?: any) => {
    logger.info(message, sanitizeData(data));
  },
  warn: (message: string, data?: any) => {
    logger.warn(message, sanitizeData(data));
  },
  error: (message: string, error?: Error | any, context?: any) => {
    logger.error(message, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context: sanitizeData(context)
    });
  }
};

export default logger;
```

### 6.2 Create Request Logging Middleware

**File:** `auth-service/src/middleware/requestLogger.middleware.ts` (NEW)

```typescript
import { Request, Response, NextFunction } from 'express';
import { Log } from '../utils/logger';

// Generate unique request ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Attach to request object for later use
  (req as any).id = requestId;

  // Log incoming request
  Log.info(`[${requestId}] Incoming request`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalSend = res.send.bind(res);
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    
    Log.info(`[${requestId}] Response sent`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    return originalSend(data);
  };

  next();
}
```

### 6.3 Update Auth Service to Use Logger

**File:** `auth-service/src/server.ts`

```typescript
import { requestLogger } from './middleware/requestLogger.middleware';
import { Log } from './utils/logger';

async function bootstrap() {
  const app: Express = express();
  app.use(express.json());
  app.use(cors());
  
  // Add request logging
  app.use(requestLogger);

  Log.info('Auth service starting...');

  // ... rest of bootstrap
}
```

---

## 7. FIX DOCKER SECRETS

### 7.1 Update docker-compose.yml

**File:** `docker-compose.yml`

**Current Code:**
```yaml
mongodb:
  image: mongo:latest
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: secret
    MONGO_INITDB_DATABASE: auth_db
  ports:
    - "27017:27017"
```

**Fixed Code:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-changeme}
      MONGO_INITDB_DATABASE: ${MONGO_DB:-auth_db}
    ports:
      - "${MONGO_PORT:-27017}:27017"
    volumes:
      - mongodata:/data/db
    healthcheck:
      test: echo 'db.adminCommand("ping")' | mongosh
      interval: 10s
      timeout: 5s
      retries: 5

  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-bookstore}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgresdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

  consul:
    image: consul:1.15.4
    ports:
      - "8500:8500"
    command: agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0

volumes:
  mongodata:
  postgresdata:
```

### 7.2 Create .env.example

**File:** `.env.example`

```bash
# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password_here
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=auth_db

# PostgreSQL
POSTGRES_DB=bookstore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Auth Service
AUTH_SERVICE_PORT=3001
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars

# Book Service
BOOK_SERVICE_PORT=3002

# API Gateway
GATEWAY_PORT=8080
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Logging
LOG_LEVEL=info
NODE_ENV=development
PROFILE=dev

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@library.com
```

### 7.3 Add .env to .gitignore

**File:** `.gitignore`

```bash
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
dist/
build/

# Logs
logs/
*.log
npm-debug.log*

# Docker volumes
mongodata/
postgresdata/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Coverage
coverage/
```

---

## 8. STANDARDIZE ERROR RESPONSES

### 8.1 Create Error Response Utilities

**File:** `book-service/src/utils/apiResponse.ts` (NEW)

```typescript
import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  timestamp: string;
  path?: string;
}

export class ApiResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    errors?: Array<{ field?: string; message: string }>,
    statusCode: number = 400
  ) {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  }

  static validationError(
    res: Response,
    errors: Array<{ field?: string; message: string }>,
    statusCode: number = 400
  ) {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  }

  static serverError(res: Response, message: string = 'Internal server error') {
    const response: ApiResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };
    
    return res.status(500).json(response);
  }
}
```

### 8.2 Update Controllers to Use Standardized Responses

**File:** `book-service/src/controllers/book.controller.ts`

```typescript
import { ApiResponseHandler } from '../utils/apiResponse';

async createBook(req: Request, res: Response): Promise<void> {
  try {
    const book = await bookService.createBook(req.body);
    return ApiResponseHandler.success(
      res,
      book,
      'Book created successfully',
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create book';
    return ApiResponseHandler.serverError(res, message);
  }
}
```

---

## 9. SETUP REFRESH TOKEN SYSTEM

### 9.1 Update Auth Service

**File:** `auth-service/src/services/AuthService.ts`

```typescript
import jwt from 'jsonwebtoken';

export class AuthService {
  
  async login(credentials: LoginDto): Promise<any> {
    const user = await UserModel.findOne({ username: credentials.username });
    
    if (!user) {
      // Don't reveal if user exists
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT (short-lived)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }  // 15 minutes instead of 1 hour
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }  // 7 days
    );

    // Store refresh token in database
    await UserModel.findByIdAndUpdate(user.id, {
      refreshToken: refreshToken,
      lastLogin: new Date()
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as { id: string };

      const user = await UserModel.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new JWT
      const newToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      return {
        token: newToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }
}
```

### 9.2 Add Refresh Token Endpoint

**File:** `auth-service/src/routes/authRoutes.ts`

```typescript
router.post('/refresh', AuthController.refreshToken);
```

**File:** `auth-service/src/controllers/AuthController.ts`

```typescript
async refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    const result = await AuthService.refreshToken(refreshToken);
    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: result
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    res.status(401).json({
      success: false,
      message
    });
  }
}
```

---

## 10. SETUP TESTING FRAMEWORK

### 10.1 Create Base Test Setup

**File:** `book-service/src/__tests__/helpers/testHelper.ts` (NEW)

```typescript
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const dbConnect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
};

export const dbDisconnect = async () => {
  if (mongoose.connection.isConnected) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const dbClear = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
```

### 10.2 Create Auth Service Tests

**File:** `auth-service/src/__tests__/AuthService.test.ts` (NEW)

```typescript
import { AuthService } from '../services/AuthService';
import { UserModel } from '../models/mongo/User';
import { dbConnect, dbDisconnect, dbClear } from './helpers/testHelper';
import { PasswordValidator } from '../utils/passwordValidator';

describe('AuthService', () => {
  beforeAll(async () => {
    await dbConnect();
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  beforeEach(async () => {
    await dbClear();
  });

  describe('register', () => {
    it('should create user with valid credentials', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!@#',
        role: 'public'
      };

      const result = await AuthService.register(userData);

      expect(result.user.username).toBe('testuser');
      expect(result.token).toBeDefined();
    });

    it('should not create user with weak password', async () => {
      const validation = PasswordValidator.validate('weak');
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should not create duplicate user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!@#'
      };

      await AuthService.register(userData);

      expect(
        AuthService.register(userData)
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!@#'
      };

      await AuthService.register(userData);

      const result = await AuthService.login({
        username: 'testuser',
        password: 'SecurePass123!@#'
      });

      expect(result.user.username).toBe('testuser');
      expect(result.token).toBeDefined();
    });

    it('should not login with invalid credentials', async () => {
      expect(
        AuthService.login({
          username: 'nonexistent',
          password: 'wrong'
        })
      ).rejects.toThrow();
    });
  });
});
```

---

## Implementation Checklist

- [ ] Fix JWT secret handling and validation
- [ ] Implement password strength validator
- [ ] Add rate limiting middleware
- [ ] Fix CORS configuration
- [ ] Install and configure Helmet
- [ ] Implement structured logging
- [ ] Add request logging middleware
- [ ] Update docker-compose with env variables
- [ ] Create .env.example file
- [ ] Standardize error response format
- [ ] Implement refresh token system
- [ ] Add auth service tests
- [ ] Add integration tests
- [ ] Test locally before deploying

---

**Priority:** Complete items in order listed above
**Estimated Time:** 20-30 development hours
**Review:** Have a senior developer review security changes

