FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache postgresql-client \
    && mkdir -p /app/backups \
    && chown node:node /app/backups

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node src ./src

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 4000) + '/ready').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
