#!/bin/sh
# wait-for-postgres.sh

sleep 10

>&2 echo "Postgres is up - executing command"
exec "$@"