import { qs, qsa, on, debounce, toast } from "./main.js";

// Mock simple en memoria para galería; podría migrarse a /data si se desea
const photos = Array.from({length: 24}).map((_,i)=>({
  id: i+1,
  src: `https://picsum.photos/seed/pit${i}/800/600`,
  w: 800, h: 600,
  caption: `Foto ${i+1} — momento bacano con la manada`,
  tag: ["adopciones","entrenamiento","comunidad","eventos"][i%4]
}));

const storiesData = [
  { id:1, title:"Amistad sin rótulos", tag:"adopciones" },
  { id:2, title:"Primer paseo con correa corta", tag:"entrenamiento" },
  { id:3, title:"Jornada de socialización en Laureles", tag:"comunidad" },
  { id:4, title:"Clínica gratuita de bienestar", tag:"eventos" },
];

let current = 0;

function render(tag){
  const grid = qs("#masonry");
  const items = photos.filter(p=> !tag || p.tag===tag);
  grid.innerHTML = items.map(p=>`<figure class="masonry-item lift" data-id="${p.id}">
    <img src="${p.src}" alt="Foto de pitbull" loading="lazy">
    <figcaption class="muted" style="padding:6px 8px">${p.caption}</figcaption>
  </figure>`).join("");
  const st = qs("#stories");
  st.innerHTML = storiesData.filter(s=> !tag || s.tag===tag).map(s=>`<li>${s.title} <span class="badge">${s.tag}</span></li>`).join("");
}

function openLightbox(index, items){
  const lb = qs("#lightbox");
  const img = qs("#lightboxImg");
  const cap = qs("#lightboxCap");
  const list = items;
  const set = (i)=>{ current = i; img.src = list[i].src; cap.textContent = list[i].caption; };
  set(index);
  lb.classList.add("open"); lb.setAttribute("aria-hidden","false");
  const prev = qs(".lightbox-prev"), next = qs(".lightbox-next");
  on(prev, "click", null, ()=> set((current-1+list.length)%list.length));
  on(next, "click", null, ()=> set((current+1)%list.length));
  on(lb, "click", "[data-close]", ()=>{ lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); });
  document.addEventListener("keydown", (e)=>{
    if (e.key==="Escape"){ lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); }
    if (e.key==="ArrowRight"){ next.click(); }
    if (e.key==="ArrowLeft"){ prev.click(); }
  }, { once:true });
}

(function init(){
  const sel = qs("#tag");
  render("");
  on(sel, "change", null, ()=> render(sel.value));
  on(qs("#masonry"), "click", ".masonry-item", (e, fig)=>{
    const tag = qs("#tag").value;
    const items = photos.filter(p=> !tag || p.tag===tag);
    const idx = items.findIndex(p=> String(p.id) === fig.dataset.id);
    openLightbox(idx, items);
  });
})();
