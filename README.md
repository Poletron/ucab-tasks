# UCAB Tasks API

API REST para gestión de notas desarrollada con **NestJS**, siguiendo principios de **Clean Architecture** y containerizada con **Docker**.

## 🚀 Características

- **Clean Architecture**: Separación clara entre dominio, infraestructura y casos de uso
- **Patrón Repositorio**: Lógica de negocio agnóstica a la base de datos
- **Docker Ready**: Levanta todo el entorno con un solo comando
- **Swagger UI**: Documentación interactiva de la API
- **TypeScript Strict**: Tipado estricto para mayor seguridad

## 📋 Requisitos

- [Docker](https://www.docker.com/get-started) v20+ y Docker Compose
- [Node.js](https://nodejs.org/) v20+ (solo para desarrollo local sin Docker)

## 🏃‍♂️ Inicio Rápido (Docker - Recomendado)

```bash
# Clonar el repositorio
git clone <repository-url>
cd ucab-tasks

# Copiar variables de entorno
cp .env.example .env

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

La API estará disponible en:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/notes
- **Swagger UI**: http://localhost:3000/api/docs

## 🎨 Frontend

La aplicación incluye una interfaz web moderna inspirada en Notion/Apple Notes:

- **Diseño elegante** con tipografía Inter y paleta de colores cálida
- **Sidebar** con lista de notas y ordenamiento
- **Editor** con auto-guardado y atajos de teclado
- **Responsive** para móviles y escritorio

### Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+S` | Guardar nota |
| `Ctrl+N` | Nueva nota |
| `Esc` | Cerrar modal |

## 🛠️ Desarrollo Local (Sin Docker)

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env y configurar MONGO_URI para tu MongoDB local

# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar pruebas
npm run test

# Compilar para producción
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── core/                    # Dominio puro (sin dependencias de frameworks)
│   ├── entities/           # Entidades de dominio
│   │   └── note.entity.ts
│   └── interfaces/         # Contratos/Abstracciones
│       └── notes-repository.interface.ts
│
├── infrastructure/          # Implementaciones externas
│   ├── persistence/        # Schemas de Mongoose
│   │   └── note.schema.ts
│   └── repositories/       # Implementaciones de repositorios
│       └── mongo-notes.repository.ts
│
├── use-cases/              # Lógica de aplicación
│   └── notes/
│       ├── dto/            # Data Transfer Objects
│       ├── notes.controller.ts
│       ├── notes.service.ts
│       └── notes.module.ts
│
├── app.module.ts           # Módulo raíz
└── main.ts                 # Punto de entrada
```

## 🔌 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/notes` | Obtener todas las notas (sin contenido) |
| `GET` | `/notes/:id` | Obtener una nota completa por ID |
| `POST` | `/notes` | Crear una nueva nota |
| `PATCH` | `/notes/:id` | Actualizar una nota existente |
| `DELETE` | `/notes` | Eliminar una o más notas |

### Query Parameters para GET /notes

| Parámetro | Valores | Descripción |
|-----------|---------|-------------|
| `sortBy` | `title`, `createdAt`, `updatedAt` | Campo para ordenar |
| `order` | `asc`, `desc` | Dirección del ordenamiento |

### Ejemplo de uso

```bash
# Crear una nota
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi primera nota", "content": "Contenido de la nota"}'

# Obtener todas las notas ordenadas por título
curl "http://localhost:3000/notes?sortBy=title&order=asc"

# Obtener una nota específica
curl http://localhost:3000/notes/<id>

# Actualizar una nota
curl -X PATCH http://localhost:3000/notes/<id> \
  -H "Content-Type: application/json" \
  -d '{"title": "Título actualizado"}'

# Eliminar notas
curl -X DELETE http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"ids": ["<id1>", "<id2>"]}'
```

## 🏗️ Arquitectura

Este proyecto implementa **Clean Architecture** con el **Patrón Repositorio**:

```
┌──────────────────────────────────────────────────────────────┐
│                      Controllers (HTTP)                       │
│                           ↓                                   │
│                      Services (Lógica)                        │
│                           ↓                                   │
│               INotesRepository (Abstracción)                  │
│                           ↓                                   │
│            MongoNotesRepository (Implementación)              │
│                           ↓                                   │
│                      MongoDB                                  │
└──────────────────────────────────────────────────────────────┘
```

### Beneficios

- **Testabilidad**: Los servicios pueden testearse con repositorios mock
- **Flexibilidad**: Cambiar de MongoDB a PostgreSQL solo requiere nueva implementación
- **Mantenibilidad**: Cambios en infraestructura no afectan la lógica de negocio

## 🐳 Docker

### Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `app` | 3000 | API NestJS |
| `mongo` | 27017 | MongoDB |

### Comandos útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose build --no-cache
```

## 📝 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto de la API | `3000` |
| `MONGO_URI` | URI de conexión MongoDB | `mongodb://mongo:27017/ucab-tasks` |
| `NODE_ENV` | Entorno de ejecución | `development` |

## 📚 Documentación

La documentación interactiva de la API está disponible en Swagger UI:

```
http://localhost:3000/api
```

## 🧪 Testing

```bash
# Pruebas unitarias
npm run test

# Pruebas con cobertura
npm run test:cov

# Pruebas e2e
npm run test:e2e
```

## 📄 Licencia

MIT
