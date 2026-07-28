# 📺 Springfield Guide — Buscador de Personajes de Los Simpson

Trabajo Práctico Integrador adaptado a **The Simpsons API** en lugar de la SuperHero API.
Permite buscar, filtrar, ordenar y ver el detalle completo de los +1180 personajes de la serie.

**Demo:** _(agregá acá el link una vez deployado, por ejemplo en Netlify/Vercel/GitHub Pages)_

---

## 🧩 API utilizada

[The Simpsons API](https://thesimpsonsapi.com/) — API REST gratuita, sin autenticación.

- `GET https://thesimpsonsapi.com/api/characters?page=N` → lista paginada (20 por página, fijo)
- Cada personaje trae: `id, name, age, birthdate, gender, occupation, status, portrait_path, phrases`
- Imágenes: `https://cdn.thesimpsonsapi.com/500{portrait_path}`

Como la API **no tiene un endpoint de búsqueda por nombre**, la app trae el dataset completo una
sola vez al arrancar (paginando internamente en lotes concurrentes) y **toda la búsqueda, los
filtros, el orden y el paginado se resuelven en el frontend**, tal como pide la consigna original.

---

## ✅ Funcionalidades implementadas

- 🔎 Búsqueda de personajes por nombre (con debounce)
- 🔤 Orden alfabético ascendente / descendente
- 🧪 Filtros por **estado** (vivo / fallecido) y **género** — desafío de "mínimo 2 filtros"
- 🖼️ Modal de detalle con imagen, nombre, ocupación, edad, fecha de nacimiento, género, estado y frases célebres
- 🔢 Contador de resultados totales
- 📖 Paginado de 20 resultados por página, con:
  - Ir a primera / última página
  - Ir a página siguiente / anterior
  - Botones deshabilitados cuando corresponde
  - **Extra:** cantidad de páginas y página actual (display tipo "canal de TV")
  - **Extra:** select para ir a una página específica
  - **Extra:** al cerrar el modal, se vuelve exactamente a la página/búsqueda anterior
- 🌙 **Extra:** modo oscuro
- 📱 Diseño responsive (mobile / tablet / desktop)
- 🎨 Estilos con **SCSS** (variables, mixins, partials, anidamiento) — ver `css/`

---

## 🗂️ Estructura del proyecto

```
simpsons-app/
├── index.html
├── css/
│   ├── main.scss           # entry point que importa los partials
│   ├── main.css             # CSS compilado (lo que carga index.html)
│   └── partials/
│       ├── _variables.scss  # colores, tipografías, espaciados
│       ├── _mixins.scss     # mixins reutilizables (botones, sombras, etc)
│       ├── _reset.scss
│       ├── _layout.scss
│       ├── _header.scss
│       ├── _search.scss
│       ├── _cards.scss
│       ├── _pagination.scss
│       ├── _modal.scss
│       └── _darkmode.scss
├── js/
│   ├── api.js     # todo el consumo de The Simpsons API
│   ├── state.js   # estado de la app + funciones puras de filtrado/orden/paginado
│   ├── render.js  # funciones que pintan el DOM (tarjetas, paginado, modal)
│   └── app.js     # arranque de la app y manejo de eventos
└── README.md
```

Separación de responsabilidades: **api.js** no conoce el DOM, **state.js** no conoce el DOM,
**render.js** no decide lógica de negocio, y **app.js** es el único que conecta todo.

---

## 🎨 Compilar el SCSS

El repo ya incluye `css/main.css` compilado a mano para que el proyecto funcione directo con
Live Server. Si modificás los archivos `.scss`, recompilá con alguna de estas opciones:

**Opción A — extensión de VSCode (recomendado para el cursado):**
1. Instalar la extensión "Live Sass Compiler" (Ritwick Dey).
2. Click derecho sobre `css/main.scss` → "Watch Sass".

**Opción B — línea de comandos:**
```bash
npm install -g sass
sass css/main.scss css/main.css --watch
```

---

## 🚀 Cómo correrlo localmente

1. Cloná el repo.
2. Abrí la carpeta con VSCode.
3. Click derecho sobre `index.html` → "Open with Live Server".
4. No necesita variables de entorno ni API key: la API es pública.

---

## 🌿 Flujo de trabajo con Git (branches y PRs)

Este repo se armó siguiendo la consigna de **no trabajar sobre `main`**. Cada funcionalidad
vive en su propia rama y se integra a `main` mediante un merge equivalente a un Pull Request:

| Rama                             | Funcionalidad                                   |
|-----------------------------------|--------------------------------------------------|
| `feature/estructura-html`         | Maquetado base del `index.html`                  |
| `feature/estilos-sass`            | Sistema de diseño en SCSS                         |
| `feature/consumo-api`             | Conexión a The Simpsons API                       |
| `feature/busqueda-filtros-orden`  | Búsqueda, filtros y orden alfabético              |
| `feature/paginado-y-modal`        | Paginado y modal de detalle                       |

Para subir esto a GitHub y completar el flujo pedido por la consigna (un PR real por rama):

```bash
git remote add origin <URL_DE_TU_REPO>
git push -u origin main
git push origin feature/estructura-html
git push origin feature/estilos-sass
git push origin feature/consumo-api
git push origin feature/busqueda-filtros-orden
git push origin feature/paginado-y-modal
```

Y desde GitHub, abrir un Pull Request de cada rama `feature/*` hacia `main` con un título
descriptivo (aunque en este repo local ya están mergeadas, en GitHub podés recrear el PR y
mergearlo ahí para que quede documentado, o seguir agregando nuevas funcionalidades sobre
ramas nuevas a partir de acá).

---

## 📦 Deploy

Cualquiera de estas opciones sirve porque es un sitio 100% estático (HTML/CSS/JS sin build
obligatorio, ya que `main.css` viene compilado):

- **Netlify / Vercel:** arrastrar la carpeta o conectar el repo de GitHub.
- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` → `/ (root)`.

---

## 🙏 Créditos

Datos de personajes provistos por [The Simpsons API](https://thesimpsonsapi.com/), que a su vez
usa contenido de [The Simpsons Wiki](https://simpsons.fandom.com/wiki/Simpsons_Wiki) bajo licencia
CC BY-SA. Proyecto educativo sin fines de lucro.
