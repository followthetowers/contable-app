# Como instalar y correr la App Contable

## Requisitos previos
Necesitas tener Node.js instalado. Para verificarlo, abre la terminal y escribe:
```
node -v
```
Si ves un numero como v18.x.x o mayor, ya estas listo.
Si no esta instalado, descargalo desde https://nodejs.org (version LTS)

---

## Paso 1: Instalar el backend

Abre una terminal, navega a la carpeta del proyecto y ejecuta:

```
cd contable-app/backend
npm install
npm start
```

Vas a ver este mensaje cuando este listo:
```
✓ Usuario creado  →  usuario: admin  |  password: admin123
✓ Seed completado
🟠 Servidor corriendo en http://localhost:3001
```

Deja esta terminal abierta.

---

## Paso 2: Instalar el frontend

Abre UNA SEGUNDA terminal (sin cerrar la del backend) y ejecuta:

```
cd contable-app/frontend
npm install
npm run dev
```

Vas a ver:
```
  VITE ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

## Paso 3: Abrir la app

Abre tu navegador y entra a:
```
http://localhost:5173
```

Ingresa con:
- Usuario: admin
- Contraseña: admin123

---

## Para usar en el dia a dia

Cada vez que quieras abrir la app:
1. Abre terminal 1 → cd contable-app/backend → npm start
2. Abre terminal 2 → cd contable-app/frontend → npm run dev
3. Entra a http://localhost:5173

---

## Estructura del proyecto

```
contable-app/
├── backend/     ← servidor Node.js (puerto 3001)
├── frontend/    ← app React (puerto 5173)
└── INSTRUCCIONES.md
```

La base de datos se guarda en: contable-app/backend/contable.db
Ese archivo contiene todos tus gastos. Guardalo como backup periodicamente.

---

## Cambiar la contrasena

Por ahora la contrasena se puede cambiar ejecutando este comando
(con el servidor corriendo) desde la terminal del backend:

```
node -e "
const db = require('./src/db/database');
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('TU_NUEVA_CONTRASENA', 10);
db.prepare('UPDATE usuarios SET password = ? WHERE usuario = ?').run(hash, 'admin');
console.log('Contrasena actualizada');
"
```
