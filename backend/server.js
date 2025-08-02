require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const { PrismaClient } = require('@prisma/client');
const { initScheduledJobs } = require('./jobs/reminderScheduler');
const electionRoutes = require('./routes/electionRoutes');


const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Cross-origin support
app.use(morgan('dev')); // Logs
app.use(express.json()); // Parse JSON body
app.use(cookieParser()); // If you use cookies (optional)

initScheduledJobs();
// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/public', authRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Election routes
app.use('/api/elections', electionRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unexpected Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
