import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './src/database/db.js';
import { loadKnownFaces } from './src/services/faceRecognition.js';
import authRoutes from './src/routes/auth.js';
import studentRoutes from './src/routes/students.js';
import attendanceRoutes from './src/routes/attendance.js';
import trustRoutes from './src/routes/trust.js';
import insightRoutes from './src/routes/insights.js';
import departmentRoutes from './src/routes/departments.js';
import facultyRoutes from './src/routes/faculty.js';
import workerRoutes from './src/routes/workers.js';
import { setupWebSocket } from './src/websocket/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Serve static assets
app.use('/static', express.static(path.join(frontendPath, 'static')));

// Serve static files (avatars)
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

// Health check
app.get('/api/healthz', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use('/api', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api', attendanceRoutes); // Also mount for /api/checkin, /api/simulate-checkin, /api/timeline
app.use('/api/trust', trustRoutes);
app.use('/api', insightRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('[INFO] Starting PresenceAI backend...');
    console.log('[INFO] BASE_DIR:', __dirname);
    
    // Initialize database
    await initDb();
    console.log('[INFO] Database initialized');
    
    // Load known faces
    await loadKnownFaces();
    console.log('[INFO] Known faces loaded');
    
    // Start HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[INFO] Server running on http://0.0.0.0:${PORT}`);
    });
    
    // Setup WebSocket
    setupWebSocket(server);
    console.log('[INFO] WebSocket server ready');
    
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

