# Guess the Stops

A web-based game where players guess train stations along railway routes. Built with modern web architecture following the DieButzenScheibe.dev platform concept.

## 🏗️ Architecture

This application follows a **modern, scalable web platform architecture** with separated frontend and backend:

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Guess the Stops App                       │
│                                                               │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │   Frontend (React)   │◄───────►│   Backend (Express) │   │
│  │                      │         │                      │   │
│  │  - React SPA         │  HTTP   │  - REST APIs         │   │
│  │  - Static Assets     │  JSON   │  - Business Logic    │   │
│  │  - Served by Nginx   │         │  - SQLite Database   │   │
│  │                      │         │                      │   │
│  │  Port: 3001 (80)     │         │  Port: 3000          │   │
│  └─────────────────────┘         └─────────────────────┘   │
│            │                                 │                │
│            └─────────────┬───────────────────┘               │
│                          │                                    │
│                   Docker Network                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer          | Technology      | Purpose                                   |
|----------------|-----------------|-------------------------------------------|
| Frontend       | React (SPA)     | UI, client-side logic                     |
| Frontend Build | React Scripts   | Bundling, development server              |
| Backend        | Express.js      | REST APIs, business logic                 |
| Database       | SQLite          | Railway timetable data, game archives     |
| Container      | Docker          | Isolation, deployment                     |
| Orchestration  | Docker Compose  | Multi-service deployment                  |
| Web Server     | Nginx           | Serve frontend static files               |

### Key Architectural Principles

1. **Autonomous Deployments**: Frontend and backend are completely independent
2. **Clear Separation**: Backend handles only API logic, no static file serving
3. **Scalability Ready**: Can be easily moved to Kubernetes
4. **Domain Ready**: Prepared for subdomain deployment (xyz.diebutzenscheibe.dev)
5. **Modern Stack**: Uses current best practices for web development

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- **SQLite Database Files** (see Database Setup section)

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/Butzenscheibe/Guess-the-Stops.git
cd Guess-the-Stops
```

#### 2. Setup Environment Variables
```bash
cp .env.example .env
```

#### 3. Prepare Database Files
Ensure you have the following database files in the `database/` directory:
```
database/
├── german-db       # German railway timetable
├── timetable-gen   # Swiss railway timetable
└── games           # Game archives (auto-created)
```

#### 4. Start with Docker Compose
```bash
docker-compose -f docker-compose.new.yml up --build
```

#### 5. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

### Development Without Docker

#### Backend Development
```bash
cd backend
npm install
PORT=3000 npm start
```

#### Frontend Development
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:3000 npm start
```

The frontend will start on http://localhost:3001 by default.

## 📁 Project Structure

```
Guess-the-Stops/
├── backend/                    # Backend Express.js API
│   ├── Dockerfile             # Backend container definition
│   ├── package.json           # Backend dependencies
│   ├── index.js               # Express server & routes
│   ├── gameManager.js         # Game business logic
│   ├── game.js                # Game model
│   ├── sort-the-stations.js   # STS game mode logic
│   └── .env.example           # Backend environment template
│
├── frontend/                   # Frontend React application
│   ├── Dockerfile             # Frontend container (multi-stage)
│   ├── nginx.conf             # Nginx configuration
│   ├── package.json           # Frontend dependencies
│   ├── public/                # Public static assets
│   │   └── index.html         # HTML template
│   └── src/                   # React source code
│       ├── index.js           # React entry point
│       ├── App.js             # Main App component
│       ├── components/        # React components
│       │   └── GuessTheStops.js
│       ├── services/          # API client services
│       │   └── api.js
│       └── styles/            # CSS stylesheets
│           └── style.css
│
├── database/                   # SQLite databases (not in repo)
│   ├── german-db              # German railway data
│   ├── timetable-gen          # Swiss railway data
│   └── games                  # Game archives
│
├── docker-compose.new.yml     # Multi-service Docker setup
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

#### Root `.env` (Docker Compose)
```env
# Backend
BACKEND_PORT=3000

# Frontend
FRONTEND_PORT=3001
REACT_APP_API_URL=http://localhost:3000

# CORS
FRONTEND_URL=http://localhost:3001
```

#### Backend `.env`
```env
PORT=3000
DB_PATH_GERMAN=/app/database/german-db
DB_PATH_SWISS=/app/database/timetable-gen
DB_PATH_ARCHIVE=/app/database/games
FRONTEND_URL=http://localhost:3001
```

#### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:3000
```

## 🎮 How to Play

1. **Select Country**: Choose between Switzerland or Germany
2. **Select Difficulty**: Easy, Medium, or Hard
3. **Guess Stations**: Type station names along the train route
4. **Use Hints**: Get hints (reduces score by 20%)
5. **Win**: Find all stations or cancel to see results
6. **Save Score**: Save your best performances

## 🔌 API Endpoints

### Game Management
- `POST /start-game` - Start a new game
- `POST /check-station` - Check if a station is correct
- `POST /hint` - Get a hint
- `POST /check-win` - Check if player has won
- `POST /get-guessed-stops` - Get list of guessed stations
- `POST /get-train-name` - Get the train name
- `POST /cancel-game` - Cancel current game
- `POST /get-score` - Get current score
- `POST /delete-game` - Delete a game
- `POST /archive-train` - Archive a game
- `POST /save-game` - Save game with player name
- `POST /get-time` - Get game completion time
- `GET /get-top?amount={n}` - Get top scores
- `POST /game-data` - Get archived game data

### Sort the Stations Mode
- `POST /sts/start-game` - Start STS game
- `POST /sts/check-solution` - Check station order
- `POST /sts/get-shuffled-stops` - Get shuffled stations
- `POST /sts/get-trainname` - Get train name

### Health & Status
- `GET /health` - Health check endpoint
- `GET /` - API status and version

## 🐳 Docker Deployment

### Build and Run
```bash
# Build images
docker-compose -f docker-compose.new.yml build

# Start services
docker-compose -f docker-compose.new.yml up -d

# View logs
docker-compose -f docker-compose.new.yml logs -f

# Stop services
docker-compose -f docker-compose.new.yml down
```

### Production Deployment

For production, update the environment variables:

```env
# .env
BACKEND_PORT=3000
FRONTEND_PORT=80
REACT_APP_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## 🎯 Development Guide

### Following the New Architecture Concept

This project demonstrates the **DieButzenScheibe.dev platform architecture**:

#### 1. Autonomous Services
- Frontend and backend are completely independent
- Each has its own Dockerfile and can be deployed separately
- Services communicate via REST API over HTTP

#### 2. Clear Responsibilities
- **Frontend**: UI rendering, user interaction, state management
- **Backend**: Business logic, data access, API endpoints

#### 3. Scalability
- Services can be scaled independently
- Ready for Kubernetes deployment with Ingress
- Stateless backend design (state in database)

#### 4. Development Workflow
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start

# Frontend proxies API calls to backend
```

#### 5. Adding New Features

**For Backend Changes**:
1. Add route in `backend/index.js`
2. Add business logic in appropriate file
3. Test endpoint with curl or Postman
4. Update API documentation

**For Frontend Changes**:
1. Add API call in `frontend/src/services/api.js`
2. Create or update React component
3. Update state management
4. Test in browser

### Best Practices Applied

✅ **Separation of Concerns**: Clear frontend/backend split  
✅ **Environment Configuration**: All config via environment variables  
✅ **Health Checks**: Monitoring endpoints for both services  
✅ **CORS Properly Configured**: Secure cross-origin requests  
✅ **Docker Multi-Stage Builds**: Optimized frontend images  
✅ **Nginx for Static Files**: Efficient static file serving  
✅ **RESTful API Design**: Standard HTTP methods and responses  

## 📊 Database Setup

### Required Database Files

This application requires SQLite database files with railway timetable data:

1. **german-db**: German railway timetable database
2. **timetable-gen**: Swiss railway timetable database
3. **games**: Game archive database (auto-created)

These files are **NOT** included in the repository and must be provided separately.

### Database Directory Structure

```
database/
├── german-db       # Required: German railway data
├── timetable-gen   # Required: Swiss railway data
└── games           # Auto-created: Game archives
```

The application will check for these files on startup and exit if they're missing.

## 🛠️ Troubleshooting

### Backend Issues

**Problem**: "Database directory not found"
```bash
# Solution: Create database directory
mkdir -p database
```

**Problem**: "Missing required database files"
```bash
# Solution: Ensure database files exist
ls -la database/
# Should show german-db and timetable-gen
```

### Frontend Issues

**Problem**: "Cannot connect to backend"
```bash
# Solution: Check backend is running
curl http://localhost:3000/health

# Check CORS configuration
# Verify REACT_APP_API_URL in frontend/.env
```

**Problem**: Build errors
```bash
# Solution: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

**Problem**: Port already in use
```bash
# Solution: Change port in .env
BACKEND_PORT=3002
FRONTEND_PORT=3003
```

**Problem**: Containers won't start
```bash
# Solution: Check logs
docker-compose -f docker-compose.new.yml logs

# Rebuild from scratch
docker-compose -f docker-compose.new.yml down -v
docker-compose -f docker-compose.new.yml build --no-cache
docker-compose -f docker-compose.new.yml up
```

## 🚀 Future Enhancements

- [ ] Kubernetes deployment manifests (Helm charts)
- [ ] CI/CD pipeline configuration
- [ ] Authentication integration (buAuth + Keycloak)
- [ ] Vite build tool migration
- [ ] Multiple game modes
- [ ] Leaderboard system
- [ ] Real-time multiplayer support

## 📝 License

ISC

## 👥 Contributing

This project follows the DieButzenScheibe.dev platform architecture. When contributing:

1. Keep frontend and backend changes separate
2. Follow the autonomous service principle
3. Add appropriate tests
4. Update documentation
5. Ensure Docker builds work

---

**Note**: This project demonstrates the modern web platform architecture concept for DieButzenScheibe.dev. It serves as a reference implementation for building scalable, maintainable web applications with clear separation of concerns.
