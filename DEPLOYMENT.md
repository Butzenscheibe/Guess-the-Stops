# Deployment Guide - Guess the Stops

This guide covers deploying Guess the Stops following the modern DieButzenScheibe.dev platform architecture.

## 🎯 Deployment Architecture

The application consists of two independent services:

1. **Backend API (Express.js)**: Port 3000
2. **Frontend SPA (React + Nginx)**: Port 3001 (80 in container)

Both services run in Docker containers and communicate via HTTP REST API.

## 🚀 Quick Deployment with Docker Compose

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- SQLite database files (german-db, timetable-gen)

### Step 1: Clone and Configure

```bash
# Clone repository
git clone https://github.com/Butzenscheibe/Guess-the-Stops.git
cd Guess-the-Stops

# Copy environment template
cp .env.example .env

# Edit .env for your environment
nano .env
```

### Step 2: Prepare Database Files

Place your database files in the `database/` directory:

```bash
mkdir -p database
# Copy your database files
cp /path/to/german-db database/
cp /path/to/timetable-gen database/
```

### Step 3: Deploy

```bash
# Build and start services
docker-compose -f docker-compose.new.yml up -d --build

# Check service health
docker-compose -f docker-compose.new.yml ps

# View logs
docker-compose -f docker-compose.new.yml logs -f
```

### Step 4: Verify

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Backend Health: http://localhost:3000/health
- Frontend Health: http://localhost:3001/health

## 🔧 Configuration

### Environment Variables

#### Root `.env` (Docker Compose)

```env
# Backend Configuration
BACKEND_PORT=3000

# Frontend Configuration
FRONTEND_PORT=3001
REACT_APP_API_URL=http://localhost:3000

# CORS Configuration
FRONTEND_URL=http://localhost:3001
```

#### Backend Environment

Backend configuration is passed through docker-compose.yml:

```yaml
environment:
  - PORT=3000
  - DB_PATH_GERMAN=/app/database/german-db
  - DB_PATH_SWISS=/app/database/timetable-gen
  - DB_PATH_ARCHIVE=/app/database/games
  - FRONTEND_URL=${FRONTEND_URL}
```

#### Frontend Environment

Frontend configuration (build-time):

```yaml
environment:
  - REACT_APP_API_URL=${REACT_APP_API_URL}
```

**Important**: Frontend environment variables starting with `REACT_APP_` are baked into the build at build time, not runtime.

## 🌐 Production Deployment

### Option 1: Single Server with Docker Compose

For a single production server:

```env
# Production .env
BACKEND_PORT=3000
FRONTEND_PORT=80
REACT_APP_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Setup reverse proxy** (Nginx, Traefik, or Caddy) in front:

```nginx
# Nginx reverse proxy example
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Kubernetes Deployment

For Kubernetes deployment, create manifests:

#### Backend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: guess-stops-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: guess-stops-backend
  template:
    metadata:
      labels:
        app: guess-stops-backend
    spec:
      containers:
      - name: backend
        image: your-registry/guess-stops-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: FRONTEND_URL
          value: "https://guess-stops.yourdomain.com"
        volumeMounts:
        - name: database
          mountPath: /app/database
      volumes:
      - name: database
        persistentVolumeClaim:
          claimName: guess-stops-db
---
apiVersion: v1
kind: Service
metadata:
  name: guess-stops-backend
spec:
  selector:
    app: guess-stops-backend
  ports:
  - port: 3000
    targetPort: 3000
```

#### Frontend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: guess-stops-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: guess-stops-frontend
  template:
    metadata:
      labels:
        app: guess-stops-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/guess-stops-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: guess-stops-frontend
spec:
  selector:
    app: guess-stops-frontend
  ports:
  - port: 80
    targetPort: 80
```

#### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: guess-stops-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - guess-stops.yourdomain.com
    - api.guess-stops.yourdomain.com
    secretName: guess-stops-tls
  rules:
  - host: guess-stops.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: guess-stops-frontend
            port:
              number: 80
  - host: api.guess-stops.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: guess-stops-backend
            port:
              number: 3000
```

## 🔐 Security Considerations

### Production Checklist

- [ ] Use HTTPS (SSL/TLS certificates)
- [ ] Configure CORS properly (specific origins, not *)
- [ ] Set security headers in Nginx
- [ ] Use secrets management for sensitive data
- [ ] Enable rate limiting
- [ ] Implement authentication (future: buAuth)
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Monitoring and alerting setup

### Security Headers (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 📊 Monitoring

### Health Checks

Both services expose health check endpoints:

- Backend: `GET /health` → `{"status":"healthy"}`
- Frontend: `GET /health` → `healthy`

Use these for:
- Docker health checks
- Kubernetes liveness/readiness probes
- External monitoring tools (Prometheus, etc.)

### Logging

View logs in Docker:

```bash
# All services
docker-compose -f docker-compose.new.yml logs -f

# Specific service
docker-compose -f docker-compose.new.yml logs -f backend
docker-compose -f docker-compose.new.yml logs -f frontend
```

In production, consider:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Loki + Grafana
- Cloud provider logging services

## 🔄 Updates and Rollbacks

### Updating Services

```bash
# Pull latest code
git pull

# Rebuild and redeploy
docker-compose -f docker-compose.new.yml up -d --build

# Or rebuild specific service
docker-compose -f docker-compose.new.yml up -d --build backend
```

### Rollback

```bash
# Stop current version
docker-compose -f docker-compose.new.yml down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose -f docker-compose.new.yml up -d --build
```

### Zero-Downtime Updates (Kubernetes)

With Kubernetes, updates are automatic:

```bash
# Update image
kubectl set image deployment/guess-stops-backend backend=your-registry/guess-stops-backend:v2

# Monitor rollout
kubectl rollout status deployment/guess-stops-backend

# Rollback if needed
kubectl rollout undo deployment/guess-stops-backend
```

## 🔍 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.new.yml logs backend
docker-compose -f docker-compose.new.yml logs frontend

# Check container status
docker-compose -f docker-compose.new.yml ps

# Verify environment variables
docker-compose -f docker-compose.new.yml config
```

### Database Issues

```bash
# Verify database files exist
ls -la database/

# Check permissions
chmod 644 database/german-db database/timetable-gen

# Check paths in backend logs
docker-compose -f docker-compose.new.yml logs backend | grep DB_PATH
```

### Network Issues

```bash
# Test backend from frontend container
docker exec guess-the-stops-frontend wget -O- http://backend:3000/health

# Test from host
curl http://localhost:3000/health
curl http://localhost:3001/health

# Check network
docker network inspect guess-the-stops_guess-the-stops-network
```

### CORS Issues

If frontend can't connect to backend:

1. Check FRONTEND_URL in backend .env matches frontend origin
2. Verify REACT_APP_API_URL in frontend .env
3. Check browser console for CORS errors
4. Rebuild frontend after environment changes (build-time variables)

## 📈 Scaling

### Horizontal Scaling

**Docker Compose** (limited):
```bash
docker-compose -f docker-compose.new.yml up -d --scale backend=3
```

**Kubernetes** (recommended for production):
```bash
kubectl scale deployment guess-stops-backend --replicas=5
kubectl scale deployment guess-stops-frontend --replicas=3
```

### Load Balancing

- Docker Compose: Use external load balancer (Nginx, HAProxy)
- Kubernetes: Built-in service load balancing

### Database Scaling

Current SQLite setup is single-instance. For scaling:
- Consider PostgreSQL, MySQL, or MongoDB
- Use managed database services
- Implement read replicas
- Cache frequently accessed data (Redis)

## 🎯 Domain Setup (DieButzenScheibe.dev)

For deploying to a subdomain like `guess-stops.diebutzenscheibe.dev`:

### DNS Configuration

```
# A or CNAME records
guess-stops.diebutzenscheibe.dev    → your-server-ip
api.guess-stops.diebutzenscheibe.dev → your-server-ip
```

### Environment Variables

```env
REACT_APP_API_URL=https://api.guess-stops.diebutzenscheibe.dev
FRONTEND_URL=https://guess-stops.diebutzenscheibe.dev
```

### SSL Certificates

Use Let's Encrypt with Cert-Manager (Kubernetes) or Certbot (traditional):

```bash
certbot --nginx -d guess-stops.diebutzenscheibe.dev -d api.guess-stops.diebutzenscheibe.dev
```

## 📝 Maintenance

### Backup Strategy

**Databases**:
```bash
# Backup databases
tar -czf database-backup-$(date +%Y%m%d).tar.gz database/

# Restore
tar -xzf database-backup-20240101.tar.gz
```

**Container Images**:
```bash
# Save images
docker save -o backend.tar your-registry/guess-stops-backend:latest
docker save -o frontend.tar your-registry/guess-stops-frontend:latest

# Load images
docker load -i backend.tar
docker load -i frontend.tar
```

### Regular Tasks

- [ ] Weekly: Check logs for errors
- [ ] Weekly: Verify backups
- [ ] Monthly: Update dependencies (npm audit)
- [ ] Monthly: Update base images
- [ ] Monthly: Review and rotate secrets
- [ ] Quarterly: Review and optimize resources

---

For questions or issues, refer to the main README.md or open an issue on GitHub.
