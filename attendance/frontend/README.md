# PresenceAI Frontend

Modern, responsive frontend for the PresenceAI Face Recognition Attendance System.

## Features

- ✅ Modern, responsive UI design
- ✅ Real-time attendance tracking
- ✅ Face recognition check-in
- ✅ Student management dashboard
- ✅ Trust scores & leaderboard
- ✅ Timeline and insights
- ✅ WebSocket integration for live updates

## Structure

```
frontend/
├── index.html          # Main dashboard page
├── login.html          # Login page
├── webscan.html        # Face recognition scan page
├── main.css            # Main stylesheet
├── app.js              # Frontend JavaScript logic
└── static/             # Static assets
    └── avatars/        # Avatar images
```

## Setup

### Option 1: Simple File Server

1. **Open directly in browser:**
   - Simply open `index.html` in your web browser
   - Note: Some features may require a web server due to CORS

### Option 2: Local Web Server

**Using Python:**
```bash
python -m http.server 3000
```

**Using Node.js:**
```bash
npx serve .
```

**Using PHP:**
```bash
php -S localhost:3000
```

Then open `http://localhost:3000` in your browser.

## Configuration

### API Endpoint

Update the API base URL in `app.js` if your backend is running on a different port:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### WebSocket URL

Update WebSocket URL if needed:

```javascript
const WS_URL = 'ws://localhost:8000/ws/events';
```

## Pages

### 1. Login (`login.html`)
- User authentication
- Role-based access (HOD, Teacher, Parent)

### 2. Dashboard (`index.html`)
- Main attendance dashboard
- Student list with status
- Statistics and analytics
- Real-time updates

### 3. Face Scan (`webscan.html`)
- Camera-based face recognition
- Multi-frame capture
- Real-time recognition feedback

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with WebSocket support

## Features Overview

### Dashboard
- View all students with attendance status
- Filter by class
- Real-time presence updates
- Trust scores display
- Leaderboard

### Face Recognition
- Camera access
- Multi-frame capture
- Real-time feedback
- Confidence scores

### Student Management
- Add/Edit/Delete students (HOD only)
- Upload avatars
- Assign seats
- View timelines

## Development

### Making Changes

1. Edit HTML files for structure
2. Edit `main.css` for styling
3. Edit `app.js` for functionality
4. Refresh browser to see changes

### Testing

- Test with backend running on `http://localhost:8000`
- Check browser console for errors
- Test on different screen sizes for responsiveness

## Deployment

### Static Hosting

Deploy to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any web server

### Build Steps

1. Update API URLs for production
2. Minify CSS/JS (optional)
3. Upload all files to hosting service
4. Ensure CORS is configured on backend

## Notes

- Requires backend API to be running
- WebSocket connection needed for real-time features
- Camera access required for face recognition
- Modern browser with ES6+ support needed

