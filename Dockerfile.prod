# Etapa 1: Build y Dependencias
FROM node:lts-slim AS build
WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar la caché de capas
COPY package*.json ./
RUN npm install

# Copiar el resto del código (filtrado por .dockerignore)
COPY . .

# Compilar la aplicación Astro
RUN npm run build

# Etapa 2: Ejecución
FROM node:lts-slim AS runtime
WORKDIR /app

# Copiar solo el resultado del build y el servidor Node
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

# Comando de ejecución usando el entry point de Astro Node
CMD ["node", "./dist/server/entry.mjs"]
