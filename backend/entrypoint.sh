#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"; do
  sleep 1
done

echo "PostgreSQL is ready. Applying migrations..."

# Apply all SQL migrations
for f in ./migrations/*.sql; do
  if [ -f "$f" ]; then
    echo "Applying migration: $f"
    psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f "$f"
  fi
done

echo "Migrations applied. Starting backend..."
exec node index.js