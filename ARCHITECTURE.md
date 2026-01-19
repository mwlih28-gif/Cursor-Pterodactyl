# Architecture Documentation

## System Overview

This gaming control panel implements a microservices architecture with three main components:

1. **Frontend** (Next.js 14) - User interface
2. **Backend API Gateway** (Go/Fiber) - API layer and business logic
3. **Daemon** (Go) - Node agent managing Docker containers

## Data Flow

```
User (Browser)
  ↓ HTTP/WebSocket
Frontend (Next.js)
  ↓ REST API / WebSocket
Backend API Gateway (Go/Fiber)
  ↓ Redis Pub/Sub / gRPC
Daemon (Go)
  ↓ Docker Engine API
Docker Containers (Game Servers)
```

## Components

### Backend API Gateway

**Location:** `backend/`

**Responsibilities:**
- User authentication (JWT)
- Server management endpoints
- Node management
- WebSocket hub for real-time communication
- Role-Based Access Control (RBAC)

**Key Files:**
- `main.go` - Entry point
- `routes/` - API route handlers
- `models/` - Database models
- `middleware/` - Auth and other middleware
- `websocket/hub/` - WebSocket connection management

**Endpoints:**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/servers` - List user's servers
- `POST /api/v1/servers/:id/start` - Start server
- `POST /api/v1/servers/:id/stop` - Stop server
- `GET /api/v1/nodes` - List nodes
- `GET /ws` - WebSocket connection

### Daemon

**Location:** `daemon/`

**Responsibilities:**
- Listen to Redis pub/sub channels for commands
- Manage Docker containers (start, stop, restart)
- Collect container metrics
- Handle backups

**Key Files:**
- `main.go` - Entry point
- `listener/listener.go` - Redis subscriber
- `docker/docker.go` - Docker client wrapper

**Redis Channels:**
- `server:start` - Start a server container
- `server:stop` - Stop a server container
- `server:restart` - Restart a server container
- `server:backup` - Create a backup

### Frontend

**Location:** `frontend/`

**Responsibilities:**
- User interface
- Server management UI
- Real-time console (Xterm.js)
- Authentication UI

**Key Technologies:**
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- Xterm.js for terminal
- Zustand for state management
- Axios for API calls

## Database Schema

### PostgreSQL Tables

- `users` - User accounts
- `roles` - Role definitions with JSONB permissions
- `servers` - Game server instances
- `nodes` - Physical/virtual nodes
- `allocations` - IP:Port allocations
- `backups` - Server backups
- `audit_logs` - Activity logs

## Security

1. **JWT Authentication** - Token-based auth with refresh tokens
2. **RBAC** - Role-based permissions stored in JSONB
3. **Password Hashing** - bcrypt with default cost
4. **CORS** - Configurable allowed origins
5. **Rate Limiting** - (To be implemented)
6. **Audit Logging** - All admin actions logged

## Deployment

### Development
```bash
# Start all services with Docker Compose
docker-compose up -d
```

### Production
Each service can be deployed independently:
- Frontend: Static Next.js build
- Backend: Go binary or Docker container
- Daemon: Go binary on each node
- Database: PostgreSQL 14+
- Cache: Redis 7+

## Future Enhancements

1. gRPC communication between API Gateway and Daemon
2. Kafka/RabbitMQ for event bus
3. Kubernetes deployment manifests
4. Metrics collection (Prometheus)
5. Log aggregation (ELK stack)
6. Backup to cloud storage (S3, etc.)
