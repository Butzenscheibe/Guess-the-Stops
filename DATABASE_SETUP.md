# Database Setup for Docker

## CRITICAL: Database Files Required

This application **WILL NOT WORK** without the SQLite database files. The application crashes on startup or when you try to start a game if these files are missing.

## Quick Setup

1. **Create the database directory** in the same location as your `docker-compose.yml`:
   ```bash
   mkdir database
   ```

2. **Place your SQLite database files** in this directory:
   ```
   database/
   ├── german-db          # German railway timetable database (REQUIRED)
   ├── timetable-gen      # Swiss railway timetable database (REQUIRED)
   └── games              # Games archive (created automatically)
   ```

3. **Start Docker Compose**:
   ```bash
   docker-compose up
   ```

## Expected Startup Output

If everything is correct, you should see:
```
=== Guess the Stops Server Startup ===
Environment configuration:
  PORT: 3000
  DB_PATH_GERMAN: /app/database/german-db
  DB_PATH_SWISS: /app/database/timetable-gen
  DB_PATH_ARCHIVE: /app/database/games

Checking database directory: /app/database
✓ Database directory exists

Checking for database files...
  ✓ German railway DB: /app/database/german-db
  ✓ Swiss railway DB: /app/database/timetable-gen
  ✓ Archive DB: /app/database/games

✓ All required database files found
Starting server...

✓ Server is running on port 3000
✓ Server is ready to accept connections
```

## If You See Errors

### Error: "Database directory not found"
- Make sure you have a `database` directory in the same folder as `docker-compose.yml`
- The volume mount in docker-compose.yml is: `./database:/app/database`

### Error: "Missing required database files"
- You need to obtain the SQLite database files (`german-db` and `timetable-gen`)
- Place them in the `database/` directory on your host machine
- These files are NOT included in this repository and must be obtained separately

### Error: "Database file not found" or crashes when starting a game
- The database files exist but are in the wrong location
- Check that the files are named exactly: `german-db` and `timetable-gen` (no extensions)
- Check file permissions (files should be readable)

## File Structure

Your project should look like this:
```
Guess-the-Stops/
├── docker-compose.yml
├── Dockerfile
├── database/              ← YOU MUST CREATE THIS
│   ├── german-db         ← YOU MUST ADD THIS FILE
│   ├── timetable-gen     ← YOU MUST ADD THIS FILE
│   └── games             ← Created automatically
├── js/
│   └── Backend/
│       ├── index.js
│       └── ...
└── ...
```

## How the Volume Mounting Works

The line in `docker-compose.yml`:
```yaml
volumes:
  - ./database:/app/database
```

This means:
- `./database` = directory on your HOST computer (where docker-compose.yml is)
- `/app/database` = directory INSIDE the Docker container
- Files in `./database` on your host are accessible at `/app/database` in the container

The application inside Docker looks for databases at:
- `/app/database/german-db`
- `/app/database/timetable-gen`
- `/app/database/games`

Which maps to these files on your host:
- `./database/german-db`
- `./database/timetable-gen`
- `./database/games`
