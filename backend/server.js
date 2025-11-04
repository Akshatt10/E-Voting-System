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
const { initializeSocket } = require('./services/socketService');
const { startStatusUpdater } = require('./services/electionStatusService');
const adminRoutes = require('./routes/admin');

const app = express();
const prisma = new PrismaClient();
const { Server } = require("socket.io");
const http = require('http');
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);



// Middleware
app.use(helmet()); // Security headers
// app.use(cors()); // Cross-origin support
app.use(morgan('dev')); // Logs
app.use(express.json()); // Parse JSON body
app.use(cookieParser()); // If you use cookies (optional)

app.set('trust proxy', 1); // Fixes X-Forwarded-For warning

app.use(cors({
  origin: [
    "http://localhost:5173",  // ← Keep this for local frontend
    'https://e-voting-lv8p245ys-akshat-tyagis-projects.vercel.app',
    'https://e-voting-five-zeta.vercel.app',
  ],
  credentials: true,
}));



const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"]
    }
});

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

app.use('/api/admin', adminRoutes);

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

// Start the status updater service
initializeSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`Server with WebSocket support running on http://localhost:${PORT}`);
  startStatusUpdater(io);
});