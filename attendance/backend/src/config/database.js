import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Always load the backend-local .env (attendance/backend/.env) regardless of where
// the server is started from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '..', '.env');

dotenv.config({ path: envPath });
// Also load from process.cwd() as a fallback (does not override existing vars).
dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'attendance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

