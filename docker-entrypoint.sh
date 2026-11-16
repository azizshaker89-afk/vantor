#!/bin/sh
set -e
# First boot: create the schema and load the demo catalogue into the mounted volume.
if [ ! -f /data/vantor.db ]; then
  npx prisma db push --skip-generate
  npx tsx prisma/seed.ts
else
  npx prisma db push --skip-generate
fi
exec node server.js
