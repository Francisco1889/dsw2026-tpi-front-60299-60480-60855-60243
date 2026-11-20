# TPI de turnos médicos · Frontend

Aplicación de React para reservar y cancelar turnos como paciente, y gestionar médicos, especialidades, agendas y citas como administrador. Usa Vite, Tailwind CSS y Axios para conectarse a la API de ASP.NET Core.

## Ejecutar en desarrollo

1. Iniciá la API siguiendo el README del repositorio del backend. Con el perfil HTTP queda disponible en `http://localhost:5278`.
2. Abrí una terminal en la raíz del frontend, donde está `package.json`, y ejecutá:

   ```sh
   npm install
   npm run dev
   ```

3. Abrí [el ingreso de pacientes](http://localhost:5173/login) o [el ingreso de administradores](http://localhost:5173/admin/login).

## Configurar la conexión

El archivo `.env.development` ya apunta al backend local. Vite reenvía las peticiones que empiezan con `/api` al servidor indicado en `VITE_BACKEND_URL`.

Si la API usa otro puerto en tu equipo, copiá `.env.example` como `.env.development.local` en la raíz del frontend. Cambiá el valor por la dirección de tu API, solo con protocolo, host y puerto. Reiniciá `npm run dev` para aplicar el cambio.

Para comprobar la conexión, ingresá como paciente y abrí **Reservar Turno**. En las herramientas de desarrollo del navegador, pestaña **Network**, verificá que la consulta a `/api/specialties` responda con estado `200`.

## Verificar el proyecto

```sh
npm run lint
npm run format:check
npm run build
```

Los comandos revisan el código con ESLint, comprueban el formato con Prettier y generan la versión de producción en `dist/`.
