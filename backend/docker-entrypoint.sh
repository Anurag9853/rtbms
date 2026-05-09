#!/bin/sh
set -e

echo "🩸 RTBMS — Starting production server..."

# Cache config/routes at runtime (env vars are available now, not at Docker build time)
echo "→ Caching Laravel configuration..."
php artisan config:cache 2>/dev/null || echo "  ⚠ config:cache skipped"
php artisan route:cache  2>/dev/null || echo "  ⚠ route:cache skipped"
php artisan event:cache  2>/dev/null || echo "  ⚠ event:cache skipped"

# Run migrations (MongoDB: creates indexes if missing)
echo "→ Running migrations..."
php artisan migrate --force --no-interaction 2>/dev/null || echo "  ⚠ migrations skipped"

echo "✅ Bootstrap complete. Starting server on port ${PORT:-8000}..."

# exec replaces this process with the CMD, appending --port
exec "$@" --port="${PORT:-8000}"
