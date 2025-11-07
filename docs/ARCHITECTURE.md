# System Architecture

## Overview

The Wildfire Smoke Risk Alert Map is a full-stack web application built with a Node.js/Express backend and React frontend, providing real-time wildfire and air quality data visualization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   MapView    │  │  Dashboard   │  │  AlertPanel  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────────────────────────┐   │
│  │LayerControl  │  │      API Client Service          │   │
│  └──────────────┘  └──────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         │ (Axios)
┌────────────────────────▼────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                     │
│  /api/wildfires  /api/air-quality  /api/smoke-forecast     │
│  /api/wind-data  /api/alerts       /api/health             │
├─────────────────────────────────────────────────────────────┤
│  Controllers:                                                │
│  Validate requests, handle responses                         │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Wildfire  │  │Air Quality │  │   Smoke    │           │
│  │  Service   │  │  Service   │  │  Forecast  │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │                │                │                   │
│        │         ┌──────▼──────┐         │                  │
│        │         │    Cache    │         │                  │
│        │         │  (NodeCache)│         │                  │
│        │         └─────────────┘         │                  │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         │  External APIs │                │
         ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  NASA FIRMS  │  │    OpenAQ    │  │ NOAA Weather │
│   Wildfires  │  │ Air Quality  │  │  Wind/Smoke  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI library
- **React-Leaflet**: Map visualization
- **Axios**: HTTP client
- **Recharts**: Data visualization (optional)
- **CSS3**: Styling

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Axios**: External API calls
- **node-cache**: In-memory caching
- **dotenv**: Environment configuration

### External Services
- **NASA FIRMS**: Satellite wildfire detection
- **OpenAQ**: Ground-level air quality sensors
- **NOAA**: Weather and smoke forecast data

## Data Flow

### 1. Initial Page Load

```
User → Frontend → Backend API → External APIs
                              ↓
                          Cache Layer
                              ↓
                    Transform & Aggregate
                              ↓
User ← Frontend ← JSON Response
```

### 2. Real-Time Updates

```
Timer (5 min) → Fetch Latest Data → Update State → Re-render Components
```

### 3. Map Interaction

```
User Pans/Zooms Map → Update Center Coordinates → Fetch Data for New Area
                                                        ↓
                                              Update Visualizations
```

## Component Structure

### Frontend Components

```
App.js (Main Container)
├── Header.js (Title & Branding)
├── Sidebar
│   ├── Dashboard.js (Statistics)
│   └── LayerControl.js (Toggle Layers)
├── MapView.js (Main Map)
│   ├── WildfireLayer
│   ├── AirQualityLayer
│   ├── SmokeForecastLayer
│   └── WindLayer
└── AlertPanel.js (Alerts & Recommendations)
```

### Backend Routes

```
/api
├── /health              GET  - Health check
├── /wildfires           GET  - Active wildfire locations
├── /air-quality         GET  - Air quality readings
├── /smoke-forecast      GET  - Smoke dispersion forecast
├── /wind-data           GET  - Wind direction & speed
└── /alerts              GET  - Combined risk alerts
```

## State Management

### Frontend State (React Hooks)

```javascript
const [wildfires, setWildfires] = useState([]);
const [airQuality, setAirQuality] = useState([]);
const [smokeForecast, setSmokeForecast] = useState([]);
const [windData, setWindData] = useState(null);
const [alerts, setAlerts] = useState(null);
const [layers, setLayers] = useState({...});
const [mapCenter, setMapCenter] = useState([lat, lng]);
```

### Backend Cache

```javascript
// In-memory cache with TTL
const cache = new NodeCache({ 
  stdTTL: 300  // 5 minutes default
});
```

## API Request Flow

### Example: Fetch Wildfires

```
1. Frontend: fetchWildfires()
   ↓
2. Axios: GET /api/wildfires?bbox=...&days=1
   ↓
3. Backend: wildfireController.getWildfires()
   ↓
4. Service: wildfireService.getActiveWildfires()
   ↓
5. Check Cache: cache.get('wildfires_...')
   ↓
6. If miss: Call NASA FIRMS API
   ↓
7. Transform: Parse CSV → JSON
   ↓
8. Cache: cache.set('wildfires_...', data)
   ↓
9. Return: { success: true, data: [...] }
   ↓
10. Frontend: Update state, re-render map
```

## Caching Strategy

### Cache Keys
```
wildfires_{bounds}_{days}_{source}
airquality_{lat}_{lng}_{radius}
smoke_{bounds}_{hours}
wind_{lat}_{lng}
```

### Cache TTL
- Wildfires: 5 minutes
- Air Quality: 5 minutes
- Smoke Forecast: 15 minutes
- Wind Data: 10 minutes

### Cache Invalidation
- Time-based (TTL expiry)
- Manual refresh (user action)

## Error Handling

### Frontend
```javascript
try {
  const data = await fetchWildfires();
  setWildfires(data);
} catch (error) {
  console.error(error);
  setError('Failed to load data');
  // Use cached or mock data
}
```

### Backend
```javascript
try {
  const response = await axios.get(apiUrl);
  return parseData(response.data);
} catch (error) {
  console.error('API Error:', error);
  return getMockData(); // Fallback
}
```

## Security Considerations

### API Keys
- Stored in `.env` file (backend only)
- Never exposed to frontend
- Added to `.gitignore`

### CORS
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
```

### Input Validation
```javascript
// Validate coordinates
if (lat < -90 || lat > 90) {
  return res.status(400).json({ error: 'Invalid latitude' });
}
```

### Rate Limiting
```javascript
// Limit requests per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## Performance Optimization

### Backend
1. **Caching**: Reduce external API calls
2. **Response Compression**: gzip responses
3. **Async Operations**: Parallel API calls with Promise.all()
4. **Error Recovery**: Graceful fallbacks

### Frontend
1. **Lazy Loading**: Code splitting for components
2. **Memoization**: React.memo for expensive components
3. **Debouncing**: Limit map move events
4. **Virtual DOM**: React's efficient rendering

## Deployment Architecture

### Development
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
Proxy:    Frontend proxies /api → Backend
```

### Production
```
Frontend: https://your-app.com (Static hosting)
Backend:  https://api.your-app.com (Node.js server)
CDN:      CloudFlare/CloudFront for static assets
```

## Scalability Considerations

### Current Limitations
- In-memory cache (single server)
- No database (stateless)
- Synchronous API calls

### Future Improvements
1. **Redis Cache**: Shared cache across servers
2. **Database**: Store historical data
3. **WebSockets**: Real-time push updates
4. **Load Balancer**: Multiple backend instances
5. **CDN**: Distribute static assets
6. **Queue System**: Background data fetching

## Monitoring & Logging

### Backend Logging
```javascript
console.log(`${timestamp} - ${method} ${path}`);
console.error('API Error:', error);
```

### Frontend Error Tracking
```javascript
window.onerror = (msg, url, line) => {
  // Log to error tracking service
};
```

### Health Checks
```javascript
GET /api/health
→ { status: 'healthy', uptime: 12345 }
```

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev  # Runs both frontend & backend
   ```

2. **Testing**
   ```bash
   npm test     # Run tests (when implemented)
   ```

3. **Building**
   ```bash
   npm run build  # Build frontend for production
   ```

4. **Deployment**
   - Frontend: Deploy to Netlify/Vercel
   - Backend: Deploy to Heroku/Railway/AWS

## File Organization

```
wildfire/
├── backend/
│   ├── src/
│   │   ├── server.js          # Entry point
│   │   ├── routes/            # Route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   ├── .env                   # API keys (gitignored)
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API clients
│   │   ├── App.js             # Main component
│   │   └── index.js           # Entry point
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md        # This file
│   └── API_GUIDE.md
│
└── README.md
```

## Key Design Decisions

1. **Why React-Leaflet?**
   - Open source (MIT license)
   - Lightweight
   - Easy to integrate
   - Good community support

2. **Why node-cache?**
   - Simple in-memory solution
   - No external dependencies
   - Perfect for hackathon

3. **Why not a database?**
   - Data is real-time from APIs
   - No need to store history (for MVP)
   - Keeps architecture simple

4. **Why REST over GraphQL?**
   - Simpler to implement
   - Better for caching
   - Standard practice

## Open Questions & Future Work

- [ ] How to efficiently display smoke forecast overlay?
- [ ] Best way to visualize wind direction arrows?
- [ ] Should we add user authentication?
- [ ] How to handle offline mode?
- [ ] Mobile app version?

