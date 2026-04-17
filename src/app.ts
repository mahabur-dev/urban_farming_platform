import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import notFoundError from './app/error/notFoundError';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes/routes';
// import { startUnpaidIntentCronJob } from './app/helper/checkUnpaidIntent';

const app = express();

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '500mb' }));                         // ✅ added limit
app.use(express.urlencoded({ limit: '500mb', extended: true }));   // ✅ already correct

// Application routes (Centralized router)
app.use('/api/v1', router);

// Root router
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the server' });
});

// Not found route
app.use(notFoundError);

// Global error handler
app.use(globalErrorHandler);

// startUnpaidIntentCronJob(); // Start the cron job to check unpaid payment intents

export default app;