# Docker Deployment Guide

This guide explains how to deploy the Guess-the-Stops application using Docker Compose.

## Prerequisites

- Docker
- Docker Compose
- **SQLite database files** (german-db, timetable-gen, games) - **REQUIRED**

**IMPORTANT**: This application requires SQLite database files to function. You must have the following files in your `database/` directory before starting:
- `database/german-db` - German railway timetable database
- `database/timetable-gen` - Swiss railway timetable database  
- `database/games` - Games archive database (will be created automatically if it doesn't exist)

If you don't have these database files, the application will crash on startup.

## Quick Start

1. **Copy the environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables** (Optional)
   
   Edit the `.env` file to customize settings. Default values:
   ```
   PORT=3000
   DB_PATH_GERMAN=/app/database/german-db
   DB_PATH_SWISS=/app/database/timetable-gen
   DB_PATH_ARCHIVE=/app/database/games
   ```

3. **Prepare database files**
   
   Ensure your SQLite database files are in the `database/` directory:
   ```
   database/
   ├── german-db
   ├── timetable-gen
   └── games
   ```

4. **Build and start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   
   Open your browser and navigate to: `http://localhost:3000`

## Managing the Application

### View logs
```bash
docker-compose logs -f
```

### Stop the application
```bash
docker-compose down
```

### Restart the application
```bash
docker-compose restart
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

## Volume Persistence

The SQLite databases are stored in a Docker volume mapped to the `./database` directory. This ensures:
- Data persistence across container restarts
- Easy backup (just copy the database directory)
- Database files remain on the host system

## Configuration

All important configuration values can be set via the `.env` file:

- `PORT`: The port on which the server will run (default: 3000)
- `DB_PATH_GERMAN`: Path to the German railway database
- `DB_PATH_SWISS`: Path to the Swiss railway database
- `DB_PATH_ARCHIVE`: Path to the games archive database

## Troubleshooting

### Port already in use
If port 3000 is already in use, change the `PORT` variable in your `.env` file:
```
PORT=8080
```

### Database not found
Ensure the database files exist in the `database/` directory and have the correct permissions:
```bash
ls -la database/
```

### Container won't start
Check the logs for errors:
```bash
docker-compose logs
```
