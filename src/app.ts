import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import invoiceRoutes from './routes/invoice.routes';
import templateRoutes from './routes/template.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Status check route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/templates', templateRoutes);

// Error Handler
app.use(errorHandler);

export default app;
