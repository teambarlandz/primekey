#!/usr/bin/env bash
#
# Primekey Homes — media/static volume backup (deployment-ops.md §File Storage Backup)
#
# Weekly sync of the Docker media volume to remote storage. The DB backup
# (scripts/backup.sh) is the critical one; this covers property images and
# landlord documents stored on the media volume.
#
# Schedule (crontab, weekly Sunday 03:00):
#   0 3 * * 0 /root/scripts/backup_media.sh >> /var/log/primekey-backup.log 2>&1

set -euo pipefail

VOLUME="${VOLUME:-primekey-homes_media_volume}"
RCLONE_REMOTE="${RCLONE_REMOTE:-remote:backups/primekey/media}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

VOLUME_DIR="$(docker volume inspect "${VOLUME}" --format '{{ .Mountpoint }}')"

log "Media sync start: ${VOLUME} -> ${RCLONE_REMOTE}"
rclone sync "${VOLUME_DIR}/" "${RCLONE_REMOTE}/" --transfers 4 --checkers 8
log "Media sync complete."