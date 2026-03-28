# Dockerfile para Javier Mix V2 (Astro 5 SSR)
FROM node:20-slim AS base
WORKDIR /app

# Stage: Dependencies
FROM base AS deps
COPY package.json ./
RUN npm install

# Stage: Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage: Runtime
FROM base AS runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
