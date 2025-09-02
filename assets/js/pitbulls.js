import { qs, qsa, on, debounce, getJSON, toast } from "./main.js";

const PAGE_SIZE = 9;
let allDogs = [];
let filtered = [];
let page = 1;

function renderCards(items){
  const grid = qs("#dogsGrid");
  const slice = items.slice(0, page*PAGE_SIZE);
  grid.innerHTML = slice.map(d=>`<article class="card lift" data-id="${d.id}">
    <img src="${d.foto}" alt="${d.nombre}" loading="lazy">
    <div class="mt-8">
      <h3 class="card-title">${d.nombre}</h3>
      <p class="muted">${d.ciudad} • ${d.edad} • ${d.sexo} • ${d.tamano}</p>
      <div class="chips mt-8">${(d.etiquetas||[]).slice(0,3).map(t=>`<span class="badge">${t}</span>`).join("")}</div>
      <div class="mt-8"><button class="btn" data-open="ficha" data-id="${d.id}">Ver ficha</button></div>
    </div>
  </article>`).join("");
  const loadMore = qs("#loadMore");
  if (loadMore) loadMore.style.display = slice.length < items.length ? "inline-block" : "none";
  const emptyMsg = qs("#emptyMsg");
  emptyMsg.hidden = items.length !== 0;
}

function computeFilters(){
  const f = new FormData(qs("#filtersForm"));
  const q = (f.get("q")||"").toString().toLowerCase();
  const edad = f.get("edad");
  const sexo = f.get("sexo");
  const tam = f.get("tamano");
  const estado = f.get("estado");
  const comps = qsa("input[name=compat]:checked").map(i=>i.value);
  const orden = f.get("orden") || "recientes";

  let res = allDogs.filter(d=>{
    const matchesQ = !q || [d.nombre, d.ciudad, ...(d.etiquetas||[])].join(" ").toLowerCase().includes(q);
    const matchesEdad = !edad || d.edad === edad;
    const matchesSexo = !sexo || d.sexo === sexo;
    const matchesTam = !tam || d.tamano === tam;
    const matchesEstado = !estado || d.estado === estado;
    const matchesComp = comps.length === 0 || comps.every(c=> (d.compatibilidad||[]).includes(c));
    return matchesQ && matchesEdad && matchesSexo && matchesTam && matchesComp && matchesEstado;
  });

  if (orden === "compatibilidad"){
    res.sort((a,b)=> (b.compatibilidad||[]).length - (a.compatibilidad||[]).length);
  } else {
    res.sort((a,b)=> (b.id||0) - (a.id||0));
  }
  filtered = res;
  page = 1;
  renderCards(filtered);
}

function openFicha(id){
  const d = allDogs.find(x=>x.id==id);
  if (!d) return;
  const m = qs("#dogModal");
  const c = qs("#dogModalContent");
  c.innerHTML = `<header>
    <h2 id="dogModalTitle" class="h3">${d.nombre}</h2>
  </header>
  <div class="grid grid-2">
    <div><img src="${d.foto}" alt="${d.nombre}"></div>
    <div>
      <p>${d.descripcion||"Descripción próximamente."}</p>
      <ul class="list">
        <li><strong>Edad:</strong> ${d.edad}</li>
        <li><strong>Sexo:</strong> ${d.sexo}</li>
        <li><strong>Tamaño:</strong> ${d.tamano}</li>
        <li><strong>Compatibilidad:</strong> ${(d.compatibilidad||[]).join(", ")||"N/D"}</li>
        <li><strong>Ciudad:</strong> ${d.ciudad}</li>
        <li><strong>Salud:</strong> ${(d.salud||"Chequeo al día")}</li>
        <li><strong>Vacunas:</strong> ${(d.vacunas||"Esquema básico")}</li>
        <li><strong>Notas:</strong> ${(d.notas||"Listo para conocer nueva familia")}</li>
      </ul>
    </div>
  </div>`;
  m.classList.add("open");
  m.setAttribute("aria-hidden", "false");
  on(m, "click", "[data-close]", ()=>{ m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape"){ m.classList.remove("open"); m.setAttribute("aria-hidden","true"); } }, { once:true });
}

(async function init(){
  allDogs = await getJSON("data/dogs.json", "dogs");
  computeFilters();

  const form = qs("#filtersForm");
  if (form){
    on(form, "input", null, debounce(computeFilters, 200));
    on(form, "reset", null, ()=>{ setTimeout(computeFilters, 0); });
  }

  const grid = qs("#dogsGrid");
  on(grid, "click", "[data-open=ficha]", (e, btn)=>{ openFicha(btn.dataset.id); });

  const loadMore = qs("#loadMore");
  if (loadMore){
    on(loadMore, "click", null, ()=>{ page++; renderCards(filtered); });
  }
})();
