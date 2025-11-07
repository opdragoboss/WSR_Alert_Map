# Quick Setup Guide

## Getting Started (5 Minutes)

### Prerequisites
- Node.js v16+ installed
- Git installed
- Text editor (VS Code recommended)
- Terminal/Command Prompt

### Step 1: Install Dependencies

Open two terminal windows in the project root:

**Terminal 1 - Backend**:
```bash
cd backend
npm install
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend Setup**:
```bash
cd backend
copy .env.example .env    # Windows
# or
cp .env.example .env      # Mac/Linux
```

Edit `backend/.env` and add your NASA FIRMS API key (optional for testing):
```
NASA_FIRMS_API_KEY=your_key_here
```

Don't have an API key yet? No problem! The app will use mock data for the demo.

**Frontend Setup** (optional):
```bash
cd frontend
copy .env.example .env    # Windows
# or
cp .env.example .env      # Mac/Linux
```
a
The default configuration should work fine.

### Step 3: Start the Servers

**Terminal 1 - Start Backend**:
```bash
cd backend
npm run dev
```

You should see:
```
🔥 Wildfire Smoke Alert API Server
🚀 Server running on port 5000
```

**Terminal 2 - Start Frontend**:
```bash
cd frontend
npm start
```

The browser should automatically open to `http://localhost:3000`

### Step 4: Test the App

1. You should see a map with some data points (using mock data)
2. Try clicking on fire markers and air quality circles
3. Toggle layers on/off in the left sidebar
4. View alerts in the right panel

## Getting NASA FIRMS API Key (Optional)

To get real wildfire data:

1. Visit: https://firms.modaps.eosdis.nasa.gov/api/
2. Click "Request API Key"
3. Fill out the form with your email
4. Check email for the API key
5. Add it to `backend/.env`
6. Restart the backend server

## Troubleshooting

### Port Already in Use

**Backend (port 5000)**:
Edit `backend/.env` and change:
```
PORT=5001
```

**Frontend (port 3000)**:
The app will ask if you want to use port 3001. Press `Y` for yes.

### Module Not Found Errors

Make sure you ran `npm install` in both backend and frontend directories:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Map Not Loading

1. Check browser console for errors (F12)
2. Make sure backend is running on port 5000
3. Try hard refresh (Ctrl+Shift+R)

### CORS Errors

Make sure the backend CORS configuration matches your frontend URL:
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'http://localhost:3000'  // Should match frontend URL
}));
```

### Blank Screen

1. Check browser console for errors
2. Make sure all dependencies installed correctly
3. Try deleting `node_modules` and running `npm install` again

## Project Structure Quick Reference

```
wildfire/
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── server.js     # Start here
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   └── package.json
│
├── frontend/              # React application
│   ├── src/
│   │   ├── App.js        # Main component
│   │   ├── components/   # UI components
│   │   └── services/     # API client
│   └── package.json
│
└── docs/                  # Documentation
    ├── API_GUIDE.md
    ├── ARCHITECTURE.md
    └── PRESENTATION.md
```

## Development Workflow

### Adding New Features

1. **Backend**: Add route → controller → service
2. **Frontend**: Update API client → add/modify component → test

### Testing Changes

The app auto-reloads when you save files (hot reload enabled).

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Output will be in frontend/build/
```

## Common Tasks

### Change Map Default Location

Edit `frontend/src/App.js`:
```javascript
const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // [lat, lng]
```

### Adjust Cache Times

Edit `backend/.env`:
```
CACHE_TTL_WILDFIRES=300      # 5 minutes (in seconds)
CACHE_TTL_AIR_QUALITY=300
```

### Add New Data Layer

1. Create service in `backend/src/services/`
2. Add route in `backend/src/routes/`
3. Create controller in `backend/src/controllers/`
4. Add API call in `frontend/src/services/api.js`
5. Create layer component in `frontend/src/components/Map/`
6. Add toggle in `LayerControl.js`

## Next Steps

1. ✅ Get NASA FIRMS API key for real data
2. ✅ Read through the code to understand structure
3. ✅ Check out `docs/API_GUIDE.md` for API integration details
4. ✅ Review `docs/ARCHITECTURE.md` for system design
5. ✅ See `docs/PRESENTATION.md` for demo tips

## Resources

- **React Docs**: https://react.dev/
- **Leaflet Maps**: https://leafletjs.com/
- **Express.js**: https://expressjs.com/
- **NASA FIRMS**: https://firms.modaps.eosdis.nasa.gov/
- **OpenAQ**: https://openaq.org/
- **NOAA Weather**: https://www.weather.gov/documentation/services-web-api

## Need Help?

1. Check the error message carefully
2. Look in browser console (F12)
3. Check terminal output for backend errors
4. Review the documentation in `docs/`
5. Google the specific error message

## Tips for Hackathon

1. **Focus on Demo**: Make sure the core features work smoothly
2. **Use Mock Data**: Don't waste time if APIs are slow
3. **Test Early**: Test on the presentation computer
4. **Have Backup**: Screenshots/video if demo fails
5. **Practice**: Run through your demo 3-4 times

**Good luck! 🚀**

