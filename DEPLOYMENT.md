# Deployment Guide

## Project Structure

```
Face-recognition-attendance-system/
├── attendance/
│   ├── backend/      # Node.js/Express API Server
│   └── frontend/      # Static HTML/CSS/JS Frontend
```

## Backend Deployment

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ database
- Server with SSH access (for VPS) or platform account (Heroku, Railway, etc.)

### Steps

1. **Upload backend files:**
```bash
# Copy backend folder to server
scp -r attendance/backend/ user@your-server.com:/var/www/presenceai/
```

2. **SSH into server:**
```bash
ssh user@your-server.com
cd /var/www/presenceai/backend
```

3. **Install dependencies:**
```bash
npm install --production
```

4. **Configure environment:**
```bash
cp .env.example .env
nano .env  # Edit with your database credentials
```

5. **Set up MySQL database:**
```bash
mysql -u root -p < src/database/init.sql
```

6. **Start server with PM2 (recommended):**
```bash
npm install -g pm2
pm2 start server.js --name presenceai-backend
pm2 save
pm2 startup
```

### Environment Variables (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=attendance_db
PORT=8000
NODE_ENV=production
```

### Platform-Specific Deployment

#### Heroku
```bash
cd backend
heroku create presenceai-backend
heroku addons:create cleardb:ignite
heroku config:set NODE_ENV=production
git push heroku main
```

#### Railway
1. Connect GitHub repository
2. Select backend folder
3. Set environment variables
4. Deploy

#### DigitalOcean App Platform
1. Connect repository
2. Select backend folder
3. Configure build: `npm install`
4. Configure run: `npm start`
5. Add MySQL database
6. Set environment variables

## Frontend Deployment

### Option 1: Static Hosting (Recommended)

#### Netlify
1. Connect GitHub repository
2. Build command: (leave empty)
3. Publish directory: `attendance/frontend`
4. Deploy

#### Vercel
1. Import project
2. Root directory: `attendance/frontend`
3. Framework preset: Other
4. Deploy

#### GitHub Pages
1. Push frontend files to `gh-pages` branch
2. Enable GitHub Pages in repository settings
3. Select `gh-pages` branch
4. Set root directory to `attendance/frontend`

### Option 2: Same Server as Backend

1. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/presenceai/attendance/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

2. **Update frontend API URL:**
Edit `attendance/frontend/app.js` (if needed):
```javascript
const API_BASE_URL = 'https://your-domain.com';
const WS_URL = 'wss://your-domain.com/ws/events';
```
Note: Frontend auto-detects API URL, so this may not be necessary.

### Option 3: CDN Deployment

Upload frontend files to:
- AWS S3 + CloudFront
- Cloudflare Pages
- Azure Static Web Apps

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Using Cloudflare

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS (Full)
4. Enable Automatic HTTPS Rewrites

## Database Setup

### Production MySQL Configuration

1. **Create dedicated user:**
```sql
CREATE USER 'presenceai_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON attendance_db.* TO 'presenceai_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Backup strategy:**
```bash
# Daily backup script
mysqldump -u presenceai_user -p attendance_db > backup_$(date +%Y%m%d).sql
```

3. **Enable MySQL remote access (if needed):**
```sql
GRANT ALL PRIVILEGES ON attendance_db.* TO 'presenceai_user'@'%' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs presenceai-backend
```

### Health Check Endpoint
```bash
curl https://your-domain.com/api/healthz
```

## Security Checklist

- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS origins (not `*`)
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Use Redis for token storage (production)
- [ ] Enable MySQL SSL connections

## Troubleshooting

### Backend won't start
- Check MySQL connection
- Verify environment variables
- Check port availability
- Review logs: `pm2 logs`

### Frontend can't connect to API
- Verify CORS settings
- Check API URL in frontend
- Verify backend is running
- Check firewall rules

### Database connection errors
- Verify MySQL is running
- Check credentials in `.env`
- Test connection: `mysql -u user -p`
- Check MySQL bind address

## Quick Deploy Commands

### Backend
```bash
cd attendance/backend
npm install --production
cp .env.example .env
# Edit .env with your credentials
pm2 start server.js --name presenceai-backend
```

### Frontend
```bash
cd attendance/frontend
# Update API_BASE_URL in app.js if needed (auto-detects by default)
# Upload to hosting service or configure Nginx
```

## Post-Deployment

1. Test all endpoints
2. Verify WebSocket connection
3. Test face recognition (if enabled)
4. Monitor logs for errors
5. Set up monitoring alerts
6. Configure backups

