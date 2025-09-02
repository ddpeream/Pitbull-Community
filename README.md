# Pitbull Community

Sitio web MPA (Multi-Page App) informativo sobre perros tipo Pitbull: educación, bienestar y adopción responsable. Construido con HTML5, CSS3 y JavaScript (ES2020+) sin frameworks ni bundlers.

## Requisitos
- Navegador moderno
- Servidor estático local (para evitar CORS al leer JSON)

## Cómo correr en local (recomendado)
1. Instala la extensión "Live Server" en VS Code o usa cualquier servidor estático.
2. Abre la carpeta del proyecto en VS Code.
3. Inicia Live Server sobre `index.html`.

Opcional con Node.js (ejemplo):
- Instala una herramienta de servidor estático (una sola vez):
  - `npm i -g http-server`
- Luego, en la raíz del proyecto:
  - `http-server -p 5500`

Abre `http://localhost:5500` y navega el sitio.

## Estructura
- 5 páginas: `index.html`, `pitbulls.html`, `comunidades.html`, `lugares.html`, `galeria.html`.
- Assets: CSS (`assets/css`), JS (`assets/js`), imágenes (`assets/img`).
- Datos mock: `data/dogs.json`, `data/comunidades.json`, `data/lugares.json`.

## Dónde editar
- Datos:
  - Perros: `data/dogs.json`
  - Comunidades: `data/comunidades.json`
  - Lugares (mapa): `data/lugares.json`
- Estilos (paleta, tipografías, glass, sombras): `assets/css/styles.css` y utilidades en `assets/css/utilities.css`.
- Lógica global (tema, menú, toasts, reveal, destacados del Home): `assets/js/main.js`.
- Lógica por vista:
  - Explorador de Pitbulls: `assets/js/pitbulls.js`
  - Comunidades: `assets/js/comunidades.js`
  - Lugares (mapa Leaflet cargado bajo demanda): `assets/js/lugares.js`
  - Galería & Historias (masonry + lightbox): `assets/js/galeria.js`

## Paleta y tipografías
- Tipos desde Google Fonts: Poppins (titulares) e Inter (texto).
- Cambia variables CSS en `:root` dentro de `assets/css/styles.css` para ajustar colores y modo claro/oscuro. El modo automático sigue `prefers-color-scheme` con opción de override por el switch de tema en el navbar.

## Mapa (Lugares)
- La vista `lugares.html` carga Leaflet solo cuando el usuario presiona "Abrir mapa".
- CDN Leaflet usado: 
  - CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
  - JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
- Estructura de datos en `data/lugares.json`:
```json
{ "id": 1, "nombre": "Parque Canino Sabaneta", "lat": 6.15, "lng": -75.61, "tipo": "parque", "ciudad": "Área Metropolitana", "descripcion": "..." }
```

## Accesibilidad y rendimiento
- Semántica, labels y roles ARIA.
- Foco visible y navegación por teclado.
- Respeta `prefers-reduced-motion`.
- Imágenes `loading="lazy"`.
- JS modular y datos cacheados en `sessionStorage`.

## Nota de bienestar animal
Este proyecto no promueve la violencia ni la explotación animal. El enfoque es educativo, de bienestar y adopción responsable de perros tipo Pitbull.

## Licencia
Contenido mock y código de ejemplo con fines educativos. Sustituye imágenes y textos por contenido propio y autorizado.
