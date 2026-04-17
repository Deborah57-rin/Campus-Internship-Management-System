const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { sendHealth } = require('./utils/health');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const fileRoutes = require('./routes/fileRoutes');

// Load env vars from server/.env regardless of current working directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// CORS first so browser calls from the Vite dev server (5173) to this API work for any path
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Health checks (after CORS; before /api/* routers so nothing shadows them)
app.get('/health', sendHealth);
app.get('/api/health', sendHealth);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/files', fileRoutes);

// Root (API banner). If GET / lacks `health` paths, you are hitting an old Node process — restart this server.
app.get('/', (req, res) => {
  res.json({
    message: 'USIU Internship API Running! ✅',
    health: ['/health', '/api/health', '/api/auth/health'],
    build: 'health-routes-v2',
  });
});

// Clear JSON 404 for /api/* so you can tell this process handled the request
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'not_found',
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      hint: 'If you expected a route, confirm URL and port. Try GET /health or GET /api/health on this server.',
    });
  }
  next();
});

// Plain 404 for non-API paths
app.use((req, res) => {
  res.status(404).type('text').send(`Cannot ${req.method} ${req.path}`);
});

// Default 5001: port 5000 is often taken by other dev tools (including some IDE helpers) on Windows.
const PORT = Number(process.env.PORT) || 5001;

(async () => {
  const dbOk = await connectDB();
  if (!dbOk) {
    console.warn(
      '\n⚠️  MongoDB did not connect. Login will fail until MONGO_URI is correct and Atlas is reachable.\n'
    );
  }

  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} (${__filename})`);
    console.log(
      `   Health: http://localhost:${PORT}/health  |  http://localhost:${PORT}/api/health  |  http://localhost:${PORT}/api/auth/health`
    );
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(
        `\n❌ Port ${PORT} is already in use. Set a different PORT in server/.env or stop the other process.\n`
      );
      process.exit(1);
    }
    throw err;
  });
})();
