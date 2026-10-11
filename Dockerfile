# Sitio público de Motel Crazy Love (Next.js). Solo catálogo y marca: no hay login.
FROM node:22-alpine AS base
WORKDIR /app
# Version fijada, como en los otros repos: pnpm 12 es un .exe nativo y el
# pnpm más reciente cambia de comportamiento sin tocar el repositorio.
RUN npm install -g pnpm@10

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
# El build prerenderiza la portada con datos del backend. Sin estas variables
# compila igual (la marca cae a la de por defecto) y se refresca al minuto.
ARG SAMAWE_API_URL
ARG SAMAWE_API_CLIENT_KEY
ENV SAMAWE_API_URL=$SAMAWE_API_URL \
    SAMAWE_API_CLIENT_KEY=$SAMAWE_API_CLIENT_KEY \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3100
# SAMAWE_API_URL y SAMAWE_API_CLIENT_KEY también hacen falta en tiempo de ejecución.
CMD ["pnpm", "start"]
