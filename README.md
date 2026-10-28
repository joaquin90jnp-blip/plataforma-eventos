# Plataforma de Eventos e Inscripciones

API REST para la gestión de eventos y sus inscripciones. La primera
pre-entrega estableció la base arquitectónica (Express, configuración por
variables de entorno y separación por capas). Esta segunda pre-entrega suma el
registro seguro de usuarios: validación, normalización de email, contraseña
hasheada con bcrypt y persistencia en MongoDB mediante Mongoose.

## Temática

Plataforma de eventos e inscripciones: difusión de eventos, gestión de cupos y
registro de participantes. Las próximas entregas incorporan login, JWT,
cookies, Passport, roles y autorización.

## Tecnologías

- Node.js 20+ (ESM, `import`/`export`)
- Express 4
- MongoDB + Mongoose
- bcryptjs (hash de contraseñas)
- dotenv
- `node:test` + Supertest (los tests de registro usan `mongodb-memory-server`)

## Requisitos

- Node.js 20 o superior
- npm
- MongoDB local o una cadena de conexión (por ejemplo, MongoDB Atlas)

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

| Variable     | Obligatoria | Valor por defecto | Descripción                                             |
|--------------|-------------|-------------------|---------------------------------------------------------|
| `PORT`       | No          | `3000`            | Puerto del servidor (entero entre 1 y 65535)             |
| `NODE_ENV`   | No          | `development`     | Entorno de ejecución                                    |
| `MONGO_URL`  | Sí          | vacío             | Cadena de conexión a MongoDB                             |
| `JWT_SECRET` | No          | vacío             | Reservada para la próxima entrega (login con JWT)        |

El archivo `.env` está excluido de Git. Nunca subir credenciales al repositorio.

## Ejecución

```bash
npm start        # producción
npm run dev      # desarrollo con recarga automática
PORT=4000 npm start
```

El servidor valida `MONGO_URL` y se conecta a MongoDB antes de escuchar. Si la
variable falta o la conexión falla, el proceso termina con un mensaje claro.

## Tests

```bash
npm test
```

Cubre salud y eventos (M1), validación del puerto, JSON inválido, y el registro
completo: éxito, normalización de email, campos faltantes, email inválido,
contraseña corta, email duplicado, rol forzado a `user`, contraseña hasheada en
la base y respuesta sin datos sensibles. El test de registro levanta un MongoDB
efímero con `mongodb-memory-server`; no requiere una base local.

## Estructura de carpetas

```
proyecto-eventos/
├── src/
│   ├── app.js                      # configura Express y monta routers (no escucha)
│   ├── server.js                   # conecta MongoDB, levanta el servidor y maneja cierre
│   ├── config/
│   │   ├── env.js                  # carga dotenv y valida variables
│   │   └── db.js                   # conexión/desconexión con Mongoose
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   └── sessions.router.js      # POST /api/sessions/register
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js  # traduce HTTP ↔ service
│   ├── services/
│   │   ├── events.service.js
│   │   └── sessions.service.js     # validación, normalización y reglas de registro
│   ├── repositories/
│   │   ├── events.repository.js
│   │   └── users.repository.js
│   ├── dao/
│   │   ├── events.dao.js           # acceso en memoria (provisorio)
│   │   └── users.dao.js            # consultas Mongoose
│   ├── models/
│   │   ├── User.js                 # esquema, roles y serialización pública
│   │   └── Event.js
│   ├── middlewares/
│   │   ├── notFound.js
│   │   ├── methodNotAllowed.js
│   │   └── errorHandler.js
│   └── utils/
│       ├── asyncHandler.js
│       ├── hash.js                 # bcrypt reutilizable (registro y futuro login)
│       ├── httpError.js            # errores con status y mensaje público
│       └── validation.js           # email, normalización y mínimos
├── test/
│   ├── app.test.js
│   ├── env.test.js
│   ├── errorHandler.test.js
│   ├── hash.test.js
│   ├── register.test.js
│   └── validation.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Flujo de una petición: `routes` → `controllers` → `services` →
`repositories` → `dao` → `models`. La ruta solo enruta; el controller traduce
HTTP; el service valida y aplica reglas; repository y dao acceden a los datos.

## Modelo User

| Campo        | Tipo    | Detalle                                              |
|--------------|---------|------------------------------------------------------|
| `first_name` | String  | Obligatorio, se guarda con `trim`                    |
| `last_name`  | String  | Obligatorio, se guarda con `trim`                    |
| `email`      | String  | Obligatorio, único, normalizado (`trim` + minúsculas) |
| `password`   | String  | Obligatorio, solo se guarda el hash bcrypt           |
| `role`       | String  | `user` \| `organizer` \| `admin`; por defecto `user`  |

El campo `password` tiene `select: false` y el modelo elimina la contraseña en
`toJSON`. La respuesta HTTP se construye con `toPublicUser`, que solo expone
`id`, `first_name`, `last_name`, `email` y `role`.

## Rutas disponibles

| Método | Ruta                       | Descripción                     | Respuesta                                        |
|--------|----------------------------|---------------------------------|--------------------------------------------------|
| GET    | `/api/health`              | Estado del servidor             | `200 {"status":"ok","message":"Servidor activo"}` |
| GET    | `/api/events`              | Lista de eventos (aún vacía)    | `200 {"status":"success","payload":[]}`           |
| GET    | `/api/sessions`            | Estructura inicial, sin auth    | `200 {"status":"success","payload":[]}`           |
| POST   | `/api/sessions/register`   | Registro público de usuario     | `201` con el usuario público                     |

## POST /api/sessions/register

### Campos esperados

| Campo        | Tipo   | Obligatorio | Validación                                  |
|--------------|--------|-------------|---------------------------------------------|
| `first_name` | string | Sí          | No puede estar vacío                        |
| `last_name`  | string | Sí          | No puede estar vacío                        |
| `email`      | string | Sí          | Formato de email; se normaliza antes de guardar |
| `password`   | string | Sí          | Mínimo 8 caracteres                        |

`role` se ignora aunque venga en el body: el registro público siempre crea
usuarios con rol `user`.

### Request

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

### Response 201

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La respuesta nunca incluye `password`, ni en texto plano ni hasheada.

### Errores

| Situación                          | Status | Body                                                    |
|------------------------------------|--------|---------------------------------------------------------|
| Campos faltantes o vacíos          | 400    | `{"status":"error","message":"Faltan campos obligatorios"}` |
| Email con formato inválido         | 400    | `{"status":"error","message":"Email inválido"}`          |
| Contraseña de menos de 8 caracteres| 400    | `{"status":"error","message":"La contraseña debe tener al menos 8 caracteres"}` |
| Email ya registrado                | 409    | `{"status":"error","message":"El email ya está registrado"}` |
| Método no permitido                | 405    | `{"status":"error","message":"Método GET no permitido en /api/sessions/register"}` |
| JSON inválido                      | 400    | `{"status":"error","message":"JSON inválido"}`           |

### Probar con curl

Con el servidor y MongoDB activos:

```bash
# Registro exitoso
curl -i -X POST http://localhost:3000/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Pérez","email":"Ana@Mail.com ","password":"Secreta123"}'

# Email duplicado (responde 409)
curl -i -X POST http://localhost:3000/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Pérez","email":"ANA@mail.com","password":"Secreta123"}'

# Campos faltantes (responde 400)
curl -i -X POST http://localhost:3000/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana"}'
```

### Verificar que la contraseña está hasheada en MongoDB

Con `mongosh`:

```js
use eventos
db.users.findOne(
  { email: "ana@mail.com" },
  { first_name: 1, last_name: 1, email: 1, role: 1, password: 1 }
)
```

El documento muestra un valor como
`password: "$2b$10$..."`, nunca `"Secreta123"`.

## Seguridad aplicada

- La contraseña se hashea con bcrypt (10 rondas) en `utils/hash.js` antes de
  llegar al dao; la base solo guarda el hash.
- El hash se genera en el service, no en la ruta ni en el modelo.
- `password` tiene `select: false` y se elimina en `toJSON`; la respuesta usa
  un presenter explícito.
- El rol del registro público es fijo (`user`); no se acepta desde el body.
- El email se normaliza y el índice único evita duplicados incluso ante dos
  peticiones simultáneas (se traduce el error `E11000` a 409).
- `.env`, `node_modules` y logs están excluidos por `.gitignore`.

## Próximas entregas

Login, JWT y cookies, ruta `current`, Passport, roles y autorización, CRUD de
eventos, inscripciones, control de cupos y notificaciones.
