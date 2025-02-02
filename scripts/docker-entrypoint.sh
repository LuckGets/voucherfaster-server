#!/bin/sh

# Exit on error
set -e

echo "Current Working Directory: $(pwd)"

# Function to parse DATABASE_URL and extract user, host, and port
parse_database_url() {
  # Remove the protocol part
  url=${DATABASE_URL#postgresql://}

  # Extract user
  user=${url%%:*}

  # Remove user
  url=${url#*:}

  # Extract password (not used, but can be stored if needed)
  password=${url%%@*}

  # Remove password
  url=${url#*@}

  # Extract host
  host=${url%%:*}

  # Remove host
  url=${url#*:}

  # Extract port
  port=${url%%/*}

  echo "Parsed DATABASE_URL:"
  echo "User: $user"
  echo "Host: $host"
  echo "Port: $port"
}

# Parse the DATABASE_URL
parse_database_url

# Define maximum number of retries and sleep interval
MAX_RETRIES=30       # Total wait time = MAX_RETRIES * SLEEP_INTERVAL = 60 seconds
SLEEP_INTERVAL=2     # seconds
RETRY_COUNT=0

echo "Waiting for PostgreSQL to be ready..."

# Loop until pg_isready returns success or maximum retries are reached
while ! pg_isready -h "$host" -p "$port" -U "$user" >/dev/null 2>&1; do
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "PostgreSQL did not become ready in time. Exiting."
    exit 1
  fi
  echo "PostgreSQL is unavailable - sleeping for $SLEEP_INTERVAL seconds..."
  sleep "$SLEEP_INTERVAL"
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

echo "PostgreSQL is up - continuing..."
npx prisma generate

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

echo "Running seed..."
npx prisma db seed

# Start the Nest.js server
echo "Starting Nest.js server..."
exec "$@" 