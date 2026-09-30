#!/usr/bin/env bash
#
# Primekey Homes — off-site PostgreSQL backup
#
# Production runs on Render's managed Postgres, whose scheduled backups are the
# PRIMARY restore path (configure them in the Render dashboard). This script
# exists to keep an additional copy somewhere Render does not control, so a
# provider-level incident cannot take the database with it.
#
# It no longer uses `docker exec`: production is Render's native Python runtime.
# `pg_dump` reads the same DATABASE_URL that Django uses, so this works from a
# Render shell, a local checkout, or any cron host.
#
# Requirements:
#   - PostgreSQL client tools (pg_dump) on PATH
#   - DATABASE_URL exported, or a .env file passed via ENV_FILE
#   - rclone configured (`rclone config`) for the upload step
#
# Run it:
#   DATABASE_URL='postgresql://...' ./scripts/backup.sh
#
# Restore drill (monthly, into a scratch database - never over production):
#   createdb primekey_restore
#   gunzip -c backup_<ts>.sql.gz | psql "$DATABASE_URL" -d primekey_restore
#
# Cron example (any Linux host, daily 02:00):
#   0 2 * * * DATABASE_URL='postgresql://...' /opt/primekey/scripts/backup.sh >> /var/log/primekey-backup.log 2>&1

set -euo pipefail

# --- Configuration ---------------------------------------------------------
ENV_FILE="${ENV_FILE:-}"                                   # optional .env holding DATABASE_URL
BACKUP_DIR="${BACKUP_DIR:-/tmp}"                           # local staging directory
RCLONE_REMOTE="${RCLONE_REMOTE:-remote:backups/primekey}"  # rclone remote path
RETENTION_DAYS="${RETENTION_DAYS:-30}"
KEEP_LOCAL="${KEEP_LOCAL:-1}"                              # keep newest N local copies

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

if [[ -n "${ENV_FILE}" && -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  log "ERROR: DATABASE_URL is not set. Export it or pass ENV_FILE=/path/to/.env"
  exit 1
fi

if ! command -v pg_dump >/dev/null; then
  log "ERROR: pg_dump not found on PATH. Install the PostgreSQL client tools."
  exit 1
fi

# Never let a password reach the process table or the log.
export PGCONNECT_TIMEOUT=10

TIMESTAMP="$(date +%Y-%m-%d_%H-%M)"
BACKUP_FILE="${BACKUP_DIR}/primekey_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"
log "Backup start (off-site copy; Render managed backups remain primary)"

# 1. Dump + compress
if ! pg_dump --dbname="${DATABASE_URL}" --no-owner --no-privileges --format=plain \
    | gzip > "${BACKUP_FILE}"; then
  log "ERROR: pg_dump failed"
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

# 3. Upload to remote storage (optional, but the point of an off-site copy)
if command -v rclone >/dev/null; then
  if ! rclone copy "${BACKUP_FILE}" "${RCLONE_REMOTE}/"; then
    log "ERROR: rclone upload failed - keeping the local copy for manual recovery"
    exit 1
  fi
  log "Uploaded to ${RCLONE_REMOTE}/"

  # 4. Retention on the remote (delete files older than RETENTION_DAYS)
  rclone delete --min-age "${RETENTION_DAYS}d" "${RCLONE_REMOTE}/" \
    && log "Remote retention applied (${RETENTION_DAYS}d)"
else
  log "WARN: rclone not installed; backup left at ${BACKUP_FILE}"
fi

# 5. Cleanup local staging (keep newest N)
find "${BACKUP_DIR}" -maxdepth 1 -name 'primekey_backup_*.sql.gz' -type f -printf '%T@ %p\n' 2>/dev/null \
  | sort -rn | tail -n +$((KEEP_LOCAL + 1)) | cut -d' ' -f2- \
  | xargs -r rm -f

log "Backup complete."
