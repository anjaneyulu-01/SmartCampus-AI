# PresenceAI - React Frontend Setup Guide

## 📋 Installation & Setup

### Step 1: Prerequisites
Ensure you have the following installed:
- **Node.js** 16+ (https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)

### Step 2: Install Dependencies

```bash
# Navigate to frontend directory
cd attendance/frontend

# Install all dependencies
npm install
```

This will install:
- React 18 with hooks support
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- Axios for API calls
- Recharts for data visualization
- And many more...

### Step 3: Start Development Server

```bash
npm run dev
```

This will:
- Start Vite development server on port 5173
- Enable hot module replacement (HMR)
- Proxy API calls to backend on port 8000
- Watch for file changes and auto-reload

Open `http://localhost:5173` in your browser

### Step 4: Build for Production

```bash
npm run build
```

This creates an optimized `dist/` folder with:
- Minified JavaScript
- Compressed CSS
- Optimized assets
- Production source maps

## 🎨 Technology Stack

### Frontend Framework
- **React 18.2** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Vite** - Lightning-fast build tool

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready animations
- **Lucide React** - Beautiful icon library

### State Management
- **Zustand** - Simple, lightweight state management
- No Redux complexity - just stores and hooks

### HTTP & APIs
- **Axios** - Promise-based HTTP client
- Built-in interceptors for authentication
- Automatic token injection

### Data Visualization
- **Recharts** - Composable chart library
- Bar charts, line charts, pie charts
- Responsive and animated

### UI/UX Features
- **React Hot Toast** - Toast notifications
- **Tailwind Forms** - Pre-styled form inputs
- **Glassmorphism effects** - Modern design

## 📁 Folder Structure

```
attendance/frontend/
├── src/
│   ├── App.jsx                    # Root component with routing
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global Tailwind styles
│   │
│   ├── pages/                     # Page components
│   │   ├── LoginPage.jsx          # Login & authentication
│   │   ├── DashboardPage.jsx      # Main dashboard
│   │   ├── ScannerPage.jsx        # Face recognition scanner
│   │   ├── StudentsPage.jsx       # Student management
│   │   └── InsightsPage.jsx       # Analytics & insights
│   │
│   ├── layouts/
│   │   └── DashboardLayout.jsx    # Main layout with sidebar
│   │
│   ├── components/                # Reusable components
│   │   ├── ProtectedRoute.jsx     # Auth guard
│   │   ├── StatCard.jsx           # Stats display card
│   │   └── AttendanceTable.jsx    # Attendance data table
│   │
│   ├── stores/
│   │   └── index.js               # Zustand stores
│   │       ├── useAuthStore       # Authentication
│   │       └── useAttendanceStore # Attendance data
│   │
│   └── utils/
│       └── index.js               # Utility functions
│
├── index.html                     # HTML entry point
├── package.json                   # Dependencies & scripts
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind customization
├── postcss.config.js              # PostCSS plugins
└── .eslintrc.json                 # ESLint rules

dist/                              # Built files (generated)
node_modules/                      # Dependencies (generated)
```

## 🔌 API Integration

The frontend automatically connects to the backend API:

```javascript
// Base URL: http://localhost:8000/api

// Authentication
POST /api/login                    // Login user
GET /api/me                        // Get current user
GET /api/logout                    // Logout user

// Attendance
GET /api/attendance                // Get attendance records
POST /api/attendance/mark          // Mark student present
GET /api/attendance/stats          // Get statistics

// Students
GET /api/students                  // Get student list
GET /api/students/:id              // Get student details
POST /api/students                 // Create student
PUT /api/students/:id              // Update student
DELETE /api/students/:id           // Delete student

// Analytics
GET /api/insights                  // Get insights data
GET /api/trust                     // Get trust scores
```

All requests automatically include the JWT token from localStorage.

## 🔐 Authentication Flow

1. **Login**: User enters credentials on `/login`
2. **Token Storage**: Token saved to localStorage
3. **Protected Routes**: Routes check for token
4. **Auto Injection**: Token added to all API requests
5. **Token Validation**: Backend validates JWT
6. **Logout**: Token removed from localStorage

## 🎨 Design System

### Color Palette
- **Primary**: `#22c55e` (Green)
- **Secondary**: `#06b6d4` (Cyan)
- **Danger**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)
- **Background**: `#0f172a` (Dark Blue-Black)

### Component Styles
```css
.card              /* Glass-effect cards with backdrop blur */
.card-hover        /* Hover effects on cards */
.btn-primary       /* Green gradient buttons */
.btn-secondary     /* Glass buttons */
.btn-danger        /* Red danger buttons */
.input-field       /* Styled input fields */
.badge-success     /* Green status badges */
.badge-warning     /* Yellow status badges */
.badge-danger      /* Red status badges */
```

## 🚀 Common Tasks

### Add a New Page

1. Create `src/pages/MyPage.jsx`
2. Add route to `src/App.jsx`:
   ```jsx
   <Route path="/mypage" element={<MyPage />} />
   ```
3. Add navigation item in `src/layouts/DashboardLayout.jsx`

### Add a New Component

1. Create `src/components/MyComponent.jsx`
2. Export and import in parent:
   ```jsx
   import MyComponent from '../components/MyComponent'
   ```

### Access Global State

```javascript
import { useAuthStore, useAttendanceStore } from '../stores'

export default function MyComponent() {
  const { user, login } = useAuthStore()
  const { attendance, fetchAttendance } = useAttendanceStore()
  
  return (
    <div>
      {/* Use state and functions */}
    </div>
  )
}
```

### Add API Endpoint

1. Create function in stores:
   ```javascript
   myApi: async () => {
     try {
       const response = await axiosApi.get('/my-endpoint')
       return response.data
     } catch (err) {
       console.error(err)
     }
   }
   ```
2. Use in component:
   ```javascript
   const myData = await myApi()
   ```

## 📱 Responsive Breakpoints

```javascript
// Tailwind CSS breakpoints
sm  : 640px   // Small phones
md  : 768px   // Tablets
lg  : 1024px  // Small laptops
xl  : 1280px  // Desktops
2xl : 1536px  // Large desktops

// Usage in components:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## 🔧 Troubleshooting

### Port 5173 already in use
```bash
# Kill process on port 5173 and restart
npm run dev -- --port 3000  # Use different port
```

### Dependencies installation fails
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot reload not working
```bash
# Restart dev server
npm run dev
```

### Styles not applying
```bash
# Rebuild Tailwind CSS
# Check that tailwind.config.js includes your src files
# Clear browser cache: Ctrl+Shift+Delete
```

### Camera permission denied
- Check browser privacy settings
- Allow camera access for localhost
- Use HTTPS in production (required for camera)

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Recharts Examples](https://recharts.org/examples)
- [Zustand Docs](https://github.com/pmndrs/zustand)

## 🤝 Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open browser to `http://localhost:5173`
4. Login with demo credentials
5. Explore dashboard, scanner, and insights pages
6. Make changes and see them live reload!

## ✨ Features to Explore

- ✅ Modern dark theme with glassmorphism
- ✅ Responsive mobile-first design
- ✅ Real-time attendance dashboard
- ✅ Face recognition scanner
- ✅ Student management interface
- ✅ Advanced analytics & insights
- ✅ Smooth animations & transitions
- ✅ Toast notifications
- ✅ Data visualization charts
- ✅ Protected authentication flow
