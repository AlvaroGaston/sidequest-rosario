# ★ SideQuest Rosario

Tablero de **misiones secundarias de la vida real** en Rosario, con estilo de videojuego.
Probar el mejor lomito de Pichincha, ver el atardecer en La Florida, subir al mirador del Monumento,
cruzar a la isla en lancha... Cada misión da XP y los jugadores suben de nivel
(**Novato → Explorador → Leyenda rosarina**).

- El **admin** ("Game Master") publica, edita y elimina misiones y administra los roles.
- El **usuario común** explora las misiones, marca las que completó y suma XP para el ranking.

TP 2 – Trabajo final Full Stack.

## 🔗 Deploy

| Servicio | URL |
| --- | --- |
| Frontend (Static Site) | https://sidequest.onrender.com _(reemplazar por la URL real)_ |
| Backend (Web Service) | https://sidequest-api.onrender.com _(reemplazar por la URL real)_ |

> El plan free de Render duerme el backend después de unos minutos sin uso: la primera carga puede tardar ~1 minuto.

## 👤 Usuarios de prueba

Se crean con `npm run seed` (en `backend/`).

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | admin@sidequest.com | `Admin1234!` |
| user | user@sidequest.com | `User1234!` |

## 🧱 Stack

- **Backend:** Node + Express 5 + TypeScript, MongoDB (Mongoose), Zod, Better Auth (email/contraseña, GitHub, Google, plugin `admin`).
- **Frontend:** React + Vite + TypeScript, React Router, React Hook Form + Zod, cliente de Better Auth.
- **Deploy:** Render (Web Service + Static Site con rewrites).

```
sidequest-rosario/
├── backend/
│   ├── src/
│   │   ├── config/env.ts               # variables de entorno
│   │   ├── lib/auth.ts                 # Better Auth (mongodbAdapter + admin plugin)
│   │   ├── middlewares/auth.middleware.ts  # authMiddleware + requireRole
│   │   ├── models/                     # Quest, Completion (Mongoose)
│   │   ├── schemas/quest.schema.ts     # validaciones Zod
│   │   ├── routes/                     # quests, completions, ranking
│   │   ├── app.ts / index.ts
│   │   └── seed.ts                     # usuarios de prueba + 12 misiones
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── lib/                        # authClient, api, schemas Zod, niveles
│   │   ├── components/                 # Layout, ProtectedRoute, QuestCard, UI
│   │   └── pages/                      # Home, Quests, Detail, Login, Register, Perfil, admin/*
│   └── vite.config.ts                  # proxy /api -> http://localhost:3000
└── render.yaml                         # blueprint opcional de Render
```

## 🗺️ Entidad: `Quest` (misión)

Expuesta en `/api/quests`. 11 campos propios con 5 tipos distintos.

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `title` | string | 3–80 caracteres, obligatorio |
| `description` | string | 10–500 caracteres, obligatorio |
| `category` | enum | `gastronomia`, `aventura`, `cultura`, `naturaleza`, `social`, `nocturna` |
| `neighborhood` | string | 2–50 caracteres |
| `difficulty` | number | entero 1–5 |
| `xp` | number | entero 10–1000 |
| `estimatedMinutes` | number | entero 5–600 |
| `deadline` | date | opcional, futura al crear |
| `isNight` | boolean | default `false` |
| `isActive` | boolean | default `true` |
| `imageUrl` | string (URL) | opcional |
| `createdAt` / `updatedAt` | date | automáticos |

Los errores de validación devuelven **400** con detalle por campo:

```json
{ "error": "Datos inválidos", "details": { "title": ["Mínimo 3 caracteres"] } }
```

## 📡 Endpoints

| Método | Ruta | Rol requerido | Respuestas |
| --- | --- | --- | --- |
| GET | `/api/quests?page=&limit=&search=&category=&neighborhood=&difficulty=` | Público | 200, 400 |
| GET | `/api/quests/:id` | Público | 200, 400 (id inválido), 404 |
| GET | `/api/quests/random` | Público | 200, 404 |
| GET | `/api/quests/neighborhoods` | Público | 200 |
| POST | `/api/quests` | admin | 201, 400, 401, 403 |
| PATCH | `/api/quests/:id` | admin | 200, 400, 401, 403, 404 |
| DELETE | `/api/quests/:id` | admin | 204, 401, 403, 404 |
| GET | `/api/completions/me` | user o admin | 200, 401 |
| POST | `/api/completions` (`{ questId }`) | user o admin | 201, 400, 401, 404, 409 (ya completada) |
| DELETE | `/api/completions/:id` | dueño del registro | 204, 401, 403, 404 |
| GET | `/api/ranking?limit=5` | Público | 200 |
| GET | `/api/providers` | Público | 200 (proveedores sociales configurados) |
| ALL | `/api/auth/*` | — | Rutas de Better Auth (login, registro, sesión, admin) |

`GET /api/quests` devuelve solo misiones activas. Un admin puede agregar `&all=true` para ver también las inactivas.

## ✅ Opcionales cubiertos

- **Paginación, filtros y búsqueda** en `/api/quests` y en la pantalla `/quests`.
- **Cada usuario ve/borra solo sus registros:** recurso `/api/completions` (misiones completadas + XP total + nivel en `/perfil`).
- **Login con Google** además de GitHub (`socialProviders.google`).
- **Cambio de roles** en `/admin/usuarios` con `authClient.admin.setRole`.

## 💻 Correr en local

Requisitos: Node 20+ y una base MongoDB (MongoDB Atlas o local).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # completar los valores (ver abajo)
npm run seed              # crea los usuarios de prueba y 12 misiones
npm run dev               # http://localhost:3000
```

### 2. Frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Abrí **http://localhost:5173**. Vite reenvía `/api/*` al backend, así que el código es igual en local y en Render.

### Variables de entorno (`backend/.env`)

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto de Express (3000) |
| `MONGODB_URI` | URI de MongoDB (`mongodb+srv://...` o `mongodb://localhost:27017/sidequest`) |
| `BETTER_AUTH_SECRET` | Secreto largo y aleatorio: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL del **frontend** (`http://localhost:5173` en local) |
| `FRONTEND_URL` | URL del frontend (va en `trustedOrigins`) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth App de GitHub (opcional en local) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciales OAuth de Google (opcional) |

Si no completás las credenciales de GitHub/Google, la app funciona igual con email y contraseña; los botones sociales aparecen deshabilitados.

**OAuth Apps de GitHub** (Settings → Developer settings → OAuth Apps), una por entorno:

- Local: Homepage `http://localhost:5173`, callback `http://localhost:5173/api/auth/callback/github`
- Producción: Homepage `https://sidequest.onrender.com`, callback `https://sidequest.onrender.com/api/auth/callback/github`

**Google** (Google Cloud Console → Credenciales → ID de cliente OAuth, tipo "Aplicación web"):
URI de redirección `http://localhost:5173/api/auth/callback/google` y `https://sidequest.onrender.com/api/auth/callback/google`.

## 🚀 Deploy en Render

El navegador solo habla con el Static Site; Render reenvía `/api/*` al Web Service.
Así la cookie de sesión es del mismo dominio y no hay problemas de CORS.

| Servicio | Tipo | Root dir | Build command | Start / Publish |
| --- | --- | --- | --- | --- |
| sidequest-api | Web Service | `backend` | `npm install && npm run build` | `npm start` |
| sidequest | Static Site | `frontend` | `npm install && npm run build` | Publish dir: `dist` |

**Rewrites del Static Site** (Redirects/Rewrites, en este orden):

| Source | Destination | Action |
| --- | --- | --- |
| `/api/*` | `https://sidequest-api.onrender.com/api/*` | Rewrite |
| `/*` | `/index.html` | Rewrite |

**Variables del Web Service:** las mismas de `.env.example`, con `BETTER_AUTH_URL` y `FRONTEND_URL` = `https://sidequest.onrender.com`.
En MongoDB Atlas → Network Access, permitir `0.0.0.0/0` (o las IPs de Render).
Después del primer deploy, correr el seed una vez desde tu máquina apuntando a la base de Atlas (`npm run seed` con el `MONGODB_URI` de producción en tu `.env`).

También está `render.yaml` por si querés crear los dos servicios como Blueprint.

## 🔒 Seguridad

- `.env` está en `.gitignore` desde el primer commit; solo se sube `.env.example` vacío.
- Antes de entregar: `git log -p | grep -i -E "mongodb\+srv|secret"` no tiene que mostrar valores reales.
- Las rutas de escritura de misiones usan `authMiddleware` + `requireRole("admin")`.
