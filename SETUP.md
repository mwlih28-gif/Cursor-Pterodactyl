# Setup Guide

## Prerequisites

- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- Redis 7+ (or use Docker)

## Quick Start with Docker Compose

1. Clone the repository
2. Start all services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3000
- Frontend on port 3001
- Daemon service

## Manual Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
go mod download
```

3. Copy environment file:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Make sure PostgreSQL and Redis are running

5. Run migrations (automatic on startup):
```bash
go run main.go
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at http://localhost:3001

### Daemon Setup

1. Navigate to daemon directory:
```bash
cd daemon
```

2. Install dependencies:
```bash
go mod download
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Make sure Docker daemon is accessible and Redis is running

5. Run daemon:
```bash
go run main.go
```

## Initial Setup

### Create Default Roles

After starting the backend, you can create default roles via the admin API or directly in the database:

```sql
INSERT INTO roles (name, permissions, created_at, updated_at) VALUES
('admin', '{"*": true}', NOW(), NOW()),
('user', '{"server.view": true, "server.manage": true}', NOW(), NOW());
```

### Create First User

Register via the API:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "password123"
  }'
```

### Create a Node

Via admin API:
```bash
curl -X POST http://localhost:3000/api/v1/admin/nodes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node 1",
    "hostname": "node1.example.com",
    "ip": "192.168.1.100",
    "port": 8080,
    "total_ram": 17179869184,
    "total_cpu": 8000000000,
    "total_disk": 107374182400
  }'
```

### Create Allocations

Allocations need to be created for each node:
```sql
INSERT INTO allocations (node_id, ip, port, assigned, created_at, updated_at) VALUES
(1, '192.168.1.100', 25565, false, NOW(), NOW()),
(1, '192.168.1.100', 25566, false, NOW(), NOW());
```

## Configuration

### Backend Configuration

Edit `backend/.env`:
```
DATABASE_URL=postgres://user:pass@localhost:5432/gaming_panel
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3001
PORT=3000
```

### Frontend Configuration

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### Daemon Configuration

Edit `daemon/.env`:
```
NODE_ID=node-1
REDIS_URL=redis://localhost:6379/0
DOCKER_HOST=unix:///var/run/docker.sock
```

## Troubleshooting

### Backend won't connect to database
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database exists: `createdb gaming_panel`

### Daemon can't access Docker
- Ensure Docker daemon is running
- Check DOCKER_HOST environment variable
- On Linux: `sudo usermod -aG docker $USER`

### WebSocket connection fails
- Verify backend is running on port 3000
- Check CORS settings in backend config
- Ensure WSS is used in production

### Redis connection issues
- Verify Redis is running: `redis-cli ping`
- Check REDIS_URL format
- Ensure Redis accepts connections from your IP
