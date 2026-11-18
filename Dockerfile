# Etapa 1: Build de la aplicación React con Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Habilitar corepack para usar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar manifiestos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Argumentos de compilación (con valores por defecto para producción)
ARG VITE_API_BASE_URL=https://financeapi.raulo.dev/api/
ARG VITE_GOOGLE_CLIENT_ID=128420751839-59tslfgim30j77e5vn2ncc2h7h32s73p.apps.googleusercontent.com

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Generar build estático en /app/dist
RUN pnpm run build

# Etapa 2: Servidor Nginx para servir el build estático
FROM nginx:alpine

# Copiar configuración personalizada de Nginx (soporte para React Router SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
