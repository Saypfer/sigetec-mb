# Checklist previo al despliegue

Este documento es el control final para publicar SIGETEC-MB. Los pasos específicos del proveedor se completan cuando se elija la plataforma.

## 1. Verificación del código

Ejecuta desde la raíz del proyecto con la URL pública prevista para el API:

```sh
node scripts/preflight.js --api-url=https://api.example.com/api
```

El preflight ejecuta las pruebas del backend y frontend, bloquea vulnerabilidades altas o críticas y comprueba la compilación y su presupuesto de tamaño. La URL debe usar HTTPS, excepto para `localhost` y direcciones loopback.

La integración continua también construye las dos imágenes Docker sin publicarlas. Un commit no está listo si falla cualquiera de estos trabajos.

## 2. Recursos y variables

- Crear una base PostgreSQL privada y anotar su versión y límite de conexiones.
- Generar un `JWT_SECRET` aleatorio de al menos 32 caracteres.
- Configurar `NODE_ENV=production`, `DATABASE_URL`, `DB_SSL`, `CORS_ORIGIN`, `TRUST_PROXY_HOPS`, `HOST`, `PORT`, `JWT_EXPIRES_IN` y `SHUTDOWN_TIMEOUT_MS`.
- Compilar el frontend con `VITE_API_URL` apuntando a la ruta pública `/api` del backend.
- Configurar los dominios, HTTPS, health checks y recolección de stdout/stderr.
- Mantener secretos únicamente en el gestor de secretos de la plataforma.

## 3. Primera publicación

No existe información antigua que trasladar, pero la base vacía necesita su esquema:

```sh
cd backend
npm run migrate
npm run create-admin
```

Las variables `INITIAL_ADMIN_*` se configuran solo para el segundo comando y deben eliminarse inmediatamente después. No ejecutes el seeder de demostración.

Después, publica el backend y frontend y confirma que la plataforma utiliza `/ready` para el backend y `/health` para el frontend.

## 4. Prueba de humo

Desde `backend`, comprueba la publicación real:

```sh
npm run smoke -- --frontend-url=https://app.example.com --backend-url=https://api.example.com
```

La prueba valida el HTML, las cabeceras de seguridad, ambos health checks, la conexión con PostgreSQL y `X-Request-Id`.

Antes de aceptar el lanzamiento, inicia sesión con el administrador inicial y comprueba manualmente la creación de un cliente, equipo, repuesto y orden de prueba.

## 5. Backups y rollback

- Activar backups administrados y documentar retención, ubicación y responsable.
- Generar un respaldo manual antes de cualquier cambio futuro de esquema.
- Conservar identificadas las imágenes de la versión anterior.
- Para revertir solo la aplicación, volver a las imágenes anteriores sin ejecutar automáticamente `migrate:undo`.
- Restaurar una base únicamente desde un respaldo verificado y después de confirmar el destino.
- Realizar una restauración de ensayo antes de depender del procedimiento en producción.

## Criterio de lanzamiento

El despliegue queda aprobado únicamente cuando CI está en verde, `/ready` responde `200`, la prueba de humo finaliza correctamente, el administrador puede completar el flujo crítico y existe un respaldo recuperable.
