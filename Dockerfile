# Dockerfile optimizado para Coolify
FROM node:20-alpine AS base
WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

# Instalar dependencias
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build de la aplicación
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Las variables de entorno se inyectarán en runtime por Coolify
RUN npm run build

# Imagen de producción
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copiar archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exponer el puerto
EXPOSE 3000

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro
USER astro

# Comando de inicio
CMD ["npm", "run", "start"]
