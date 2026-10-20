# 🚀 CloudDeploy SQL Tester &bull; Vue 3 + TypeScript + Tauri + SQL Server

Plataforma de prueba y validación de despliegues en la nube con **Microsoft SQL Server**, desarrollada con un frontend moderno en **Vue 3**, **TypeScript**, empaquetado para escritorio con **Tauri**, y una API backend en **Node.js Express**.

---

## 🌟 Características Principales

- **Base de Datos Microsoft SQL Server:**
  - Driver nativo TDS (`mssql` / `tedious`).
  - Scripts de esquema (`01_schema.sql`) y datos iniciales de prueba (`02_seed.sql`).
  - Tablas `DeploymentTests` (pruebas de despliegue) y `SystemLogs` (auditoría).
  - Soporte para autenticación SQL, cifrado SSL/TLS (`Encrypt=true` para Azure SQL) y certificados auto-firmados (`TrustServerCertificate=true`).
- **Frontend Moderno:**
  - **Vue 3** (Composition API, `<script setup lang="ts">`).
  - **TypeScript** con verificación estricta de tipos.
  - Diseño con CSS puro (glassmorphism, modo oscuro de alta fidelidad, tokens de diseño).
  - Medidor de latencia en tiempo real (Ping TDS en milisegundos).
  - Gestor CRUD completo de pruebas con filtrado por entorno y búsqueda.
  - Guías interactivas con comandos listos para copiar (Azure, Docker, Render, Tauri).
  - Selector dinámico de endpoint API (para probar servidores remotos en la nube).
- **Tauri (Desktop):**
  - Configuración lista en `frontend/src-tauri` para compilar la aplicación a binario nativo de Windows (`.exe` / `.msi`), macOS o Linux.
- **Preparado para la Nube:**
  - `docker-compose.yml` con SQL Server 2022 Linux + Backend + Frontend Nginx.
  - `Dockerfile.fullstack` multi-stage para desplegar como un solo contenedor en **Azure App Service**, **AWS App Runner**, **Render**, **Railway** o **Google Cloud Run**.

---

## 📁 Estructura del Proyecto

```text
c:/ProyectosSoftwarePlus/prueba_nodejs/
├── backend/                  # API REST Express + TypeScript + mssql
│   ├── src/
│   │   ├── config/db.ts      # Pool de conexión y diagnósticos SQL Server
│   │   ├── controllers/      # Health, Db Status, Deployments CRUD y Logs
│   │   ├── routes/api.ts     # Enrutador /api
│   │   └── server.ts         # Servidor Express y fallback SPA estático
│   ├── Dockerfile            # Dockerfile multi-stage para API
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Aplicación SPA Vue 3 + TypeScript + Tauri
│   ├── src/
│   │   ├── assets/main.css   # Sistema de diseño, temas y utilidades
│   │   ├── components/       # Componentes Vue (ConnectionCard, DeploymentManager, etc.)
│   │   ├── services/api.ts   # Cliente API tipado con endpoint dinámico
│   │   ├── types/index.ts    # Modelos TypeScript
│   │   ├── App.vue           # Vista principal y navegación
│   │   └── main.ts           # Entrada Vue
│   ├── src-tauri/            # Configuración y código Rust de Tauri v2
│   │   ├── Cargo.toml
│   │   ├── tauri.conf.json
│   │   └── src/main.rs
│   ├── Dockerfile            # Dockerfile Nginx para producción
│   ├── package.json
│   └── vite.config.ts
│
├── database/                 # Scripts SQL Server
│   ├── 01_schema.sql         # Tablas DeploymentTests y SystemLogs con índices
│   └── 02_seed.sql           # Datos iniciales para pruebas de lectura
│
├── docker-compose.yml        # Stack completo (SQL Server 2022 + Backend + Frontend)
├── Dockerfile.fullstack      # Contenedor unificado para despliegue en la nube
├── .env                      # Variables de entorno activas
├── .env.example              # Plantilla documentada de variables
└── package.json              # Scripts raíz unificados
```

---

## ⚙️ Variables de Entorno (`.env`)

```env
PORT=5000
NODE_ENV=development

# Datos del servidor SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_USER=cloud_user
DB_PASSWORD=CloudPass123!*
DB_NAME=CloudTestDb

# SSL / Cifrado (Importante para Azure SQL / AWS RDS)
# Para Azure SQL Database: DB_ENCRYPT=true, DB_TRUST_SERVER_CERTIFICATE=false
# Para Docker / Localhost:  DB_ENCRYPT=false, DB_TRUST_SERVER_CERTIFICATE=true
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

---

## 🚀 Cómo Ejecutar Localmente

### Opción 1: Servidor Unificado (Frontend Compilado + Backend API)
```bash
# Iniciar servidor en http://localhost:5000
npm run start
```
Abre en tu navegador: [http://localhost:5000](http://localhost:5000)

### Opción 2: Modo Desarrollo con Hot-Reload
En una terminal:
```bash
npm run dev:backend
```
En otra terminal:
```bash
npm run dev:frontend
```
Abre en tu navegador: [http://localhost:5173](http://localhost:5173)

---

## 🐳 Ejecución con Docker Compose

Levanta un SQL Server 2022 oficial en Linux, el backend API y el frontend en Nginx con un solo comando:

```bash
docker compose up --build -d
```

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **SQL Server 2022:** `localhost:1433` (Usuario: `sa`, Clave: `CloudPass123!*`)

Para detener los contenedores:
```bash
docker compose down
```

---

## ☁️ Guía de Despliegue en la Nube

### 1. Microsoft Azure (App Service + Azure SQL Database)

1. **Crear Azure SQL Database:**
   ```bash
   az sql server create --name mi-servidor-sql --resource-group mi-rg --location eastus --admin-user cloud_user --admin-password "TuPasswordSeguro123!*"
   az sql db create --resource-group mi-rg --server mi-servidor-sql --name CloudTestDb --service-objective S0
   ```
2. **Habilitar acceso en el Firewall de Azure SQL:**
   Permite el acceso a servicios de Azure (`Allow Azure services and resources to access this server = YES`).
3. **Desplegar con Azure App Service:**
   Configura las variables de entorno en el App Service:
   - `DB_SERVER=mi-servidor-sql.database.windows.net`
   - `DB_PORT=1433`
   - `DB_USER=cloud_user@mi-servidor-sql`
   - `DB_PASSWORD=TuPasswordSeguro123!*`
   - `DB_NAME=CloudTestDb`
   - `DB_ENCRYPT=true`
   - `DB_TRUST_SERVER_CERTIFICATE=false`
4. **Desplegar el código:**
   ```bash
   az webapp up --name mi-cloud-deploy-app --resource-group mi-rg --runtime "NODE:20-lts"
   ```

### 2. Render.com / Railway / Fly.io / Cloud Run

Usa el archivo [Dockerfile.fullstack](file:///c:/ProyectosSoftwarePlus/prueba_nodejs/Dockerfile.fullstack):
- Construye la aplicación completa en un único contenedor.
- Define las variables de entorno `DB_SERVER`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` en el panel de tu proveedor.
- El contenedor expone el puerto `5000` sirviendo tanto la API REST como la interfaz Vue 3.

---

## 🖥️ Ejecución como App de Escritorio con Tauri

Cuando tengas instalado Rust (`cargo`):
```bash
cd frontend
# Modo desarrollo con ventana nativa:
npm run tauri dev

# Compilar instalador ejecutable:
npm run tauri build
```
En la app de escritorio, puedes presionar el botón **"API Endpoint"** en la tarjeta de conexión para ingresar la URL de tu servidor en la nube y monitorear la base de datos de forma remota.

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servidor, memoria, plataforma y detección de nube |
| `GET` | `/api/db/status` | Test de ping en tiempo real a SQL Server, versión y latencia |
| `GET` | `/api/deployments` | Lista de pruebas registradas en la tabla `DeploymentTests` |
| `POST` | `/api/deployments` | Registra una nueva prueba de despliegue en SQL Server |
| `DELETE` | `/api/deployments/:id` | Elimina una prueba por ID |
| `GET` | `/api/deployments/stats` | Resumen de métricas, tasa de éxito y promedio de latencia |
| `GET` | `/api/logs` | Últimos registros de auditoría de la tabla `SystemLogs` |
