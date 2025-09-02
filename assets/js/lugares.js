import { qs, qsa, on, debounce, getJSON, toast } from "./main.js";

let lugares = [];
let mapLoaded = false;
let map, markersLayer;

function ensureMap(){
  if (mapLoaded) return Promise.resolve();
  return new Promise((resolve, reject)=>{
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    const script = document.createElement("script"); script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.defer = true;
    script.onload = ()=>{ mapLoaded = true; resolve(); };
    script.onerror = ()=>{ toast("No se pudo cargar el mapa"); reject(new Error("Leaflet load error")); };
    document.head.appendChild(link); document.head.appendChild(script);
  });
}

function renderList(items){
  const ul = qs("#lugaresLista");
  ul.innerHTML = items.map(l=>`<li class="lift" data-id="${l.id}">
    <strong>${l.nombre}</strong><br>
    <span class="muted">${l.ciudad} • ${l.tipo}</span>
  </li>`).join("");
}

function renderMap(items, focus){
  const wrap = document.body; wrap.classList.add("map-visible");
  const mapDiv = qs("#map");
  if (!map) {
    map = L.map(mapDiv).setView([6.2442, -75.5812], 12); // Medellín
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap"}).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }
  markersLayer.clearLayers();
  items.forEach(item=>{
    const m = L.marker([item.lat, item.lng]).addTo(markersLayer).bindPopup(`<strong>${item.nombre}</strong><br><span class=\"muted\">${item.ciudad} • ${item.tipo}</span>`);
    m._id = item.id; // asociación simple
  });
  if (focus){ map.setView([focus.lat, focus.lng], 15); }
}

function compute(){
  const f = new FormData(qs("#lugaresForm"));
  const tipo = f.get("tipo");
  const ciudad = f.get("ciudad");
  const items = lugares.filter(l=> (!tipo || l.tipo===tipo) && (!ciudad || l.ciudad===ciudad));
  renderList(items);
  return items;
}

function fillSelects(){
  const selCiudad = qs("#ciudad");
  const ciudades = Array.from(new Set(lugares.map(l=>l.ciudad))).sort();
  ciudades.forEach(ci=>{ const o=document.createElement("option"); o.value=ci; o.textContent=ci; selCiudad.appendChild(o); });
}

(async function init(){
  lugares = await getJSON("data/lugares.json", "lugares");
  fillSelects();
  const items = compute();

  const btnMapa = qs("#btnMapa");
  on(btnMapa, "click", null, async()=>{
    await ensureMap();
    qs("#map").style.display = "block";
    renderMap(items);
  });

  on(qs("#lugaresForm"), "input", null, debounce(async()=>{
    const list = compute();
    if (mapLoaded) renderMap(list);
  }, 200));

  on(qs("#lugaresLista"), "click", "li", async(e, li)=>{
    const id = Number(li.dataset.id);
    const sel = lugares.find(x=>x.id===id);
    if (!sel) return;
    if (!mapLoaded){ await ensureMap(); qs("#map").style.display = "block"; }
    const currentItems = compute();
    renderMap(currentItems, sel);
    // Abrir popup del marcador seleccionado
    if (markersLayer) {
      markersLayer.eachLayer(marker=>{ if (marker._id === id) { marker.openPopup(); } });
    }
  });
})();
