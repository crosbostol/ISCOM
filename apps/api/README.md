# API Documentation

## Overview
RESTful API built with Node.js, Express, and PostgreSQL. It serves as the backend for the ISCOM application.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express (v4.18)
- **Language**: TypeScript (v5.x)
- **Database**: PostgreSQL
- **ORM/Driver**: `pg` (node-postgres)
- **Validation**: Zod
- **Documentation**: Swagger (Swagger UI Express)
- **Testing**: Jest
- **Security**: Helmet, CORS

## Prerequisites
- Node.js (Latest stable recommended)
- PostgreSQL Database

## Configuration (.env)
Create a `.env` file in the `apps/api` directory with the following variables:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=TTBD
DB_PORT=5432
PORT=3000
```

## Scripts

### Installation
```bash
npm install
```

### Development
Runs the server with `nodemon` for hot-reloading.
```bash
npm run dev
```

### Production Build & Start
Compiles TypeScript to JavaScript (dist folder) and runs the node server.
```bash
npm run build
npm start
```

### Testing
Runs unit tests using Jest.
```bash
npm test
```

## API Documentation (Swagger)
When the server is running, you can access the interactive API documentation at:
`http://localhost:3000/swagger`

## Project Structure
- `src/server.ts`: Entry point.
- `src/api/routes`: Route definitions.
- `src/services`: Business logic.
- `src/config`: Configuration files (Swagger, DB, etc.).
- `dist`: Compiled JavaScript (generated on build).
