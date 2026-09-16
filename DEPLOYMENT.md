# Preparación portable para producción

La aplicación no depende de un proveedor específico. Puede ejecutarse directamente con Node.js o mediante los contenedores incluidos.

## Requisitos

- Node.js 20 o 22
- PostgreSQL accesible mediante `DATABASE_URL`
- Variables del backend basadas en `backend/.env.example`
- `VITE_API_URL` definida al compilar el frontend

## Comprobaciones del backend

- `GET /health`: confirma que el proceso HTTP está activo.
- `GET /ready`: confirma que el proceso puede conectarse a PostgreSQL.

Los balanceadores deben utilizar `/ready` para decidir si envían tráfico al backend.

## Construir los contenedores

```sh
docker build -t sigetec-mb-backend ./backend
docker build --build-arg VITE_API_URL=https://api.example.com/api -t sigetec-mb-frontend ./frontend
```

## Ejecutarlos

```sh
docker run --env-file backend/.env -p 4000:4000 sigetec-mb-backend
docker run -p 8080:8080 sigetec-mb-frontend
```

El frontend queda disponible en el puerto `8080` y el backend utiliza `PORT`, cuyo valor predeterminado es `4000`.

## Base de datos nueva

Los contenedores no crean ni modifican el esquema automáticamente. Antes del primer arranque se debe inicializar deliberadamente la base vacía con el esquema del proyecto. Esto evita cambios inesperados durante un reinicio o despliegue.

## Apagado

El backend atiende `SIGTERM` y `SIGINT`, deja de aceptar solicitudes y cierra las conexiones de PostgreSQL. Si no finaliza antes de `SHUTDOWN_TIMEOUT_MS`, termina con código de error para que la plataforma pueda reemplazar la instancia.
