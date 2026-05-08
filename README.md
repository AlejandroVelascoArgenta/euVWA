# euVWA - Desarrollo UE Vulnerable Web Application

Aplicación educativa inspirada en DVWA, portada a Node.js + Express. Incluye dos implementaciones paralelas:

- `vulnerable/`: funcionalidades intencionadamente vulnerables para explotación en entorno local.
- `secure/`: mismas funcionalidades corregidas aplicando Secure Coding.

> Uso exclusivo en laboratorio local y con fines académicos.


La aplicación implementa 10 vulnerabilidades relacionadas con OWASP Top 10 distribuidas entre diferentes módulos funcionales de la aplicación.
Esta documentación incluye explicaciones detalladas y capturas de explotación de 8 de las vulnerabilidades implementadas.

<!-- TOC -->
* [euVWA - Desarrollo UE Vulnerable Web Application](#euvwa---desarrollo-ue-vulnerable-web-application)
  * [Instalación y ejecución](#instalación-y-ejecución)
    * [Requisitos](#requisitos)
    * [Ejecutar versión vulnerable](#ejecutar-versión-vulnerable)
    * [Ejecutar versión segura](#ejecutar-versión-segura)
  * [Ramas Git solicitadas](#ramas-git-solicitadas)
  * [Docker opcional](#docker-opcional)
  * [Tabla comparativa vulnerable vs segura](#tabla-comparativa-vulnerable-vs-segura)
  * [Evidencias/capturas sugeridas](#evidenciascapturas-sugeridas)
  * [Estructura profesional](#estructura-profesional)
  * [Explicación técnica resumida](#explicación-técnica-resumida)
  * [Commits significativos recomendados](#commits-significativos-recomendados)
<!-- TOC -->
## Instalación y ejecución

### Requisitos
- Node.js 20+
- npm
- Git
- Docker opcional

## Despliegue con Docker

El proyecto puede ejecutarse utilizando Docker y Docker Compose, permitiendo desplegar tanto la versión vulnerable como la versión segura en contenedores aislados.Como he hecho personalmente,desplegando el proyecto con docker
Antes de ejecutar contenedores, asegurarse que Docker Desktop esta abierto en tu ordenador
### Ejecutar contenedores
```bash
docker-compose up -d --build
```
Vemos como aparecen los dos contenedores corriendo dentro del proyecto eVWA
![Docker Deployment](docs/images/docker_deployment.png)

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

### Acceso a las aplicaciones

#### Versión vulnerable

```bash
http://localhost:3000
```

#### Versión segura

```bash
http://localhost:3001
```
#### Para detener los contenedores
```bash
docker-compose down
```



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

## Evidencias/capturas de vulnerabilidades

## 1. SQL Injection
Vulnerabilidad 1: SQL Injection

Entramos en: SQLi Search dentro de la web vulnerable 
`http:localhost:3000
`

Ejecutamos "a" en el buscador y damos a "Search"
Como vemos en la captura, observamos que la búsqueda normal devuelve únicamente usuarios coincidentes con el parámetro introducido.
![SQL Injection Before](docs/images/sql_injection_before.png)
#### _Pasamos a la explotación:_

Usamos el payload: **`admin' OR '1'='1`** 

Al introducir un payload SQL malicioso, la lógica de la consulta es alterada devolviendo resultados manipulados.
Como vemos en la captura 
![SQL Injection After](docs/images/sql_injection_after.png)
### Descripción y Conclusión de la explotación

La vulnerabilidad de SQL Injection ha permitido modificar la lógica interna de la consulta SQL mediante la inserción de un payload malicioso en el campo de búsqueda.

El payload utilizado:

```sql
admin' OR '1'='1
``` 
ha provocado que la condición de la consulta sea siempre verdadera, permitiendo alterar el comportamiento esperado de la aplicación y obteniendo resultados manipulados.

Esto demuestra que la aplicación vulnerable no valida ni sanitiza correctamente la entrada del usuario antes de construir la consulta SQL, interpretando el input como parte del código ejecutable.

La explotación de esta vulnerabilidad puede permitir:

- Acceso no autorizado a información sensible.
- Bypass de autenticación.
- Enumeración de usuarios.
- Extracción o modificación de datos de la base de datos.

En la versión segura, esta vulnerabilidad ha sido mitigada mediante el uso de consultas parametrizadas (Prepared Statements), evitando que la entrada del usuario sea interpretada como código SQL.
```

```
### 2. Reflected XSS

### Descripción

La vulnerabilidad Reflected Cross-Site Scripting (XSS) permite inyectar código JavaScript malicioso que es reflejado inmediatamente por la aplicación web sin validación ni sanitización adecuada.
La aplicación vulnerable muestra directamente el contenido introducido por el usuario dentro de la respuesta HTML, permitiendo la ejecución de scripts arbitrarios en el navegador de la víctima.

---

---

### Evidencia de explotación

Introducir el payload malicioso, el navegador ejecuta código JavaScript enviado por el atacante, demostrando que la aplicación no valida correctamente el contenido recibido.

#### Entrada normal
Como vemos en la captura, inicialmente,  para una entrada cualquiera, como mi nombre, nos devuelve esa misma entrada.

![Reflected XSS Before](docs/images/XSS_before.png)

---

## Payload utilizado

```html
<script>alert('XSS')</script>
```

#### Explotación Reflected XSS
Como vemos en la captura, nos muestra el alert diciendo **_XSS_** despues de ejecutar el Payload.

![Reflected XSS After](docs/images/XSS_After.png)

---

### Impacto

- Ejecución de código JavaScript arbitrario.
- Robo de cookies o sesiones.
- Redirección maliciosa de usuarios.
- Manipulación del contenido de la página.
- Posibles ataques de phishing.

---

### Mitigación aplicada en la versión segura

La versión segura de la web euVWA Secure implementa sanitización y escape de salida de los datos introducidos por el usuario, evitando que el navegador interprete el contenido como código ejecutable.

Además:

- Se validan los datos recibidos.
- Se escapan caracteres especiales HTML.
- Se aplican buenas prácticas de Secure Coding.

---

### Conclusión de la explotación

La vulnerabilidad Reflected XSS ha permitido ejecutar código JavaScript arbitrario en el navegador mediante la inserción de un payload malicioso reflejado por la aplicación web.

El payload utilizado:

```html
<script>alert('XSS')</script>
```

ha sido interpretado directamente por el navegador, demostrando que la aplicación vulnerable no sanitiza correctamente el contenido introducido por el usuario.

La explotación de esta vulnerabilidad puede permitir:

- Robo de sesiones.
- Ejecución de acciones en nombre del usuario.
- Modificación del contenido visual de la aplicación.
- Ataques de phishing y redirección maliciosa.

En la versión segura, esta vulnerabilidad ha sido mitigada mediante técnicas de escape de salida y sanitización de contenido.

---

### OWASP Relacionado

- OWASP Top 10 — A03:2021 Injection

## 3. Stored XSS

### Descripción

La vulnerabilidad Stored Cross-Site Scripting (Stored XSS) permite almacenar código JavaScript malicioso dentro de la aplicación para que posteriormente sea ejecutado automáticamente en el navegador de otros usuarios.

La aplicación vulnerable almacena contenido proporcionado por el usuario sin aplicar validaciones ni sanitización adecuada.

---

### Payload utilizado

```html
<b>PRUEBA</b>
```

---

### Evidencia de explotación

El payload malicioso queda almacenado permanentemente en la aplicación y es ejecutado automáticamente cada vez que la página vulnerable es cargada.

#### Entrada normal
Para una entrada cualquiera con nombre de autor cualquiera como Alejandro y Hola mundo como texto, nos muestra lo mismo.
![Stored XSS Before](docs/images/StoredXSS_before.png)

---

#### Explotación Stored XSS
Como vemos en la captura, al ejecutar el payload malicioso, con un nombre de autor cualquiera como Hacker, y despues de ejcutar el POST, la aplicación interpreta contenido HTML introducido por el usuario, demostrando ausencia de sanitización adecuada sobre el contenido almacenado.
![Stored XSS After](docs/images/StoredXSS_After.png)

---

### Impacto

- Ejecución persistente de código JavaScript.
- Robo de sesiones y cookies.
- Compromiso de múltiples usuarios.
- Modificación de contenido web.
- Distribución de malware o phishing.

---

### Mitigación aplicada en la versión segura

La versión segura implementa sanitización estricta del contenido almacenado y escape de salida antes de mostrar información al usuario.

Además:

- Se filtran etiquetas HTML peligrosas.
- Se validan los datos recibidos.
- Se aplican políticas seguras de renderizado.

---

### Conclusión de la explotación

La vulnerabilidad Stored XSS ha permitido almacenar contenido HTML persistente dentro de la aplicación, renderizándose posteriormente dentro de la aplicación web.
Esto demuestra que la aplicación vulnerable no aplica una sanitización adecuada sobre el contenido almacenado introducido por el usuario.
El payload utilizado:

```html
<b>PRUEBA</b>
```

demuestra que la aplicación almacena información sin aplicar controles adecuados de sanitización.

La explotación de esta vulnerabilidad puede permitir:

- Ataques persistentes contra múltiples usuarios.
- Robo de sesiones.
- Modificación del contenido mostrado.
- Distribución de contenido malicioso.

En la versión segura, esta vulnerabilidad ha sido mitigada mediante validación de entrada y sanitización de contenido almacenado.

---

### OWASP Relacionado

- OWASP Top 10 — A03:2021 Injection

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
