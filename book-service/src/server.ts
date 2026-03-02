import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import consul from 'consul';
import { connectDB, connectPostgres } from './config/database';
import bookRoutes from './routes/book.routes';
import authorRoutes from './routes/author.routes';
import reviewRoutes from './routes/review.routes';
import wishlistRoutes from './routes/wishlist.routes';
import bulkOperationRoutes from './routes/bulkOperation.routes';
import borrowingRoutes from './routes/borrowing.routes';
import reservationRoutes from './routes/reservation.routes';
import recommendationRoutes from './routes/recommendation.routes';
import notificationRoutes from './routes/notification.routes';
import searchRoutes from './routes/search.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middleware/error.middleware';
import BookImage from './models/postgres/BookImage';


dotenv.config();

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3002');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use((req: Request, res: Response, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });

 
    this.app.use('/books', bookRoutes);
    this.app.use('/authors', authorRoutes);
    this.app.use('/reviews', reviewRoutes);
    this.app.use('/user', wishlistRoutes);
    this.app.use('/admin/bulk', bulkOperationRoutes);
    this.app.use('/borrowing', borrowingRoutes);
    this.app.use('/reservations', reservationRoutes);
    this.app.use('/recommendations', recommendationRoutes);
    this.app.use('/notifications', notificationRoutes);
    this.app.use('/search', searchRoutes);
    this.app.use('/analytics', analyticsRoutes);

   
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async registerWithConsul(): Promise<void> {
    try {
      const consulClient = new consul({ host: 'localhost', port: 8500 });
      await consulClient.agent.service.register({
        name: 'book-service',
        address: 'localhost',
        port: this.port,
        check: {
          name: 'book-service-health',
          http: `http://localhost:${this.port}/health`,
          interval: '10s',
          timeout: '5s',
        },
      });
      console.log('Registered with Consul');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Consul registration failed: ${message}`);
    }
  }

  public async start(): Promise<void> {
    try {
      console.log('[book-service] Connecting to databases...');
      
      try {
        await connectDB();
        console.log('MongoDB connected');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(` MongoDB connection failed: ${message}`);
      }

      try {
        await connectPostgres();
        console.log('PostgreSQL connected');
      
        await BookImage.sync();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`PostgreSQL connection failed: ${message}`);
      }

      const server = this.app.listen(this.port, () => {
        console.log(`Book Service running on port ${this.port}`);
        console.log(`Book API: http://localhost:${this.port}/books`);
      });

      
      await this.registerWithConsul();

      process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully...');
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();

export default server;