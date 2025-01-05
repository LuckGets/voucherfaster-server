#!/bin/sh

# Exit on error
set -e

echo "Running migrations..."
pnpm run migrate:dev

echo "Starting server..."
exec pnpm run start:dev
