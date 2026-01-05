import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadKnownFaces } from './src/services/faceRecognition.js';
import authRoutes from './src/routes/auth.mjs';
import studentRoutes from './src/routes/students.mjs';
import attendanceRoutes from './src/routes/attendance.mjs';
import trustRoutes from './src/routes/trust.mjs';
import insightRoutes from './src/routes/insights.mjs';
import departmentRoutes from './src/routes/departments.mjs';
import facultyRoutes from './src/routes/faculty.mjs';
import workerRoutes from './src/routes/workers.mjs';
import announcementRoutes from './src/routes/announcements.mjs';
import teacherRoutes from './src/routes/teacher.mjs';
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

// --- MOVE API ROUTES ABOVE STATIC FILE SERVING ---
// Routes
app.use('/api', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api', attendanceRoutes); // Also mount for /api/checkin, /api/simulate-checkin, /api/timeline
app.use('/api/announcements', announcementRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api', insightRoutes);
app.use('/api/teacher', teacherRoutes);

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
const frontendPath = fs.existsSync(frontendDistPath) ? frontendDistPath : path.join(__dirname, '..', 'frontend');
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

// SPA fallback (client-side routes like /scan)
app.get('*', (req, res, next) => {
  // Don't interfere with API or static assets.
  if (req.path.startsWith('/api') || req.path.startsWith('/avatars') || req.path.startsWith('/static')) {
    next();
    return;
  }
  // Only serve the SPA for browser navigations.
  const accept = req.headers.accept || '';
  if (!accept.includes('text/html')) {
    next();
    return;
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

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
    
    // MongoDB is initialized per request; skipping MySQL init
    console.log('[INFO] Skipping MySQL initialization; using MongoDB only');
    
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

