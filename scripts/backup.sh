#!/usr/bin/env bash
#
# Primekey Homes — automated PostgreSQL backup (deployment-ops.md §Backup Strategy)
#
# - Dumps the production database via docker exec
# - Compresses with gzip
# - Uploads to remote storage via rclone (S3-compatible / SFTP / external VPS)
# - Retains the last 30 daily backups on the remote
#
# Schedule (crontab, daily at 02:00 server time):
#   0 2 * * * /root/scripts/backup.sh >> /var/log/primekey-backup.log 2>&1
#
# Requirements:
#   - docker-compose stack running with container name "primekey-db"
#   - rclone configured (e.g. `rclone config`) — set RCLONE_REMOTE below
#   - .env next to docker-compose.yml with POSTGRES_USER / POSTGRES_DB
#
# Restore drill (monthly):
#   gunzip -c /tmp/backup_<ts>.sql.gz | docker exec -i primekey-db \
#     psql -U $POSTGRES_USER -d $POSTGRES_DB

set -euo pipefail

# --- Configuration ---------------------------------------------------------
COMPOSE_DIR="${COMPOSE_DIR:-/opt/primekey-homes}"        # dir containing docker-compose.yml
CONTAINER="${CONTAINER:-primekey-db}"
RCLONE_REMOTE="${RCLONE_REMOTE:-remote:backups/primekey}" # rclone remote path
RETENTION_DAYS="${RETENTION_DAYS:-30}"
KEEP_LOCAL="${KEEP_LOCAL:-1}"                             # keep newest N local copies
LOG_FILE="${LOG_FILE:-/var/log/primekey-backup.log}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# Load POSTGRES_USER / POSTGRES_DB from the compose .env (fall back to defaults)
if [[ -f "${COMPOSE_DIR}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${COMPOSE_DIR}/.env"
  set +a
fi
POSTGRES_USER="${POSTGRES_USER:-primekey}"
POSTGRES_DB="${POSTGRES_DB:-primekey}"

TIMESTAMP="$(date +%Y-%m-%d_%H-%M)"
BACKUP_FILE="/tmp/primekey_backup_${TIMESTAMP}.sql.gz"

log "Backup start: db=${POSTGRES_DB} user=${POSTGRES_USER}"

# 1. Dump + compress
if ! docker exec "${CONTAINER}" pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" \
    | gzip > "${BACKUP_FILE}"; then
  log "ERROR: pg_dump failed for ${POSTGRES_DB}"
  rm -f "${BACKUP_FILE}"
  exit 1
fi

# 2. Sanity check: non-empty gzip
if ! gzip -t "${BACKUP_FILE}"; then
  log "ERROR: backup file corrupt (gzip -t failed): ${BACKUP_FILE}"
  rm -f "${BACKUP_FILE}"
  exit 1
fi
SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
log "Backup created: ${BACKUP_FILE} (${SIZE})"

# 3. Upload to remote storage
if ! rclone copy "${BACKUP_FILE}" "${RCLONE_REMOTE}/" ; then
  log "ERROR: rclone upload failed — keeping local copy for manual recovery"
  exit 1
fi
log "Uploaded to ${RCLONE_REMOTE}/"

# 4. Cleanup local (keep newest N)
ls -1t /tmp/primekey_backup_*.sql.gz 2>/dev/null \
  | tail -n +$((KEEP_LOCAL + 1)) \
  | xargs -r rm -f

# 5. Retention on remote (delete files older than RETENTION_DAYS)
if command -v rclone >/dev/null; then
  rclone delete --min-age "${RETENTION_DAYS}d" "${RCLONE_REMOTE}/" \
    && log "Remote retention applied (${RETENTION_DAYS}d)"
fi

log "Backup complete."