# Plataforma de Eventos e Inscripciones

API REST para la gestión de eventos y sus inscripciones. Esta primera
pre-entrega establece la base arquitectónica: servidor Express, configuración
por variables de entorno y separación por capas, preparada para incorporar
autenticación, roles, inscripciones, cupos y notificaciones en las próximas
entregas.

## Temática

Plataforma de eventos e inscripciones: difusión de eventos, gestión de cupos y
registro de participantes. Esta entrega cubre únicamente la base arquitectónica
de la API.

## Tecnologías

- Node.js (ESM, `import`/`export`)
- Express 4
- dotenv
- MongoDB (previsto para las próximas entregas)
- `node:test` + Supertest para tests

## Requisitos

- Node.js 20 o superior
- npm

## Instalación

```bash
git clone https://github.com/joaquin90jnp-blip/plataforma-eventos.git
cd plataforma-eventos
npm install
```

## Variables de entorno

Copiar el archivo de ejemplo y ajustar los valores:

```bash
cp .env.example .env
```

| Variable     | Obligatoria | Valor por defecto | Descripción                                  |
|--------------|-------------|-------------------|----------------------------------------------|
| `PORT`       | No          | `3000`            | Puerto del servidor (entero entre 1 y 65535) |
| `NODE_ENV`   | No          | `development`     | Entorno de ejecución                         |
| `MONGO_URL`  | No          | vacío             | Cadena de conexión a MongoDB                 |
| `JWT_SECRET` | No          | vacío             | Clave para firmar tokens JWT                 |

El archivo `.env` está excluido de Git. Nunca subir credenciales al repositorio.

## Ejecución

```bash
npm start        # producción
npm run dev      # desarrollo con recarga automática
PORT=4000 npm start
```

## Tests

```bash
npm test
```

Cubre `GET /api/health`, `GET /api/events`, rutas inexistentes, JSON inválido y
la validación del puerto.

## Estructura de carpetas

```
proyecto-eventos/
├── src/
│   ├── app.js                  # configura Express y monta routers (no escucha)
│   ├── server.js               # levanta el servidor y maneja cierre/errores
│   ├── config/
│   │   └── env.js              # carga dotenv y valida variables
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── services/
│   │   └── events.service.js   # reglas de negocio
│   ├── repositories/
│   │   └── events.repository.js
│   ├── dao/
│   │   └── events.dao.js       # acceso a datos en memoria (provisorio)
│   ├── models/
│   │   ├── User.js             # campos base de usuario
│   │   └── Event.js            # campos base de evento
│   ├── middlewares/
│   │   ├── notFound.js         # 404 en JSON
│   │   ├── methodNotAllowed.js # 405 y OPTIONS por router
│   │   └── errorHandler.js     # errores centralizados
│   └── utils/
│       └── asyncHandler.js     # captura errores de handlers async
├── test/
│   ├── app.test.js
│   └── env.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Flujo de una petición: `routes` → `controllers` → `services` →
`repositories` → `dao`. Los modelos describen las entidades y los middlewares
centralizan el manejo de errores.

## Rutas disponibles

| Método | Ruta           | Descripción                     | Respuesta                                              |
|--------|----------------|---------------------------------|--------------------------------------------------------|
| GET    | `/api/health`  | Estado del servidor             | `200 {"status":"ok","message":"Servidor activo"}`       |
| GET    | `/api/events`  | Lista de eventos (aún vacía)    | `200 {"status":"success","payload":[]}`                 |
| GET    | `/api/sessions`| Estructura inicial, sin auth    | `200 {"status":"success","payload":[]}`                 |

### Ejemplos

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/events
curl http://localhost:3000/api/sessions
```

Ruta inexistente:

```json
{ "status": "error", "message": "Ruta no encontrada: GET /api/no-existe" }
```

Método no permitido (`POST /api/events`):

```json
{ "status": "error", "message": "Método POST no permitido en /api/events" }
```

JSON inválido o cuerpo mayor a 100 kb:

```json
{ "status": "error", "message": "JSON inválido" }
{ "status": "error", "message": "Cuerpo de la petición demasiado grande" }
```

## Próximas entregas

Registro y login, JWT y cookies, Passport, roles y autorización, CRUD de
eventos, inscripciones, control de cupos y notificaciones.
