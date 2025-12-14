# Traefik Reverse Proxy Configuration

Domain-based routing for your home server applications using Traefik.

## How to Add a Domain

Edit `dynamic.yml` and add two entries:

1. **Router** - defines which domain to match
2. **Service** - defines where to forward traffic

### Example: Adding a new domain

To add `plex.internal` that forwards to `http://192.168.0.30:32400`:

```yaml
http:
  routers:
    # ... existing routers ...
    
    plex-internal:                    # Router name (use hyphens, no dots)
      rule: Host(`plex.internal`)     # Domain to match
      service: plex-internal          # Must match service name below
      entryPoints:
        - web                         # Port 80

  services:
    # ... existing services ...
    
    plex-internal:                    # Service name (must match router)
      loadBalancer:
        servers:
          - url: http://192.168.0.30:32400  # Backend URL
```

### Router and Service Names

- Use **hyphens** (`plex-internal`) not dots
- Router name and service name must **match**
- Router name can be anything, but matching makes it easier to manage

### Backend URL Examples

- **Internal Docker service**: `http://frontend:3000` (use Docker service name)
- **External IP**: `http://192.168.0.30:8123` (use IP address)
- **Host's localhost**: `http://host.docker.internal:8080` (access host machine's localhost)
- **Other network IP**: `http://192.168.0.40:8123` (access other machines on network)

**Note**: To access the host machine's `localhost` from inside Docker, use `host.docker.internal` instead of `localhost`. This works on Docker Desktop (Mac/Windows) and Docker Engine 20.10+ on Linux.

### Current Configuration

See `dynamic.yml` for existing domains. Changes are automatically picked up by Traefik (no restart needed).

## Traefik Dashboard

Access the Traefik dashboard at `http://localhost:8080` to see routing configuration and statistics.

## DNS Setup

Make sure your DNS server (or `/etc/hosts` file) points the domains to your server's IP address:

```
192.168.0.30  home.internal
192.168.0.30  ha.internal
```

