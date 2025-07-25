import { config } from '@server/config';
import { ApiError, globalErrorHandler, rateLimiter } from '@server/middleware';
import { HttpStatusCode } from '@server/utils';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import useragent from 'express-useragent';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouterHub from './routes/authRouteHub';

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Proxy middleware
app.set('trust proxy', 1);

// Set security-related HTTP headers
app.use(helmet());

// Apply the rate limiting middleware to all requests.
app.use(rateLimiter());

// Parse request bodies
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Get user device info
app.use(useragent.express());

// Parse cookies
app.use(cookieParser(config.COOKIE_SECRET));

// Configure Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: ['http://localhost:3001'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Auth'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to auth!' });
});

// Shop route
app.use('/v1/hub/auth', authRouterHub);

// Handle 404 errors
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  return next(
    new ApiError(
      `Can't find ${req.originalUrl} on this server!`,
      HttpStatusCode.NOT_FOUND
    )
  );
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
