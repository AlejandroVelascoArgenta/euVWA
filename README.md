# euVWA - Desarrollo UE Vulnerable Web Application

Aplicación educativa inspirada en DVWA, portada a Node.js + Express. Incluye dos implementaciones paralelas:

- `vulnerable/`: funcionalidades intencionadamente vulnerables para explotación en entorno local.
- `secure/`: mismas funcionalidades corregidas aplicando Secure Coding.

> Uso exclusivo en laboratorio local y con fines académicos.

## Instalación y ejecución

### Requisitos
- Node.js 20+
- npm
- Git
- Docker opcional

### Ejecutar versión vulnerable
```bash
cd vulnerable
npm install
npm start
# http://localhost:3000
```

Credenciales demo: `admin / password`, `alice / alice123`.

### Ejecutar versión segura
```bash
cd secure
npm install
npm start
# http://localhost:3001
```

Credenciales demo: `admin / ChangeMe_Admin_123!`, `alice / ChangeMe_Alice_123!`.

## Ramas Git solicitadas

Si quieres entregar como ramas reales:

```bash
git init
git add README.md vulnerable secure docker-compose.yml
git commit -m "Initial euVWA project with vulnerable and secure versions"

git checkout -b main-vulnerable
git rm -r secure
git commit -m "Keep intentionally vulnerable implementation"

git checkout main
git checkout -b main-secure
git rm -r vulnerable
git commit -m "Keep secure implementation with mitigations"
```

También puedes mantener ambas carpetas en `main` para corrección local y crear las dos ramas como pide el enunciado.

## Docker opcional

```bash
docker compose up --build
```

- Vulnerable: http://localhost:3000
- Secure: http://localhost:3001

## Tabla comparativa vulnerable vs segura

| # | Vulnerabilidad OWASP | Ruta vulnerable | Explotación demo | Corrección en `secure` |
|---|---|---|---|---|
| 1 | SQL Injection | `POST /login`, `GET /search` | Login con `admin' OR '1'='1' --` o búsqueda con `' OR 1=1 --` | Consultas parametrizadas con `?`; no concatenación SQL |
| 2 | XSS reflejado | `GET /xss-reflected?name=` | `<script>alert(1)</script>` | Escape con EJS `<%= %>` y validación/escape de entrada |
| 3 | XSS almacenado | `POST /comments` | Guardar `<img src=x onerror=alert(1)>` | Usuario autenticado, escape de entrada y renderizado seguro |
| 4 | Command Injection | `POST /ping` | `127.0.0.1; whoami` | `execFile()` con argumentos separados y whitelist de host |
| 5 | Insecure File Upload | `POST /upload` | Subida de HTML/JS o payload no validado | Filtro MIME, límite de tamaño, nombres normalizados |
| 6 | Broken Authentication | `POST /login` | Passwords en claro, sesión débil, cookie no httpOnly | `bcrypt`, `session.regenerate`, cookie `httpOnly` y `sameSite` |
| 7 | Sensitive Data Exposure | `GET /api/users` | Devuelve passwords/tokens de todos los usuarios sin login | Requiere auth+admin y solo devuelve campos mínimos |
| 8 | Security Misconfiguration | App global | Stack traces, secreto hardcoded, sin cabeceras | `helmet`, rate limit, error genérico, configuración más restrictiva |
| 9 | Path Traversal / descarga insegura | `GET /download?file=` | Intento con `../data/euvwa.db` | `path.basename`, verificación de ruta y existencia |
| 10 | Broken Access Control | `GET /admin?role=admin` | Acceso manipulando query param | Middleware `adminOnly` basado en sesión real |

## Evidencias/capturas sugeridas

Incluye capturas en `docs/screenshots/` o un vídeo corto mostrando:

1. SQLi login bypass.
2. SQLi search mostrando usuarios.
3. XSS reflejado con alerta.
4. XSS almacenado en comentarios.
5. Command Injection ejecutando `whoami`.
6. File upload aceptando archivo no permitido en vulnerable.
7. `/api/users` exponiendo contraseñas/tokens.
8. `/admin?role=admin` saltando autorización.
9. Error con stack trace en vulnerable.

## Estructura profesional

```text
euVWA/
├── README.md
├── docker-compose.yml
├── vulnerable/
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── db.js
│   │   └── routes.js
│   ├── views/
│   ├── public/uploads/
│   └── data/
└── secure/
    ├── package.json
    ├── src/
    │   ├── app.js
    │   ├── db.js
    │   └── routes.js
    ├── views/
    ├── public/uploads/
    └── data/
```

## Explicación técnica resumida

La versión vulnerable reproduce fallos típicos de aplicaciones web: concatenación directa en SQL, renderizado HTML no escapado, ejecución de comandos con cadenas construidas por el usuario, subida de archivos sin validación, autenticación con contraseñas en claro, exposición de datos sensibles y controles de acceso basados en parámetros manipulables.

La versión segura aplica defensa en profundidad: consultas parametrizadas, `bcrypt`, regeneración de sesión tras login, cookies más seguras, cabeceras con `helmet`, rate limiting, validación de entradas, uso de `execFile`, filtrado de ficheros, reducción de datos expuestos, control de roles en middleware y manejo de errores sin filtrar detalles internos.

## Commits significativos recomendados

```bash
git commit -m "Create Express application skeleton"
git commit -m "Implement intentionally vulnerable SQLi and XSS labs"
git commit -m "Add command injection and insecure upload labs"
git commit -m "Add broken auth, data exposure and access control labs"
git commit -m "Implement secure SQL queries and output encoding"
git commit -m "Add secure authentication and authorization middleware"
git commit -m "Harden file upload, command execution and app security headers"
git commit -m "Document exploitation steps and secure mitigations"
```






# Actividad 2 - Pipeline DevSecOps

## Objetivo

Partiendo de la aplicación euVWA desarrollada en la Actividad 1, se implementa un pipeline DevSecOps completo utilizando GitHub Actions.

El objetivo es integrar controles de seguridad automatizados dentro del ciclo de vida del desarrollo, aplicando el enfoque Shift Left para 
detectar vulnerabilidades desde fases tempranas del desarrollo hasta el despliegue.


## Estrategia de ramas

Para mantener separada la Actividad 2 de la entrega anterior, se ha creado una rama específica:

```text
actividad-2-devsecops