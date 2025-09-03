/* Pitbull Community - main.js (ES2020+) */
(() => {
	"use strict";

	const qs = (s, el = document) => el.querySelector(s);
	const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
	const debounce = (fn, wait = 200) => {
		let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), wait); };
	};

	const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// Mobile nav
	function setupNav() {
		const btn = qs(".nav-toggle");
		const nav = qs("#nav");
		if (!btn || !nav) return;
		btn.addEventListener("click", () => {
			const open = nav.classList.toggle("open");
			btn.setAttribute("aria-expanded", String(open));
		});
		// Close on link click (mobile)
		qsa(".site-nav a").forEach(a => a.addEventListener("click", () => {
			nav.classList.remove("open");
			btn.setAttribute("aria-expanded", "false");
		}));
	}

	// Active link highlight based on location
	function highlightActive() {
		const path = location.pathname.split("/").pop() || "index.html";
		qsa(".site-nav a").forEach(a => {
			const isActive = a.getAttribute("href") === `./${path}` || a.getAttribute("href") === path;
			if (isActive) a.setAttribute("aria-current", "page");
			else a.removeAttribute("aria-current");
		});
	}

	// Theme init (auto by OS, optional future toggle)
	function setupTheme() { /* Placeholder: using prefers-color-scheme only */ }

	// Intersection reveal
	function setupReveal() {
		const els = qsa(".reveal");
		if (!els.length || prefersReduced) return;
		const io = new IntersectionObserver((entries) => {
			for (const e of entries) if (e.isIntersecting) e.target.classList.add("is-visible");
		}, { threshold: 0.15 });
		els.forEach(el => io.observe(el));
	}

	// Toasts minimal
	function toast(msg = "Hecho", timeout = 2400) {
		const t = document.createElement("div");
		t.className = "toast";
		t.textContent = msg;
		Object.assign(t.style, {
			position: "fixed", insetInline: "auto 1rem", bottom: "1rem", background: "#111827",
			color: "#fff", padding: ".5rem .75rem", borderRadius: ".5rem", boxShadow: "0 6px 16px rgba(0,0,0,.3)", zIndex: 100
		});
		document.body.appendChild(t);
		setTimeout(() => t.remove(), timeout);
	}

	// Newsletter dummy
	function setupNewsletter() {
		const form = qs("#newsletter-form");
		if (!form) return;
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const email = new FormData(form).get("email");
			if (!String(email).includes("@")) { toast("Por favor ingresa un correo válido"); return; }
			toast("Gracias por suscribirte ✨");
			form.reset();
		});
	}

	// Featured sections on index: use data caches if available
	async function loadJSON(url, cacheKey) {
		try {
			const cached = sessionStorage.getItem(cacheKey);
			if (cached) return JSON.parse(cached);
			const res = await fetch(url, { headers: { "Accept": "application/json" } });
			if (!res.ok) throw new Error("Error al cargar datos");
			const data = await res.json();
			sessionStorage.setItem(cacheKey, JSON.stringify(data));
			return data;
		} catch (err) {
			console.error(err);
			return [];
		}
	}

	function cardSmall({ nombre = "", ciudad = "", foto = "", descripcion = "" }) {
		const imgSrc = foto || "https://picsum.photos/seed/pitbull/480/320";
		return `
			<article class="card" role="listitem">
				<img src="${imgSrc}" alt="${nombre}" loading="lazy" width="480" height="320">
				<div class="card-body">
					<h3>${nombre}</h3>
					<p class="muted">${ciudad || descripcion || ""}</p>
				</div>
			</article>`;
	}

	async function populateHomeFeatured() {
		const perrosEl = qs("#destacados-perros");
		const comEl = qs("#destacados-comunidades");
		const lugEl = qs("#destacados-lugares");
		if (!perrosEl || !comEl || !lugEl) return;
		const [dogs, comunidades, lugares] = await Promise.all([
			loadJSON("./data/dogs.json", "dogs"),
			loadJSON("./data/comunidades.json", "comunidades"),
			loadJSON("./data/lugares.json", "lugares")
		]);
		perrosEl.innerHTML = (dogs.slice(0, 3).map(cardSmall).join("")) || "";
		comEl.innerHTML = (comunidades.slice(0, 3).map(c => cardSmall({ nombre: c.nombre, ciudad: c.ciudad, foto: c.foto, descripcion: c.enfoque })).join("")) || "";
		lugEl.innerHTML = (lugares.slice(0, 3).map(l => cardSmall({ nombre: l.nombre, ciudad: l.ciudad, foto: l.foto, descripcion: l.tipo })).join("")) || "";
	}

	function footerYear() {
		const y = qs("#year"); if (y) y.textContent = new Date().getFullYear();
	}

	window.App = Object.assign(window.App || {}, {
		index() { setupNav(); highlightActive(); setupTheme(); setupReveal(); setupNewsletter(); populateHomeFeatured(); footerYear(); },
	});
})();
