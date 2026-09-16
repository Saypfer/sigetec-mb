# Preparación portable para producción

La aplicación no depende de un proveedor específico. Puede ejecutarse directamente con Node.js o mediante los contenedores incluidos.

Antes de publicar una versión, completa [PREDEPLOY.md](./PREDEPLOY.md).

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

## Primer administrador

Después de inicializar el esquema y antes de publicar la aplicación, configura temporalmente estas variables en el entorno del backend:

- `INITIAL_ADMIN_NAME`
- `INITIAL_ADMIN_EMAIL`
- `INITIAL_ADMIN_PASSWORD`: entre 12 caracteres y 72 bytes.
- `INITIAL_ADMIN_PHONE`: opcional; debe contener exactamente 8 números.

Ejecuta el comando una sola vez desde `backend`:

```sh
npm run create-admin
```

El comando bloquea la creación si ya existe un administrador y nunca imprime la contraseña. Al terminar, elimina las cuatro variables del entorno o del gestor de secretos. Los siguientes usuarios deben crearse desde la sección de usuarios de la aplicación.

## Respaldos y recuperación

La imagen del backend incluye `pg_dump` y `pg_restore`. Ambos comandos leen `DATABASE_URL` sin colocar la contraseña en los argumentos del proceso.

Para crear un respaldo en formato comprimido de PostgreSQL, ejecuta desde `backend`:

```sh
npm run db:backup -- --output=backups/sigetec.dump
```

El comando rechaza un archivo de destino existente y genera dos archivos que deben almacenarse juntos fuera del contenedor:

- `sigetec.dump`: respaldo en formato personalizado de PostgreSQL.
- `sigetec.dump.sha256`: checksum utilizado para detectar corrupción o modificaciones.

Para restaurar en una base vacía o de prueba:

```sh
npm run db:restore -- --file=backups/sigetec.dump --confirm-database=sigetec
```

El valor de `--confirm-database` debe coincidir exactamente con el nombre incluido en `DATABASE_URL`. La restauración se cancela si falta el checksum, si no coincide o si el archivo no es un respaldo válido.

Solo cuando se pretenda reemplazar deliberadamente objetos existentes se puede agregar `--clean`:

```sh
npm run db:restore -- --file=backups/sigetec.dump --confirm-database=sigetec --clean
```

`--clean` elimina objetos de la base destino antes de restaurarlos. Debe probarse primero sobre una base separada. Como política inicial, conserva respaldos diarios durante 7 días, semanales durante 4 semanas y mensuales durante 12 meses; cifra el almacenamiento y realiza una restauración de prueba periódica.

## Registros operativos

El backend escribe registros JSON en la salida estándar y los errores en la salida de errores. Cada solicitud recibe la cabecera `X-Request-Id`, que permite relacionar una respuesta con su registro sin almacenar cuerpos, contraseñas ni tokens. Las rutas `/health` y `/ready` no generan registros de acceso para evitar ruido del monitoreo.

La plataforma elegida debe conservar ambas salidas. No es necesario montar archivos de logs dentro del contenedor.

## Apagado

El backend atiende `SIGTERM` y `SIGINT`, deja de aceptar solicitudes y cierra las conexiones de PostgreSQL. Si no finaliza antes de `SHUTDOWN_TIMEOUT_MS`, termina con código de error para que la plataforma pueda reemplazar la instancia.
