# Quick Start Guide - Guess the Stops

Get up and running with the new architecture in 5 minutes!

## 🚀 Option 1: Local Development (Recommended for Development)

Perfect for making changes and seeing them live.

### Prerequisites
- Node.js 18+ installed
- Database files (german-db, timetable-gen)

### Steps

```bash
# 1. Clone and setup
git clone https://github.com/Butzenscheibe/Guess-the-Stops.git
cd Guess-the-Stops

# 2. Prepare database
mkdir -p database
# Copy your database files to ./database/

# 3. Start Backend (Terminal 1)
cd backend
npm install
PORT=3000 npm start

# 4. Start Frontend (Terminal 2)
cd frontend
npm install
REACT_APP_API_URL=http://localhost:3000 PORT=3001 npm start

# 5. Open Browser
# Navigate to http://localhost:3001
```

**That's it!** You now have:
- ✅ Backend API running on http://localhost:3000
- ✅ Frontend React app on http://localhost:3001
- ✅ Hot reload for development

## 🐳 Option 2: Docker Compose (Recommended for Production-like Testing)

Perfect for testing the complete deployment setup.

### Prerequisites
- Docker & Docker Compose installed
- Database files (german-db, timetable-gen)

### Steps

```bash
# 1. Clone and setup
git clone https://github.com/Butzenscheibe/Guess-the-Stops.git
cd Guess-the-Stops

# 2. Prepare database
mkdir -p database
# Copy your database files to ./database/

# 3. Configure (optional)
cp .env.example .env
# Edit .env if needed

# 4. Start with Docker
docker-compose -f docker-compose.new.yml up --build

# 5. Open Browser
# Navigate to http://localhost:3001
```

**That's it!** You now have:
- ✅ Backend container running on port 3000
- ✅ Frontend container running on port 3001
- ✅ Both services connected via Docker network
- ✅ Database persisted on host

## 🎮 How to Play

1. **Select Country**: Choose Switzerland or Germany
2. **Select Difficulty**: Easy, Medium, or Hard
3. **Start Guessing**: Type station names
4. **Get Hints**: Click "Hint" button (reduces score)
5. **Complete**: Find all stations or click "Cancel"
6. **Save Score**: Enter your name to save

## 🛠️ Common Commands

### Development

```bash
# Backend only
cd backend && npm start

# Frontend only
cd frontend && npm start

# Install new backend package
cd backend && npm install <package-name>

# Install new frontend package
cd frontend && npm install <package-name>

# Build frontend for production
cd frontend && npm run build
```

### Docker

```bash
# Start services
docker-compose -f docker-compose.new.yml up -d

# View logs
docker-compose -f docker-compose.new.yml logs -f

# Stop services
docker-compose -f docker-compose.new.yml down

# Rebuild after code changes
docker-compose -f docker-compose.new.yml up -d --build

# View only backend logs
docker-compose -f docker-compose.new.yml logs -f backend

# View only frontend logs
docker-compose -f docker-compose.new.yml logs -f frontend
```

## 🔍 Troubleshooting

### "Cannot connect to backend"

**Check backend is running:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"healthy"}
```

**Check CORS settings:**
- Backend should have `FRONTEND_URL=http://localhost:3001`
- Frontend should have `REACT_APP_API_URL=http://localhost:3000`

### "Database not found"

```bash
# Check database files exist
ls -la database/
# Should show: german-db, timetable-gen

# Create dummy files for testing (won't actually work for games)
mkdir -p database
touch database/german-db database/timetable-gen
```

### "Port already in use"

```bash
# Option 1: Change ports in .env
BACKEND_PORT=3002
FRONTEND_PORT=3003

# Option 2: Kill process using the port
# On Linux/Mac:
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend build fails

```bash
# Clear everything and reinstall
cd frontend
rm -rf node_modules package-lock.json build
npm install
npm run build
```

### Docker issues

```bash
# Complete cleanup and rebuild
docker-compose -f docker-compose.new.yml down -v
docker system prune -f
docker-compose -f docker-compose.new.yml up --build
```

## 📡 API Testing

Test the backend API directly:

```bash
# Health check
curl http://localhost:3000/health

# API status
curl http://localhost:3000/

# Start a game (requires valid database)
curl -X POST http://localhost:3000/start-game \
  -H "Content-Type: application/json" \
  -d '{"country":"ch","difficulty":"easy"}'

# Get top scores
curl http://localhost:3000/get-top?amount=10
```

## 🎯 Next Steps

1. **Read the Documentation**
   - [README.md](README.md) - Complete overview
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture details
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

2. **Explore the Code**
   - Backend: `backend/index.js` - Main API routes
   - Frontend: `frontend/src/App.js` - Main React component
   - Game Logic: `frontend/src/components/GuessTheStops.js`

3. **Make Changes**
   - Add new features
   - Improve UI/UX
   - Optimize performance
   - Add tests

4. **Deploy to Production**
   - Setup domain
   - Configure SSL
   - Deploy to server
   - Monitor performance

## 💡 Tips

- Use **Chrome DevTools** to debug frontend issues
- Check **Network tab** to see API calls
- Use **Console** for JavaScript errors
- Backend logs show in terminal where you ran `npm start`
- Frontend changes auto-reload (hot reload)
- Backend changes require restart

## 🤝 Getting Help

- Check logs first: `docker-compose logs -f`
- Read error messages carefully
- Verify environment variables
- Check network connectivity
- Consult documentation files

## 📚 Additional Resources

- **React DevTools**: Browser extension for React debugging
- **Postman**: Test API endpoints easily
- **Docker Dashboard**: Visual Docker management
- **VSCode Extensions**: ESLint, Prettier for code quality

---

**You're all set!** Start developing and enjoy the new architecture! 🎉
