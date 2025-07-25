import { ApiError, globalErrorHandler } from '@server/middleware';
import { HttpStatusCode } from '@server/utils';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import proxy from 'express-http-proxy';
import * as path from 'path';

const app = express();

// Proxy middleware
app.set('trust proxy', 1);

// Parse request bodies
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Parse cookies
app.use(cookieParser('White cat'));

// Configure Cross-Origin Resource Sharing (CORS).
app.use(
  cors({
    origin: ['http://localhost:3001'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Auth'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/health', (req, res) => {
  res.send({ message: 'Welcome to gateway!' });
});

app.use('/', proxy('http://localhost:8001'));

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
