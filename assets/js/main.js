// Pitbull Community - JS global
// Utilidades
export const qs = (s, el=document) => el.querySelector(s);
export const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
export const on = (el, evt, sel, cb) => {
  el.addEventListener(evt, e => {
    const target = sel ? e.target.closest(sel) : e.target;
    if (!sel || (target && el.contains(target))) cb(e, target);
  });
};
export const debounce = (fn, wait=250) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
};

// Tema
const themeBtn = qs("#themeToggle");
const storedTheme = localStorage.getItem("theme");
const setTheme = (mode) => {
  document.documentElement.dataset.theme = mode;
  localStorage.setItem("theme", mode);
};
if (storedTheme) setTheme(storedTheme);
if (themeBtn) on(themeBtn, "click", null, () => {
  const current = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(current === "dark" ? "light" : "dark");
});

// Menú móvil
const navToggle = qs(".nav-toggle");
const navMenu = qs("#nav-menu");
if (navToggle && navMenu) {
  on(navToggle, "click", null, () => {
    const open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

// Toasts
export function toast(msg) {
  const wrap = qs("#toasts"); if (!wrap) return;
  const t = document.createElement("div");
  t.className = "toast"; t.role = "status"; t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(()=>{ t.remove(); }, 3000);
}

// Reveal on scroll
const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduced) {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.2 });
  qsa(".reveal").forEach(el=>io.observe(el));
}

// Nav activa
(function markActive(){
  const path = location.pathname.split("/").pop() || "index.html";
  qsa(".nav-menu a").forEach(a=>{
    if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
  });
})();

// Footer year
const y = qs("#year"); if (y) y.textContent = String(new Date().getFullYear());

// Cache & fetch helpers
const cacheKey = (k)=>`pc_${k}`;
export async function getJSON(url, key){
  try {
    const fromCache = sessionStorage.getItem(cacheKey(key||url));
    if (fromCache) return JSON.parse(fromCache);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al cargar datos");
    const data = await res.json();
    sessionStorage.setItem(cacheKey(key||url), JSON.stringify(data));
    return data;
  } catch (err) {
    console.error(err);
    toast("No se pudieron cargar los datos");
    return [];
  }
}

// Home destacados (3 items cada uno)
(async function homeHighlights(){
  const dogsEl = qs("#homeDogs");
  const comEl = qs("#homeComunidades");
  const lugEl = qs("#homeLugares");
  if (!dogsEl && !comEl && !lugEl) return;
  const [dogs, comunidades, lugares] = await Promise.all([
    getJSON("data/dogs.json", "dogs"),
    getJSON("data/comunidades.json", "comunidades"),
    getJSON("data/lugares.json", "lugares")
  ]);
  const cardDog = (d)=>`<article class="card lift">
    <img src="${d.foto}" alt="${d.nombre}" loading="lazy">
    <div class="mt-8">
      <h3 class="card-title">${d.nombre}</h3>
      <p class="muted">${d.edad} • ${d.sexo} • ${d.tamano}</p>
    </div>
  </article>`;
  const cardCom = (c)=>`<article class="card lift">
    <h3 class="card-title">${c.nombre}</h3>
    <p class="muted">${c.ciudad} • ${c.enfoque}</p>
  </article>`;
  const cardLug = (l)=>`<article class="card lift">
    <h3 class="card-title">${l.nombre}</h3>
    <p class="muted">${l.ciudad} • ${l.tipo}</p>
  </article>`;
  if (dogsEl) dogsEl.innerHTML = dogs.slice(0,3).map(cardDog).join("");
  if (comEl) comEl.innerHTML = comunidades.slice(0,3).map(cardCom).join("");
  if (lugEl) lugEl.innerHTML = lugares.slice(0,3).map(cardLug).join("");
})();

// Newsletter (mock)
const newsForm = qs("#newsletterForm");
if (newsForm) {
  on(newsForm, "submit", null, (e)=>{
    e.preventDefault();
    const email = new FormData(newsForm).get("email");
    const msg = qs("#newsMsg"); if (msg) msg.textContent = email ? "¡Gracias por suscribirte!" : "Por favor ingresa un correo válido";
    toast("Suscripción registrada");
    newsForm.reset();
  });
}
