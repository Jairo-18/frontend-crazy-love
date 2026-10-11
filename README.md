# frontend-crazy-love

Sitio público de **Motel Crazy Love**: catálogo de hospedajes, servicios y
productos, con la marca (nombre, colores, logo, contacto) que se edita en el
panel de samawe. No tiene login.

Next.js 16 (`cacheComponents`). Los datos salen del backend de samawe
(`backend-samawe`), que es multi-hotel: **el host al que se llama decide el
hotel**. `SAMAWE_API_URL` tiene que ser un host registrado para Crazy Love en
`organization_domains`; con el host de Samawe, el sitio mostraría el catálogo de
Samawe.

## Variables

| Variable | Qué es |
|---|---|
| `SAMAWE_API_URL` | Backend con host de Crazy Love. Local: `http://127.0.0.2:3000`. |
| `SAMAWE_API_CLIENT_KEY` | Cabecera `X-Client-Key` del backend. Solo se usa en el servidor. |

Ver `.env.example`. Hacen falta en el build (prerender de la portada) y en
ejecución.

## Desarrollo

```bash
pnpm install      # pnpm 10: el 12 es un .exe que Windows bloquea
pnpm dev          # http://localhost:3100
```

## Contenedor

`Dockerfile` en la raíz. Escucha en el **3100**. Pasar las dos variables como
build args y como variables de entorno.
