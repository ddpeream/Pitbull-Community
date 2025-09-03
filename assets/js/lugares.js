/* Pitbull Community - lugares.js */
(() => {
	"use strict";
	const qs = (s, el = document) => el.querySelector(s);
	const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
	const debounce = (fn, wait = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; };

	async function getLugares() {
		const k = "lugares";
		try { const c = sessionStorage.getItem(k); if (c) return JSON.parse(c); const r = await fetch("./data/lugares.json"); const d = await r.json(); sessionStorage.setItem(k, JSON.stringify(d)); return d; } catch { return []; }
	}

	function item(l) {
		return `<li class="item" role="listitem">
			<button class="item-btn" data-id="${l.id}" type="button">
				<span class="t">${l.nombre}</span>
				<span class="m muted">${l.tipo||""} · ${l.ciudad||""}</span>
			</button>
		</li>`;
	}

	function ensureLeafletLoaded() {
		return new Promise((resolve, reject) => {
			if (window.L && window.L.map) return resolve(window.L);
			const css = document.createElement("link"); css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; css.integrity = ""; css.crossOrigin = "";
			const js = document.createElement("script"); js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; js.defer = true;
			js.onload = () => resolve(window.L);
			js.onerror = reject;
			document.head.appendChild(css); document.head.appendChild(js);
		});
	}

	function readFilters() {
		const f = qs("#filtros-lug"); const fd = new FormData(f);
		return { q: (fd.get("q")||"").toString().trim().toLowerCase(), tipo: fd.get("tipo")||"", ciudad: fd.get("ciudad")||"" };
	}

	window.App = Object.assign(window.App || {}, {
		async lugares() {
			(window.App.index||function(){})();
			const list = qs("#lista-lugares"); const empty = qs("#sin-lugares");
			const btnMapa = qs("#abrir-mapa"); const mapEl = qs("#map");
			const all = await getLugares();

			// ciudades select
			const ciudadSel = qs("#ciudad"); const ciudades = Array.from(new Set(all.map(l => l.ciudad).filter(Boolean))).sort();
			if (ciudadSel) ciudadSel.innerHTML = `<option value="">Todas</option>` + ciudades.map(c => `<option value="${c}">${c}</option>`).join("");

			let current = all.slice();
			let map, markers = new Map();

			function apply() {
				const f = readFilters();
				current = all.filter(l => {
					if (f.q) { const hay = `${l.nombre} ${l.ciudad} ${l.tipo}`.toLowerCase(); if (!hay.includes(f.q)) return false; }
					if (f.tipo && l.tipo !== f.tipo) return false;
					if (f.ciudad && l.ciudad !== f.ciudad) return false;
					return true;
				});
				list.innerHTML = current.map(item).join("");
				empty.hidden = current.length > 0;
				bindListClicks();
				if (map) syncMarkers();
			}

			function bindListClicks() {
				qsa(".item-btn", list).forEach(btn => btn.onclick = async () => {
					const id = Number(btn.getAttribute("data-id"));
					const l = current.find(x => x.id === id); if (!l) return;
					await openMap();
					const m = markers.get(id);
					if (m) { m.openPopup(); map.setView([l.lat, l.lng], 14, { animate: !matchMedia("(prefers-reduced-motion: reduce)").matches }); }
				});
			}

			function syncMarkers() {
				// clear existing
				markers.forEach(m => m.remove()); markers.clear();
				current.forEach(l => {
					const m = L.marker([l.lat, l.lng]).addTo(map).bindPopup(`<strong>${l.nombre}</strong><br>${l.tipo||""} · ${l.ciudad||""}`);
					markers.set(l.id, m);
				});
			}

			async function openMap() {
				if (mapEl.getAttribute("data-loaded") === "true") return map;
				await ensureLeafletLoaded();
				map = L.map("map").setView([6.2442, -75.5812], 12); // Medellín aprox
				L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' }).addTo(map);
				mapEl.setAttribute("data-loaded", "true");
				syncMarkers();
				return map;
			}

			btnMapa?.addEventListener("click", openMap);
			qs("#filtros-lug")?.addEventListener("input", debounce(apply, 120));
			apply();
		}
	});
})();
