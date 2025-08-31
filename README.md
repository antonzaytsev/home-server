# Home Server Gallery

A simple web application to manage and monitor your home network services. Built with separate containerized services: a Ruby (Sinatra) API backend and a React frontend with nginx, using schema-less JSON file storage.

## Features

- 🏠 **Service Management**: Add, edit, and delete network services
- 🔄 **Health Monitoring**: Automatic health checks every minute with visual status indicators
- 🎯 **Drag & Drop**: Reorder services with intuitive drag-and-drop interface
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🐳 **Docker Ready**: Multi-service setup with Docker Compose
- 🚀 **Port 80**: Frontend runs on standard HTTP port with API proxy
- ⚡ **Microservices**: Separate backend and frontend services for better scalability

## Quick Start

1. **Clone and start the service:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Open your browser to `http://localhost` or `http://your-server-ip`

3. **Add your first service:**
   - Click "Add Service" 
   - Enter service name, IP address, and port (if not 80)
   - Examples: `192.168.0.30:8123` for Home Assistant

## Architecture

- **Backend Service**: Ruby Sinatra API with automatic health checking (port 4568)
- **Frontend Service**: React application built and served by Node.js serve (port 80)
- **Storage**: Schema-less JSON file storage with thread-safe operations
- **Health Checks**: Background thread checking service availability every minute

## API Endpoints

- `GET /api/services` - List all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `PUT /api/services/reorder` - Reorder services
- `GET /api/services/:id/health` - Manual health check

## Service Status

- 🟢 **Online**: Service is responding correctly
- 🔴 **Offline**: Service is not reachable or returning errors
- 🟡 **Unknown**: Health check hasn't run yet or timed out

## Examples of Services to Add

- **Home Assistant**: `192.168.0.30:8123`
- **Plex Media Server**: `192.168.0.30:32400`
- **Router Admin Panel**: `192.168.0.1` (default port 80)
- **Pi-hole**: `192.168.0.100:8080`
- **Synology NAS**: `192.168.0.50:5000`

## Development

### Running Individual Services

**Backend Development** (API only on port 4568):
```bash
cd backend
bundle install
ruby app.rb
```

**Frontend Development** (React dev server on port 3000):
```bash
cd frontend
npm install
npm start
```

**Full Stack** (both services with Docker):
```bash
docker-compose up -d
```

### Service Communication

- **Frontend (port 80)**: Node.js serve hosts React app
- **Backend (port 4568)**: Ruby API, accessible directly from frontend
- **API Access**: Frontend calls backend API directly with CORS support

### Data Management
The JSON storage file is automatically created and initialized with sample data when the backend starts up (if the database is empty). Data is stored in a human-readable JSON format that can be easily backed up or migrated.

## Configuration

The application runs in multiple Docker containers:
- **Backend**: Ruby Sinatra API on port 4568 (exposed for development)
- **Frontend**: Node.js serve hosting React app on port 80
- **Storage**: JSON file stored in Docker volume for persistence
- **Communication**: Frontend calls backend API directly via CORS

## Troubleshooting

### Services not appearing?
- Check Docker containers are running: `docker-compose ps`
- View backend logs: `docker-compose logs backend`

### Health checks not working?
- Ensure your services are actually reachable from the Docker network
- Check if services require HTTPS (currently only HTTP is supported)

### Can't drag and drop?
- Try refreshing the page
- Ensure JavaScript is enabled in your browser

## License

MIT License - feel free to modify and use for your home setup!
