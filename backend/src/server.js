const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Mount
app.use('/api/master/materials', require('./routes/materialRoutes'));
app.use('/api/master/clients', require('./routes/clientRoutes'));
app.use('/api/master/employees', require('./routes/employeeRoutes'));
app.use('/api/godown', require('./routes/godownRoutes'));
app.use('/api/sites', require('./routes/siteRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/labour', require('./routes/labourRoutes'));
app.use('/api/daily-updates', require('./routes/dailyUpdateRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'K Square Backend API is running smoothly',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Atlas',
    databaseName: process.env.MONGO_DB_NAME || 'Ksquare',
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.send('K Square Construction ERP Backend API');
});

// Global 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
});

