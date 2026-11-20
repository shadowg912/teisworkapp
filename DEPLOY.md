# Despliegue de TEIS workapp

Esta guía explica cómo poner en producción la aplicación para que tanto la **web** como la **app móvil (Android/Capacitor)** puedan consultar al backend Fastify y a la base de datos PostgreSQL.

## Arquitectura de despliegue

```
┌─────────────┐      HTTPS/WSS      ┌──────────────────┐
│   Web       │◄────────────────────►│  Nginx (opcional)│
│  (Vite)     │                      │  Reverse proxy   │
└─────────────┘                      └────────┬─────────┘
                                              │
┌─────────────┐      HTTPS/WSS      ┌─────────▼─────────┐
│  Android    │◄────────────────────►│  Backend Fastify │
│ (Capacitor) │   REST + JWT         │  (puerto 3333)   │
└─────────────┘                      └────────┬─────────┘
                                              │
                              TCP 5432        │
                                              ▼
                                      ┌───────────────┐
                                      │  PostgreSQL   │
                                      │  (puerto 5432)│
                                      └───────────────┘
                                              ▲
                                              │ logical replication (WAL)
                                      ┌───────────────┐
                                      │  PowerSync    │
                                      │  servidor     │
                                      │  (puerto 8080)│
                                      └───────────────┘
```

## Requisitos del servidor

- **Servidor Linux** con acceso root o sudo.
- **Node.js 22+** y **npm** (para el backend).
- **PostgreSQL 17** con `wal_level = logical` (requisito de PowerSync).
- **Docker** (opcional, para desplegar PowerSync).
- **Nginx** (opcional, recomendado para SSL/reverse proxy).
- Un dominio o IP pública accesible desde la web y desde dispositivos Android.

---

## Paso 1: Preparar PostgreSQL

PowerSync lee el write-ahead log (WAL) de PostgreSQL mediante logical replication. Debe habilitarse antes de iniciar cualquier cosa.

### 1.1 Conectar a PostgreSQL

```bash
psql -h 100.93.3.29 -p 5432 -U shadow -d teisworkapp
```

### 1.2 Habilitar logical replication

```sql
ALTER SYSTEM SET wal_level = logical;
-- Reiniciar PostgreSQL después de este cambio:
-- sudo systemctl restart postgresql
```

### 1.3 Dar privilegios de replicación al usuario

```sql
ALTER USER shadow WITH REPLICATION;
GRANT CONNECT ON DATABASE teisworkapp TO shadow;
GRANT USAGE ON SCHEMA public TO shadow;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO shadow;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO shadow;
```

### 1.4 Aplicar migraciones

Desde el repositorio, con el archivo `.env` configurado:

```bash
cd /home/shadow/teisworkapp
npm run db:migrate
npm run db:status
```

Esto crea las tablas: `accounts`, `goals`, `goal_entries`, `financial_movements`, `products`, `stock_movements`, `users`, `schema_migrations` y la vista `inventory_balances`.

---

## Paso 2: Desplegar el backend Fastify

El backend vive en `backend/` y expone la API REST en el puerto 3333.

### 2.1 Variables de entorno (`backend/.env`)

Copia `backend/.env.example` como `backend/.env` y completa:

```bash
cd /home/shadow/teisworkapp/backend
cp .env.example .env
```

Edita `backend/.env`:

```env
DB_URL=postgresql://100.93.3.29:5432/teisworkapp
DB_USER=shadow
DB_PASSWORD=J3sk0921

PORT=3333
HOST=0.0.0.0
NODE_ENV=production

SESSION_SECRET=cambia_este_secreto_por_algo_largo_y_aleatorio
JWT_SECRET=cambia_este_jwt_secret_por_algo_largo_y_aleatorio

CORS_ORIGIN=https://tu-dominio.com
```

**Importante:** `CORS_ORIGIN` debe ser el dominio desde el que accede la web (ej. `https://teisworkapp.com`). Si usas Nginx, pon aquí el dominio público.

### 2.2 Instalar dependencias y construir

```bash
cd /home/shadow/teisworkapp/backend
npm install
npm run typecheck   # verifica que no hay errores de tipos
```

### 2.3 Ejecutar el backend

Para desarrollo (no usar en producción):

```bash
npm run dev
```

Para producción, usa un gestor de procesos como **PM2** o **systemd**:

#### Con PM2 (recomendado)

```bash
npm install -g pm2
cd /home/shadow/teisworkapp/backend
pm2 start npm --name "teis-backend" -- run start
pm2 save
pm2 startup
```

#### Con systemd

Crea `/etc/systemd/system/teis-backend.service`:

```ini
[Unit]
Description=TEIS workapp backend
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/home/shadow/teisworkapp/backend
EnvironmentFile=/home/shadow/teisworkapp/backend/.env
ExecStart=/usr/bin/npm run start
Restart=always
User=shadow

[Install]
WantedBy=multi-user.target
```

Luego:

```bash
sudo systemctl enable teis-backend
sudo systemctl start teis-backend
```

Verifica que responde:

```bash
curl http://tu-servidor:3333/health
# {"status":"ok","service":"teis-workapp-backend","timestamp":"..."}
```

---

## Paso 3: Desplegar PowerSync (servidor de sincronización)

PowerSync sincroniza PostgreSQL con SQLite local (web y Android). Se desplaza por separado, preferiblemente con Docker.

### 3.1 Requisitos previos

- PostgreSQL con `wal_level = logical` (Paso 1).
- Usuario con privilegios de replicación (Paso 1).

### 3.2 Ejecutar PowerSync con Docker

```bash
docker run -d \
  --name powersync \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DATABASE_URL="postgresql://shadow:J3sk0921@100.93.3.29:5432/teisworkapp" \
  -e POWERSYNC_JWT_SECRET="cambia_este_jwt_secret_por_algo_largo_y_aleatorio" \
  ghcr.io/powersync-ja/powersync-server:latest
```

### 3.3 Aplicar la configuración de sincronización

El archivo `powersync/sync-config.yaml` define qué tablas se sincronizan. Debe aplicarse al servidor PowerSync. Consulta `powersync/README.md` para detalles del despliegue del servidor.

Mientras el servidor PowerSync no esté disponible, la app funciona en modo local (`localStorage` + `outbox`) y los cambios se acumulan para sincronizar después.

---

## Paso 4: Desplegar el frontend web

La web se compila con Vite y se sirve como archivos estáticos.

### 4.1 Variables de entorno (`.env`)

En la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_API_URL=https://tu-dominio.com/api
VITE_POWERSYNC_URL=https://tu-dominio.com:8080
```

Si usas Nginx en el mismo servidor que el backend, puedes usar rutas relativas o el mismo dominio con proxy.

### 4.2 Construir para producción

```bash
cd /home/shadow/teisworkapp
npm run build
```

Esto genera la carpeta `dist/` con archivos estáticos (HTML, JS, CSS).

### 4.3 Servir con Nginx

Crea `/etc/nginx/sites-available/teisworkapp`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /home/shadow/teisworkapp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /docs {
        proxy_pass http://localhost:3333;
    }

    # PowerSync (sincronización)
    location /sync {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Habilita el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/teisworkapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 HTTPS (recomendado)

Usa Certbot para obtener un certificado SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

Después de esto, la web estará accesible en `https://tu-dominio.com`.

---

## Paso 5: Desplegar la app móvil Android (Capacitor)

La app móvil usa Capacitor y debe apuntar al mismo backend que la web.

### 5.1 Configurar Capacitor

En `capacitor.config.ts`, asegúrate de que el servidor web apunte a la URL correcta:

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.teis.workapp',
  appName: 'TEIS workapp',
  webDir: 'dist',
  server: {
    url: 'https://tu-dominio.com',
    cleartext: false,
  },
};

export default config;
```

### 5.2 Sincronizar y abrir en Android Studio

```bash
cd /home/shadow/teisworkapp
npm run build
npx cap sync android
npx cap open android
```

En Android Studio, compila el APK o el AAB y instálalo en el dispositivo.

**Nota:** Para que Android funcione en emulador con el backend en `localhost`, usa `http://10.0.2.2:3333` en lugar de `localhost`. En dispositivo físico, usa la IP pública del servidor.

### 5.3 Variables de entorno para Android

La app lee `VITE_API_URL` y `VITE_POWERSYNC_URL` en tiempo de compilación. Asegúrate de que `.env` tenga los valores correctos antes de `npm run build` y `npx cap sync`.

---

## Paso 6: Cómo se conectan web y móvil al backend

### 6.1 Flujo de autenticación

1. El usuario abre la web o la app móvil.
2. Si no hay sesión, se redirige a `/auth` (pantalla de login).
3. El usuario escribe email y contraseña (ej. `shadow` / `J3sk0921`).
4. El frontend llama a `POST /auth/login` del backend.
5. El backend valida con bcrypt, genera un JWT y lo devuelve.
6. El frontend guarda el JWT en memoria y lo envía en el header `Authorization: Bearer <token>` de cada petición posterior.
7. El backend valida el JWT en el hook global `onRequest` y decora `request.user`.

### 6.2 Flujo de datos (offline-first)

1. El usuario crea un movimiento (ingreso, gasto, producto, etc.).
2. El frontend lo guarda en `localStorage` (cifrado con AES-GCM) y lo añade al `outbox`.
3. Cuando hay conexión y PowerSync está disponible, los cambios se sincronizan con PostgreSQL a través del servidor PowerSync.
4. Si PowerSync no está disponible, los cambios permanecen en el `outbox` local hasta que se pueda sincronizar.

### 6.3 URLs de conexión

| Cliente | URL del backend | URL de PowerSync |
|---------|----------------|------------------|
| Web (producción) | `https://tu-dominio.com/api` | `https://tu-dominio.com:8080` |
| Web (desarrollo) | `http://localhost:3333` | `http://localhost:8080` |
| Android (producción) | `https://tu-dominio.com/api` | `https://tu-dominio.com:8080` |
| Android (emulador) | `http://10.0.2.2:3333` | `http://10.0.2.2:8080` |

---

## Paso 7: Checklist de despliegue

- [ ] PostgreSQL con `wal_level = logical` y reiniciado.
- [ ] Usuario de PostgreSQL con privilegios de replicación.
- [ ] Migraciones aplicadas (`npm run db:migrate`).
- [ ] `backend/.env` con `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `SESSION_SECRET`, `CORS_ORIGIN`.
- [ ] Backend corriendo en puerto 3333 (PM2 o systemd).
- [ ] `.env` del frontend con `VITE_API_URL` y `VITE_POWERSYNC_URL`.
- [ ] Frontend construido (`npm run build`) y servido por Nginx.
- [ ] Nginx configurado con proxy a `/api` y `/docs`.
- [ ] SSL/HTTPS activo (Certbot).
- [ ] PowerSync servidor corriendo (Docker, puerto 8080).
- [ ] `powersync/sync-config.yaml` aplicada al servidor PowerSync.
- [ ] `capacitor.config.ts` con `server.url` apuntando al dominio.
- [ ] App Android compilada e instalada.

---

## Comandos rápidos

```bash
# Backend
cd /home/shadow/teisworkapp/backend
npm install
npm run typecheck
npm run start          # o pm2 start npm -- run start

# Frontend
cd /home/shadow/teisworkapp
npm install
npm run build          # genera dist/

# Migraciones
npm run db:migrate
npm run db:status

# Android
npm run build
npx cap sync android
npx cap open android

# PowerSync (Docker)
docker run -d --name powersync -p 8080:8080 \
  -e DATABASE_URL="postgresql://shadow:J3sk0921@100.93.3.29:5432/teisworkapp" \
  -e POWERSYNC_JWT_SECRET="cambia_este_secreto" \
  ghcr.io/powersync-ja/powersync-server:latest
```

---

## Solución de problemas comunes

| Problema | Solución |
|----------|----------|
| `column "date" does not exist` | Las columnas de fecha se llaman `occurred_at` en PostgreSQL. Las consultas SQL ya las mapean con alias `date`. |
| `duplicate key value violates unique constraint` | Ya existe un registro con esa clave (ej. segundo objetivo activo, SKU duplicado). |
| CORS error en el móvil | Asegúrate de que `CORS_ORIGIN` en `backend/.env` incluya el dominio de la app/web. |
| PowerSync no sincroniza | Verifica que `wal_level = logical` esté activo en PostgreSQL y que el servidor PowerSync tenga acceso a la base de datos. |
| Android no conecta | En emulador usa `10.0.2.2:3333`; en dispositivo físico usa la IP pública del servidor. Verifica que el puerto 3333 esté accesible (firewall). |
