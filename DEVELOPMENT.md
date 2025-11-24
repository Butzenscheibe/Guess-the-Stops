# Development Guide - DieButzenScheibe.dev Platform Architecture

This guide explains how to develop applications following the **DieButzenScheibe.dev platform architecture concept**, using Guess the Stops as a reference implementation.

## 🎯 Architecture Concept Overview

### Core Principles

1. **Autonomous Services**: Frontend and backend are completely independent
2. **Clear Separation**: Each service has a single, well-defined responsibility
3. **Modern Stack**: React for frontend, Express.js for backend
4. **Container-First**: Docker for development and deployment
5. **Kubernetes-Ready**: Easy transition from Docker Compose to K8s
6. **Domain-Based Routing**: Each app can have its own subdomain

### Technology Decisions

| Aspect | Technology | Rationale |
|--------|-----------|-----------|
| Frontend | React SPA | Component-based, large ecosystem, good for complex UIs |
| Frontend Build | React Scripts (for now) | Quick setup, later migrate to Vite |
| Backend | Express.js | Lightweight, flexible, well-known |
| API Style | REST | Simple, standard, HTTP-based |
| Containerization | Docker | Industry standard, consistent environments |
| Orchestration | Docker Compose → K8s | Start simple, scale as needed |
| Web Server | Nginx | High performance, efficient static file serving |
| Auth (future) | buAuth + Keycloak | Centralized, OAuth/OIDC standard |

## 📐 Project Structure

### Standard Layout

Every app should follow this structure:

```
your-app/
├── backend/                    # Backend service
│   ├── Dockerfile             # Backend container definition
│   ├── package.json           # Backend dependencies
│   ├── index.js               # Main server file
│   ├── routes/                # API route handlers (optional)
│   ├── services/              # Business logic (optional)
│   ├── models/                # Data models (optional)
│   └── .env.example           # Environment template
│
├── frontend/                   # Frontend service
│   ├── Dockerfile             # Frontend container (multi-stage)
│   ├── nginx.conf             # Nginx configuration
│   ├── package.json           # Frontend dependencies
│   ├── public/                # Public assets
│   └── src/                   # React source code
│       ├── index.js           # Entry point
│       ├── App.js             # Root component
│       ├── components/        # React components
│       ├── services/          # API client
│       ├── hooks/             # Custom hooks (optional)
│       └── styles/            # CSS files
│
├── docker-compose.yml         # Multi-service orchestration
├── .env.example               # Shared environment template
├── README.md                  # Main documentation
└── DEVELOPMENT.md             # This file
```

## 🔨 Setting Up a New App

### Step 1: Backend Setup

#### 1.1 Initialize Backend

```bash
mkdir -p your-app/backend
cd your-app/backend
npm init -y
npm install express cors
npm install --save-dev dotenv
```

#### 1.2 Create Basic Express Server

**backend/index.js**:
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// API status
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Your App API',
        version: '1.0.0'
    });
});

// Your API routes here
app.get('/api/example', (req, res) => {
    res.json({ message: 'Hello from backend!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
});
```

#### 1.3 Create Backend Dockerfile

**backend/Dockerfile**:
```dockerfile
FROM node:18-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
```

#### 1.4 Configure Environment

**backend/.env.example**:
```env
PORT=3000
FRONTEND_URL=http://localhost:3001
# Add your app-specific variables here
```

### Step 2: Frontend Setup

#### 2.1 Initialize React App

```bash
cd your-app/frontend
npm init -y
npm install react react-dom react-scripts
```

#### 2.2 Update Frontend package.json

**frontend/package.json**:
```json
{
  "name": "your-app-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-scripts": "^5.0.1"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

#### 2.3 Create React Structure

**frontend/public/index.html**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**frontend/src/index.js**:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**frontend/src/App.js**:
```javascript
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Your App</h1>
    </div>
  );
}

export default App;
```

#### 2.4 Create API Service

**frontend/src/services/api.js**:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    return response.json();
  }

  async getExample() {
    return this.request('/api/example');
  }
}

export default new ApiService();
```

#### 2.5 Create Frontend Dockerfile

**frontend/Dockerfile**:
```dockerfile
# Multi-stage build
FROM node:18-bullseye-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2.6 Create Nginx Config

**frontend/nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /health {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### 2.7 Configure Environment

**frontend/.env.example**:
```env
REACT_APP_API_URL=http://localhost:3000
```

### Step 3: Docker Compose Setup

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: your-app-backend
    ports:
      - "${BACKEND_PORT:-3000}:3000"
    environment:
      - PORT=3000
      - FRONTEND_URL=${FRONTEND_URL:-http://localhost:3001}
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: your-app-frontend
    ports:
      - "${FRONTEND_PORT:-3001}:80"
    environment:
      - REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:3000}
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    driver: bridge
```

### Step 4: Environment Configuration

**.env.example**:
```env
# Backend
BACKEND_PORT=3000

# Frontend
FRONTEND_PORT=3001
REACT_APP_API_URL=http://localhost:3000

# CORS
FRONTEND_URL=http://localhost:3001
```

### Step 5: Documentation

Create a comprehensive README.md explaining:
- Architecture overview
- Quick start guide
- API endpoints
- Development workflow
- Deployment instructions

## 🔄 Development Workflow

### Local Development (No Docker)

```bash
# Terminal 1: Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
cp .env.example .env
npm install
npm start
```

### Local Development (With Docker)

```bash
# Create .env file
cp .env.example .env

# Start services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Making Changes

#### Backend Changes
1. Edit files in `backend/`
2. Test locally: `cd backend && npm start`
3. Verify API with curl or Postman
4. Rebuild Docker if needed: `docker-compose up --build backend`

#### Frontend Changes
1. Edit files in `frontend/src/`
2. Changes auto-reload in dev mode
3. Test in browser
4. Rebuild Docker if needed: `docker-compose up --build frontend`

## 🎨 Best Practices

### Backend

✅ **Use Express Router** for organizing routes:
```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => { /* ... */ });
router.post('/', (req, res) => { /* ... */ });

module.exports = router;

// index.js
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
```

✅ **Separate Business Logic** from routes:
```javascript
// services/userService.js
class UserService {
  async getUsers() { /* ... */ }
}

// routes/users.js
const userService = require('../services/userService');
router.get('/', async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
});
```

✅ **Error Handling**:
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

✅ **Environment Variables** for all config
✅ **Health Check Endpoint** at `/health`
✅ **API Versioning** (e.g., `/api/v1/...`)

### Frontend

✅ **Component Organization**:
```
components/
├── common/          # Reusable components
│   ├── Button.js
│   └── Input.js
├── layout/          # Layout components
│   ├── Header.js
│   └── Footer.js
└── features/        # Feature-specific components
    └── GameBoard.js
```

✅ **Custom Hooks** for reusable logic:
```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.request(endpoint)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
}
```

✅ **Environment Variables** via REACT_APP_ prefix
✅ **Error Boundaries** for error handling
✅ **Code Splitting** for performance

### Docker

✅ **Multi-stage builds** for frontend (smaller images)
✅ **Health checks** for all services
✅ **Proper .dockerignore**:
```
node_modules
npm-debug.log
.env
.git
```

✅ **Security**: Don't run as root in production
✅ **Volumes** for persistent data

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS settings appropriate for domain
- [ ] Health checks working
- [ ] Logging configured
- [ ] Error handling tested
- [ ] SSL/TLS certificates ready
- [ ] Backup strategy in place

### Kubernetes Migration

When ready to move to Kubernetes:

1. **Create Kubernetes manifests**:
   - Deployments for backend & frontend
   - Services for internal communication
   - Ingress for external access
   - ConfigMaps for configuration
   - Secrets for sensitive data

2. **Use Helm** for templating and versioning

3. **Setup CI/CD** pipeline for automated deployments

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🤝 Team Workflow

For a 3-person team:

1. **Developer 1**: Backend API development
2. **Developer 2**: Frontend React development
3. **Developer 3**: DevOps, Docker, deployment

Each person can work independently because of clear service boundaries!

---

This development guide is a living document. Update it as you learn and improve the architecture!
