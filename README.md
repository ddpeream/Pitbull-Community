Pitbull Community — MPA HTML/CSS/JS

Descripción
- Sitio educativo y amable sobre perros tipo Pitbull: bienestar, educación y adopción responsable.
- Arquitectura MPA (5 páginas): Inicio, Pitbulls, Comunidades, Lugares (mapa diferido) y Galería.
- Sin frameworks. Solo HTML5, CSS3 y JavaScript (ES2020+). CDNs: Google Fonts, Remixicon y Leaflet (solo cuando se abre el mapa).

Estructura
- index.html — Inicio con hero, secciones de aprendizaje, destacados y newsletter.
- pitbulls.html — Explorador con filtros combinables y modal de ficha. Datos desde data/dogs.json.
- comunidades.html — Grid con buscador/filtros y modal de detalle. Datos desde data/comunidades.json.
- lugares.html — Listado + contenedor de mapa. Mapa Leaflet se carga bajo demanda y pinta marcadores desde data/lugares.json.
- galeria.html — Masonry CSS con lightbox y filtro por etiqueta (mock en JS).

Cómo correr localmente (recomendado Live Server)
1) Abre la carpeta del proyecto en VS Code.
2) Instala la extensión “Live Server” (Ritwick Dey) si no la tienes.
3) Clic derecho en index.html → “Open with Live Server”.

Nota CORS: Si abres los HTML con file:// algunos navegadores bloquean fetch() de JSON por CORS. Usa un servidor estático (Live Server o similar) para evitarlo.

Editar datos
- data/dogs.json — 12–24 perros con campos: id, nombre, edad, sexo, tamano, compatibilidad, ciudad, estado, foto, descripcion, etiquetas.
- data/comunidades.json — 8–16 comunidades: id, nombre, ciudad, email, ig, enfoque.
- data/lugares.json — 10–20 lugares: id, nombre, lat, lng, tipo (parque|vet|tienda), ciudad, descripcion.
Tras cambios, recarga la página. La app cachea datos en sessionStorage; si no ves actualizaciones, abre la consola y ejecuta: sessionStorage.clear().

Estilos y tipografías
- Paleta con variables CSS en assets/css/utilities.css (soporta modo claro/oscuro por prefers-color-scheme del SO).
- Tipos: Poppins (títulos) e Inter (texto) vía Google Fonts.
- Iconos: Remixicon CDN.

Mapa (Leaflet)
- El mapa no carga al iniciar para mejorar rendimiento. En lugares.html, pulsa “Abrir mapa” para cargar Leaflet desde CDN y mostrarlo.
- Los marcadores se generan a partir de data/lugares.json. Ajusta lat/lng según tus ubicaciones.

Accesibilidad y rendimiento
- Semántica, roles, aria y foco visible. Respeta prefers-reduced-motion.
- Imágenes con loading="lazy". JS modular y datos cacheados en sessionStorage.

Bienestar animal
- Este proyecto promueve el trato respetuoso y la adopción responsable. No se avala ninguna forma de violencia o actividades dañinas.

Créditos
- Fotos placeholder de picsum.photos/Unsplash.
- Mapa por Leaflet + OpenStreetMap.
