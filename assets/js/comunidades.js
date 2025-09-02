import { qs, qsa, on, debounce, getJSON } from "./main.js";

let comunidades = [];

function render(items){
  const grid = qs("#comunidadesGrid");
  grid.innerHTML = items.map(c=>`<article class="card lift" data-id="${c.id}">
    <h3 class="card-title">${c.nombre}</h3>
    <p class="muted">${c.ciudad} • ${c.enfoque}</p>
    <div class="mt-8">
      <a class="btn" href="?id=${c.id}">Detalle</a>
      ${c.instagram?`<a class="icon-btn" href="${c.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><i class="ri-instagram-line"></i></a>`:""}
      ${c.email?`<a class="icon-btn" href="mailto:${c.email}" aria-label="Email"><i class="ri-mail-line"></i></a>`:""}
    </div>
  </article>`).join("");
  qs("#comEmpty").hidden = items.length !== 0;
}

function compute(){
  const f = new FormData(qs("#comunidadesForm"));
  const q = (f.get("q")||"").toString().toLowerCase();
  const ciudad = f.get("ciudad");
  const enfoque = f.get("enfoque");
  const list = comunidades.filter(c=>{
    const mq = !q || [c.nombre, c.ciudad].join(" ").toLowerCase().includes(q);
    const mc = !ciudad || c.ciudad === ciudad;
    const me = !enfoque || c.enfoque === enfoque;
    return mq && mc && me;
  });
  render(list);
}

function fillSelects(){
  const ciudadSel = qs("#ciudad");
  const ciudades = Array.from(new Set(comunidades.map(c=>c.ciudad))).sort();
  ciudades.forEach(ci=>{
    const opt = document.createElement("option"); opt.value = ci; opt.textContent = ci; ciudadSel.appendChild(opt);
  });
}

function tryOpenDetailFromQuery(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;
  const c = comunidades.find(x=> String(x.id) === id);
  if (!c) return;
  const modal = qs("#comModal");
  const content = qs("#comModalContent");
  content.innerHTML = `<header><h2 id="comModalTitle" class="h3">${c.nombre}</h2></header>
  <p class="muted">${c.ciudad} • ${c.enfoque}</p>
  <p>${c.descripcion||"Descripción próximamente."}</p>
  <p><strong>Contacto:</strong> ${c.email||"-"} ${c.instagram?`• <a href="${c.instagram}" target="_blank" rel="noopener">Instagram</a>`:""}</p>`;
  modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
  on(modal, "click", "[data-close]", ()=>{ modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); history.replaceState({}, document.title, location.pathname); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape"){ modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); history.replaceState({}, document.title, location.pathname); } }, { once:true });
}

(async function init(){
  comunidades = await getJSON("data/comunidades.json", "comunidades");
  fillSelects();
  compute();

  const form = qs("#comunidadesForm");
  on(form, "input", null, debounce(compute, 200));
  on(form, "reset", null, ()=> setTimeout(compute, 0));

  tryOpenDetailFromQuery();
})();
