<div align="center">

<img src="https://nextjs.org/_next/static/immutable/media/nextjs-logotype-dark.3h4a2z2v_dkod.svg" width="110" alt="Logo de Next.js" />

# Proyecto Software I — Frontend

Interfaz web de **Proyecto-Software-I**, desarrollada con Next.js, React y TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Estado](https://img.shields.io/badge/estado-en_desarrollo-yellow)](#estado-del-proyecto)

</div>

---

## Descripción

Frontend de **Proyecto-Software-I**, construido con Next.js, React y TypeScript.

El backend se encuentra en un repositorio separado:

- [`Proyecto-Software-I/backend`](https://github.com/Proyecto-Software-I/backend)

## Tecnologías

- [Node.js](https://nodejs.org/)
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Requisitos

* Node.js 24 LTS.
* npm.
* Git.
* OpenSpec CLI.

Comprueba las versiones instaladas:

```bash
node --version
npm --version
git --version
openspec --version
```

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/Proyecto-Software-I/frontend.git
cd frontend
```

Instala las dependencias:

```bash
npm install
```

Instala OpenSpec globalmente:

```bash
npm install --global @fission-ai/openspec@latest
```

Comprueba la instalación:

```bash
openspec --version
```

## Variables de entorno

Crea `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

| Variable | Descripción | Valor predeterminado |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Dirección base del backend | `http://localhost:3000` |

El archivo `.env.local` no debe subirse al repositorio.

Toda variable nueva necesaria para ejecutar el proyecto debe agregarse también a `.env.example`, sin incluir información sensible.

## Configuración del backend

El backend debe permitir solicitudes desde el frontend.

En el archivo `.env` del backend:

```env
FRONTEND_URL=http://localhost:3001
```

Después de modificar esta variable, reinicia el backend.

## Ejecutar el proyecto

Inicia primero el backend:

```bash
npm run start:dev
```

Después inicia el frontend:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3001
```

## Comprobar la integración

La página principal consulta:

```http
GET /api/health
```

Dirección completa:

```text
http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "Proyecto-Software-I/backend"
}
```

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo en el puerto 3001 |
| `npm run build` | Genera la compilación de producción |
| `npm run start` | Ejecuta la compilación en el puerto 3001 |
| `npm run lint` | Analiza el código con ESLint |

## Verificación

```bash
npm run spec:validate
npm run lint
npm run build
npm run check
```

## CI/CD

### CI

Los Pull Requests dirigidos a `main` ejecutan GitHub Actions:

```text
PR -> main
  -> GitHub Actions
     -> npm ci
     -> npm run spec:validate
     -> npm run lint
     -> npm run build
```

Cada validación se ejecuta como un paso separado para identificar con claridad qué parte falla. El workflow falla si falla cualquiera de estos comandos.

Actualmente no existe una suite automatizada de pruebas configurada, por lo que el CI no ejecuta `npm test`.

### CD

El despliegue se gestiona mediante la integración Git nativa de Vercel:

```text
PR / branch -> Vercel Preview Deployment
main        -> Vercel Production Deployment
```

En Vercel, `main` debe configurarse como Production Branch. Las ramas de desarrollo deben generar previews y no deben sustituir producción.

Esta issue no modifica rulesets ni protecciones de `main`, no configura dominio personalizado y no despliega el backend.

### Variables de entorno en despliegue

Preview y Production deben configurar `NEXT_PUBLIC_API_URL` mediante Vercel Environment Variables.

`NEXT_PUBLIC_API_URL` es pública para el navegador porque usa el prefijo `NEXT_PUBLIC_`; no debe contener secretos, tokens, contraseñas, API keys privadas ni credenciales.

No subas archivos `.env` al repositorio. `.env.example` solo debe cambiar si aparece una variable nueva que realmente necesite documentación.

### Permisos y backend

Conectar Vercel requiere permisos sobre el repositorio de GitHub y acceso al proyecto o team de Vercel para configurar la Production Branch y las Environment Variables.

El backend puede necesitar permitir requests desde el dominio Production de Vercel y los dominios Preview. CORS del backend está fuera del alcance de este repositorio y debe coordinarse en la issue correspondiente si bloquea pruebas reales.

## Contribución

Las reglas de ramas, commits, issues, Pull Requests y revisiones se encuentran en:

- [Guía de contribución](.github/CONTRIBUTING.md)
