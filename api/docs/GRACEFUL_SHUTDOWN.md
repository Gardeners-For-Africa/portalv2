# Graceful Shutdown Implementation

This document explains the graceful shutdown implementation for the G4A School Management Portal API.

## Overview

The graceful shutdown system ensures that the application properly closes all database connections, finishes ongoing requests, and cleans up resources before terminating. This is crucial for:

- **Data Integrity**: Prevents data corruption during shutdown
- **Resource Cleanup**: Properly closes database connections and other resources
- **Zero-Downtime Deployments**: Allows for smooth application updates
- **Monitoring**: Provides health checks for load balancers and orchestration systems

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Graceful Shutdown System                │
├─────────────────────────────────────────────────────────────┤
│  Signal Handlers (SIGTERM, SIGINT, SIGUSR2)               │
│  ├── GracefulShutdownService                               │
│  │   ├── Health Check Integration                          │
│  │   ├── Database Cleanup                                  │
│  │   └── Custom Shutdown Handlers                          │
│  └── Health Check Endpoints                                │
│      ├── /health - Basic health check                      │
│      ├── /health/ready - Readiness probe                   │
│      └── /health/detailed - Detailed status                │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. GracefulShutdownService

**Location**: `src/shared/services/graceful-shutdown.service.ts`

**Responsibilities**:
- Manages shutdown handlers
- Coordinates graceful shutdown process
- Integrates with health check system
- Handles database cleanup

**Key Methods**:
- `registerShutdownHandler()`: Register custom shutdown logic
- `gracefulShutdown()`: Execute complete shutdown process
- `executeShutdownHandlers()`: Run all registered handlers

### 2. HealthCheckService

**Location**: `src/shared/services/health-check.service.ts`

**Responsibilities**:
- Monitor application health
- Track shutdown status
- Provide readiness checks
- Database connection validation

**Key Methods**:
- `isHealthy()`: Check if application is healthy
- `isReady()`: Check if ready to accept requests
- `setShuttingDown()`: Mark application as shutting down
- `getHealthStatus()`: Get detailed health information

### 3. DatabaseManagerService

**Location**: `src/tenant/database-manager.service.ts`

**Responsibilities**:
- Manage tenant database connections
- Close all database connections on shutdown
- Implement OnModuleDestroy lifecycle

**Key Methods**:
- `closeAllDatabases()`: Close all tenant database connections
- `onModuleDestroy()`: Automatic cleanup on module destruction

### 4. Health Controller

**Location**: `src/shared/controllers/health.controller.ts`

**Endpoints**:
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/detailed` - Detailed health status

## Signal Handling

The application responds to the following signals:

### SIGTERM
- **Usage**: Standard termination signal
- **Behavior**: Graceful shutdown with 30-second timeout
- **Use Case**: Container orchestration, load balancer health checks

### SIGINT
- **Usage**: Interrupt signal (Ctrl+C)
- **Behavior**: Graceful shutdown for development
- **Use Case**: Local development, manual termination

### SIGUSR2
- **Usage**: User-defined signal
- **Behavior**: Graceful shutdown for custom triggers
- **Use Case**: Custom deployment scripts, monitoring systems

## Shutdown Process

1. **Signal Received**: Application receives termination signal
2. **Health Check Update**: Mark application as shutting down
3. **Request Drain**: Stop accepting new requests
4. **Database Cleanup**: Close all tenant database connections
5. **Custom Handlers**: Execute registered shutdown handlers
6. **HTTP Server Close**: Close the HTTP server
7. **Process Exit**: Exit with appropriate code

## Health Check Endpoints

### Basic Health Check
```bash
curl http://localhost:3000/api/v1/health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Application is running normally"
}
```

### Readiness Probe
```bash
curl http://localhost:3000/api/v1/health/ready
```

**Response**:
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Application is ready to accept requests"
}
```

### Detailed Health Status
```bash
curl http://localhost:3000/api/v1/health/detailed
```

**Response**:
```json
{
  "healthy": true,
  "ready": true,
  "shuttingDown": false,
  "databases": {
    "master": true,
    "tenants": 3
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Configuration

### Environment Variables

No additional environment variables are required. The graceful shutdown system uses existing database configuration.

### Timeout Configuration

The default timeout for graceful shutdown is 30 seconds. This can be configured by modifying the signal handlers in `main.ts`.

## Usage Examples

### 1. Basic Application Shutdown

```bash
# Send SIGTERM signal
kill -TERM <process_id>

# Or use Ctrl+C in development
# The application will gracefully shutdown
```

### 2. Docker Container Shutdown

```dockerfile
# Dockerfile
FROM node:20-alpine
COPY . .
RUN yarn install && yarn build
EXPOSE 3000
CMD ["yarn", "start:prod"]
```

```bash
# Docker run with graceful shutdown
docker run -d --name g4a-api \
  --stop-signal SIGTERM \
  --stop-timeout 30 \
  g4a-api:latest

# Graceful shutdown
docker stop g4a-api
```

### 3. Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: g4a-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: g4a-api
  template:
    metadata:
      labels:
        app: g4a-api
    spec:
      containers:
      - name: g4a-api
        image: g4a-api:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
```

### 4. Custom Shutdown Handler

```typescript
// In your service
constructor(private readonly gracefulShutdown: GracefulShutdownService) {
  // Register custom shutdown handler
  this.gracefulShutdown.registerShutdownHandler(async () => {
    console.log('Custom cleanup logic here');
    // Close file handles, clear caches, etc.
  });
}
```

## Monitoring and Logging

### Log Messages

The graceful shutdown system provides detailed logging:

```
🛑 Received SIGTERM, starting graceful shutdown...
🔄 Application marked as shutting down
🔄 DatabaseManagerService: Starting cleanup...
✅ All tenant databases closed
🔄 Executing shutdown handler 1/2
✅ Shutdown handler 1 completed successfully
🔄 Closing HTTP server...
✅ HTTP server closed
✅ All shutdown handlers completed
✅ Graceful shutdown completed successfully
```

### Health Check Monitoring

Monitor the health endpoints to ensure proper shutdown behavior:

```bash
# Check if application is shutting down
curl -s http://localhost:3000/api/v1/health/detailed | jq '.shuttingDown'

# Monitor during shutdown
watch -n 1 'curl -s http://localhost:3000/api/v1/health/ready'
```

## Troubleshooting

### Common Issues

1. **Shutdown Hangs**
   - Check for active database connections
   - Verify all shutdown handlers complete
   - Check for unhandled promises

2. **Health Check Fails**
   - Verify database connectivity
   - Check application logs
   - Ensure proper signal handling

3. **Database Connections Not Closed**
   - Check DatabaseManagerService implementation
   - Verify OnModuleDestroy lifecycle
   - Check for connection leaks

### Debug Mode

Enable debug logging to troubleshoot shutdown issues:

```bash
LOG_LEVEL=debug yarn start:dev
```

## Best Practices

1. **Keep Shutdown Handlers Fast**: Avoid long-running operations
2. **Handle Errors Gracefully**: Don't let one handler block others
3. **Monitor Health Endpoints**: Use for load balancer configuration
4. **Test Shutdown Process**: Regularly test graceful shutdown
5. **Log Everything**: Detailed logging helps with troubleshooting

## Integration with Load Balancers

### Nginx Configuration

```nginx
upstream g4a_api {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://g4a_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Graceful shutdown support
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://g4a_api/api/v1/health;
        access_log off;
    }
}
```

### HAProxy Configuration

```
backend g4a_api
    balance roundrobin
    option httpchk GET /api/v1/health/ready
    http-check expect status 200
    server api1 127.0.0.1:3000 check
    server api2 127.0.0.1:3001 check
```

This graceful shutdown implementation ensures your G4A School Management Portal API can be safely deployed, updated, and maintained with zero data loss and minimal downtime! 🚀
