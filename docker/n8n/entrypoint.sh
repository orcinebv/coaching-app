#!/bin/sh
set -e

IMPORT_DIR="/n8n-import/workflows"
MARKER_FILE="/home/node/.n8n/.workflows-imported"

echo "[entrypoint] Waiting for PostgreSQL..."
until nc -z "${DB_POSTGRESDB_HOST:-postgres}" "${DB_POSTGRESDB_PORT:-5432}"; do
  sleep 1
done

# Compute hash of all workflow files to detect changes
CURRENT_HASH=$(md5sum "$IMPORT_DIR"/*.json 2>/dev/null | md5sum | cut -d' ' -f1)
STORED_HASH=$(cat "$MARKER_FILE" 2>/dev/null || echo "")

if [ "$CURRENT_HASH" != "$STORED_HASH" ]; then
  echo "[entrypoint] Workflows gewijzigd of eerste start — importeren..."
  for f in "$IMPORT_DIR"/*.json; do
    [ -f "$f" ] || continue
    echo "[entrypoint] Importeren: $f"
    n8n import:workflow --input="$f" || echo "[entrypoint] WARN: import mislukt: $f"
  done
  echo "$CURRENT_HASH" > "$MARKER_FILE"
  echo "[entrypoint] Import gereed."
else
  echo "[entrypoint] Workflows ongewijzigd, import overgeslagen."
fi

exec n8n start
