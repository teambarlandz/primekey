# Deployment-ops file, now aligned with the Modular Monolith + DDD architecture and clearly distinguishing the core project (Phases 1-2) from the optional Phase 3 extension.

---

```markdown
# Deployment & Operations Context

This document defines the complete operational blueprint for taking the self-hosted real estate platform from a code repository to a live, production-ready application. It covers containerization, server provisioning, security hardening, backup strategies, monitoring, and the handoff protocol for hosting partners.

---

## Deployment Scope

This deployment blueprint covers the **core project** — Phases 1 (Buyer/Renter) and Phase 2 (Landlord/Owner).

The Builder/Developer e-commerce portal (Phase 3) is an **optional extension** and is **not part of the initial deployment**. If Phase 3 is later activated, it will be deployed as an additional module within the existing monolith (by activating the `ecommerce` app) with its own deployment runbook additions (e.g., payment gateway configuration).

---

## Production Environment Overview

| Component | Specification |
|-----------|---------------|
| **Hosting Provider** | Nigerian VPS provider (e.g., Fimgohost, SmartWeb, or global like Hetzner/Linode) |
| **Server Type** | Virtual Private Server (VPS) — isolated, self-managed |
| **OS** | Ubuntu 22.04 LTS |
| **Resources (Minimum)** | 4GB RAM, 2 vCPUs, 50GB SSD storage |
| **Resources (Recommended)** | 8GB RAM, 4 vCPUs, 100GB SSD storage |
| **Network** | Public IPv4 address, dedicated private network for internal services |
| **Database Isolation** | PostgreSQL runs on `localhost` (127.0.0.1) — **not exposed to the public internet** |

### Rationale

- Self-hosting on a VPS ensures complete data ownership and avoids vendor lock-in.
- PostgreSQL isolation prevents unauthorized external access to sensitive lead data.
- 4GB RAM minimum is required to run Next.js (Node), Django (Python), and PostgreSQL concurrently.
- 8GB RAM is recommended for production to handle expected traffic and background jobs.

---

## Containerization Strategy

All services are containerized using Docker to ensure consistency between development, staging, and production environments. Docker Compose orchestrates the multi-service setup.

### Service Containers

| Service | Image | Internal Port | External Port | Notes |
|---------|-------|---------------|---------------|-------|
| **Next.js Frontend** | Custom (`Dockerfile.frontend`) | 3000 | Not directly exposed | Serves UI, proxies API to Django |
| **Django Backend** | Custom (`Dockerfile.backend`) | 8000 | Not directly exposed | Gunicorn WSGI server |
| **PostgreSQL** | `postgres:15` with `pg_cron` | 5432 | Not exposed | Only accessible from Docker network |
| **Nginx** | `nginx:alpine` | 80, 443 | 80, 443 | Reverse proxy, SSL termination, static file serving |

### Docker Compose Configuration (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: realestate_db
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d  # pg_cron setup
    ports:
      - "127.0.0.1:5432:5432"  # Only localhost access
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    container_name: realestate_backend
    restart: always
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      SECRET_KEY: ${DJANGO_SECRET_KEY}
      DEBUG: ${DJANGO_DEBUG}
      PAYMENT_GATEWAY_KEY: ${PAYMENT_GATEWAY_KEY}  # Phase 3 only
      EMAIL_HOST: ${EMAIL_HOST}
      EMAIL_HOST_USER: ${EMAIL_HOST_USER}
      EMAIL_HOST_PASSWORD: ${EMAIL_HOST_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    networks:
      - internal
    command: gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    container_name: realestate_frontend
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
    depends_on:
      - backend
    networks:
      - internal
    command: node server.js  # Production server (standalone output)

  nginx:
    image: nginx:alpine
    container_name: realestate_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - static_volume:/static:ro
      - media_volume:/media:ro
    depends_on:
      - frontend
      - backend
    networks:
      - internal

volumes:
  postgres_data:
  static_volume:
  media_volume:

networks:
  internal:
    driver: bridge
```

---

Nginx Reverse Proxy Configuration

Nginx serves as the entry point for all traffic, handling SSL termination, static file serving, and routing requests to the appropriate container.

Key Configuration Rules

Rule Purpose
Route /api/* → Django All API requests go to the backend (port 8000)
Route /* → Next.js All UI routes go to the frontend (port 3000)
Route /static/* → Nginx Served directly from the static_volume for performance
Route /media/* → Nginx Served directly from the media_volume for performance
SSL Termination All traffic on port 80 is redirected to HTTPS (port 443)

Sample Nginx Configuration (nginx/conf.d/app.conf)

```nginx
server {
    listen 80;
    server_name primekeyhomesandpropertiesltd.com www.primekeyhomesandpropertiesltd.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name primekeyhomesandpropertiesltd.com www.primekeyhomesandpropertiesltd.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Static & Media files
    location /static/ {
        alias /static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API requests to Django
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin panel (Django)
    location /admin/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # All other traffic to Next.js
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

SSL Certificate Management

SSL certificates are managed via Let's Encrypt with automatic renewal.

Initial Setup

```bash
# Install Certbot
apt update && apt install certbot python3-certbot-nginx -y

# Obtain certificate for domain
certbot --nginx -d primekeyhomesandpropertiesltd.com -d www.primekeyhomesandpropertiesltd.com

# Verify certificate location
ls /etc/letsencrypt/live/primekeyhomesandpropertiesltd.com/
```

Automatic Renewal

```bash
# Test renewal
certbot renew --dry-run

# Add to crontab for automatic renewal (twice daily)
0 */12 * * * /usr/bin/certbot renew --quiet --post-hook "docker-compose restart nginx"
```

---

Security Hardening

Firewall Configuration (UFW)

Allow only essential ports:

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirects to HTTPS)
ufw allow 443/tcp   # HTTPS
ufw enable
```

SSH Hardening

Edit /etc/ssh/sshd_config:

```bash
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Database Isolation

· PostgreSQL binds only to 127.0.0.1 (localhost), not 0.0.0.0.
· The Docker network is internal; no external access to port 5432.
· Application uses a dedicated database user with restricted privileges.

Environment Variables Management

Never commit secrets to the repository. Use .env files (excluded via .gitignore):

```bash
# .env.example (template)
POSTGRES_DB=realestate_db
POSTGRES_USER=app_user
POSTGRES_PASSWORD=change_me_secure
DJANGO_SECRET_KEY=change_me_secure_50_chars
DJANGO_DEBUG=False
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_URL=https://primekeyhomesandpropertiesltd.com
PAYMENT_GATEWAY_KEY=sk_test_xxx  # Phase 3 only
EMAIL_HOST=smtp.yourprovider.com
EMAIL_HOST_USER=noreply@primekeyhomesandpropertiesltd.com
EMAIL_HOST_PASSWORD=change_me
```

---

Backup Strategy

> **Implemented (2026-08-17):** `scripts/backup.sh` (DB) and `scripts/backup_media.sh`
> (media volume) ship in the repository. Configure `COMPOSE_DIR`, `RCLONE_REMOTE`,
> and `RETENTION_DAYS` as needed; schedule via the cron lines below.

PostgreSQL Backup (Automated)

A daily backup script (scripts/backup.sh) that:

1. Dumps the entire database using pg_dump (via `docker exec primekey-db`)
2. Compresses with gzip
3. Uploads to a secure remote storage (e.g., S3-compatible, SFTP, or external VPS) via rclone
4. Retains last 30 daily backups on the remote

```bash
#!/bin/bash
# scripts/backup.sh

TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
BACKUP_FILE="/tmp/backup_$TIMESTAMP.sql.gz"

docker exec realestate_db pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > $BACKUP_FILE

# Upload to remote storage (e.g., using rclone)
rclone copy $BACKUP_FILE remote:backups/realestate/

# Cleanup local
rm $BACKUP_FILE

# Keep only last 30 daily backups on remote
rclone delete --min-age 30d remote:backups/realestate/
```

Cron job (daily at 2 AM):

```bash
0 2 * * * /root/scripts/backup.sh >> /var/log/backup.log 2>&1
```

File Storage Backup

· Media files (property images, landlord documents) are stored in the media_volume.
· Weekly sync to remote storage:

```bash
0 3 * * 0 rclone sync /var/lib/docker/volumes/media_volume/_data remote:media_backups/
```

---

Monitoring & Alerting

Health Check Endpoint

The Django backend exposes /api/health for uptime monitoring:

```python
# backend/apps/core/views.py

from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError

def health_check(request):
    # Check database connectivity
    db_conn = connections['default']
    try:
        db_conn.cursor()
        db_status = "healthy"
    except OperationalError:
        db_status = "unhealthy"

    return JsonResponse({
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    })
```

Uptime Monitoring

Use a third-party service (e.g., UptimeRobot, Better Stack, or a simple cron script) to ping /api/health every 5 minutes.

Logging

· Docker logs are captured and rotated daily.
· Django logs are output to stdout (captured by Docker).
· Nginx access/error logs are persisted in Docker volumes.

Log rotation with Docker:

```yaml
# In docker-compose.yml
services:
  nginx:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

CI/CD Pipeline

A simple CI/CD pipeline using GitHub Actions (or GitLab CI) automates testing and deployment.

Workflow Steps

1. Push to main branch triggers the pipeline.
2. Run tests (backend unit tests, frontend linting).
3. Build Docker images for frontend and backend.
4. Push images to a Docker registry (or build directly on the server).
5. Deploy to production via SSH:

```yaml
# .github/workflows/deploy.yml (example)

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and push Docker images
        run: |
          docker build -t frontend:latest -f frontend/Dockerfile.frontend .
          docker build -t backend:latest -f backend/Dockerfile.backend .
          docker save frontend:latest | ssh user@server 'docker load'
          docker save backend:latest | ssh user@server 'docker load'

      - name: Deploy on server
        run: |
          ssh user@server 'cd /app && docker-compose down && docker-compose up -d'
```

---

Handoff Protocol for Hosting Partner

When handing over to a hosting partner or DevOps team, provide the following:

Deliverables Checklist

· GitHub repository (or zip file) containing all source code.
· .env.example file with all required environment variables (no secrets).
· docker-compose.yml for orchestration.
· nginx/conf.d/app.conf (Nginx reverse proxy configuration).
· scripts/backup.sh (automated backup script).
· Database migration scripts (python manage.py migrate).
· Health check endpoint (/api/health) for monitoring.
· Deployment runbook (this document).
· SSH public key for secure server access.

Hosting Partner Responsibilities

Responsibility Owner
Server provisioning (VPS, OS, firewall) Hosting Partner
Docker & Docker Compose installation Hosting Partner
SSL certificate setup and renewal Hosting Partner
Domain configuration (DNS A records) Hosting Partner
Database maintenance (upgrades, index rebuilding) Hosting Partner
Application code updates & migrations You (or your developer)
Database backups verification You (or your developer)
Monitoring alerts response You (or your developer)

Service Level Agreement (SLA) for Hosting Partner

Metric Target
Uptime 99.5% (excluding planned maintenance)
Incident Response Acknowledged within 1 hour
Incident Resolution Resolved within 4 hours
Backup Integrity Verified daily, restore test monthly

---

Common Deployment Pitfalls & Solutions

Pitfall Solution
Database connection refused Ensure PostgreSQL binds to 127.0.0.1 or Docker internal network, not 0.0.0.0.
Next.js build failing Use next build with sufficient memory (NODE_OPTIONS="--max-old-space-size=4096").
Static files not loading Ensure Django STATIC_ROOT is set and Nginx has alias pointing to the volume.
SSL certificate renewal failure Verify the domain DNS is correctly configured before running Certbot.
Backup not running Check cron logs; ensure pg_dump is installed in the Docker container.
Out of memory Increase VPS RAM, or reduce Django --workers count.
Slow search queries Add PostgreSQL indexes on properties.location, properties.price, properties.status.

---

Go-Live Checklist

Before launching, verify all items below:

· SSL certificate is installed and auto-renewal is tested.
· Firewall is configured (only ports 22, 80, 443 open).
· PostgreSQL is isolated (no external access).
· Backup script runs successfully and stores backups remotely.
· Monitoring endpoint (/api/health) returns "healthy".
· Uptime monitoring is configured and sends alerts to the team.
· Environment variables are set in production (no defaults).
· Database migrations have been applied (python manage.py migrate).
· Django admin panel is accessible and secured with strong credentials.
· First backup has been taken and restored successfully.
· DNS records point to the VPS public IP.
· Site loads over HTTPS and redirects from HTTP.
· Buyer Context (Phase 1) functionality works end-to-end:
  · Search returns results and handles zero results
  · Concierge form submits and creates a lead in the database
  · Consent is logged correctly
  · SLA alert is triggered

---

Post-Launch Operations

After go-live, the following operational rhythms are established:

Frequency Task
Daily Verify backup logs and check monitoring dashboard.
Weekly Review error logs, check disk usage, ensure SSL certificates are valid.
Monthly Test disaster recovery by restoring a backup to a staging environment.
Quarterly Review security patches, update Docker images, plan scalability upgrades.
Yearly Review NDPR compliance audit logs, update privacy policy version.

---

Cost Estimation (Monthly)

Item Estimated Cost (NGN) Notes
VPS (4GB RAM, 2 vCPUs) NGN 25,000 - 40,000 Nigerian providers
Domain Name NGN 5,000 - 10,000 Annually
SSL Certificate Free Let's Encrypt
Backup Storage NGN 2,000 - 5,000 S3-compatible or SFTP
Monitoring Service Free UptimeRobot free tier
Email Service NGN 2,000 - 5,000 Transactional email (SendGrid, AWS SES)
Total (Approx.) NGN 40,000 - 60,000 (~$25 - $40 USD)

---

Summary

This document provides a complete operational blueprint for:

· Containerizing the application (Docker + Docker Compose)
· Securing the server (firewall, SSL, SSH hardening)
· Backing up data (automated PostgreSQL dumps)
· Monitoring uptime and application health
· Deploying via CI/CD
· Handing over to a hosting partner

The core project (Phases 1-2) can be deployed and operated entirely within this blueprint. Phase 3 (Builder Context) will require additional configuration (payment gateway, supplier dashboard) but shares the same infrastructure and will be deployed as an extension to the existing monolith.

---