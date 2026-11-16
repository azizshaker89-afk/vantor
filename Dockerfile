# syntax=docker/dockerfile:1.7
# VANTOR — production image (Next.js standalone + Prisma/SQLite)

FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts && npx prisma generate && npm rebuild sharp

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 STANDALONE=1 DATABASE_URL=file:/data/build.db
# Static pages read the catalogue at build time, so build against a freshly seeded DB.
RUN mkdir -p /data && npx prisma db push --skip-generate && npx tsx prisma/seed.ts && npm run build

FROM base AS run
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 DATABASE_URL=file:/data/vantor.db
RUN groupadd -r app && useradd -r -g app app && mkdir -p /data /app/uploads && chown -R app:app /data /app/uploads
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/prisma ./prisma
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/package.json ./package.json
COPY --chown=app:app docker-entrypoint.sh ./
USER app
VOLUME ["/data", "/app/uploads"]
EXPOSE 3000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
