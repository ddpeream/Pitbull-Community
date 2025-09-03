/* Pitbull Community - comunidades.js */
(() => {
	"use strict";
	const qs = (s, el = document) => el.querySelector(s);
	const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
	const debounce = (fn, wait = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; };

	async function getComunidades() {
		const k = "comunidades";
		try {
			const c = sessionStorage.getItem(k); if (c) return JSON.parse(c);
			const r = await fetch("./data/comunidades.json"); const d = await r.json(); sessionStorage.setItem(k, JSON.stringify(d)); return d;
		} catch { return []; }
	}

	function card(c) {
		return `
		<article class="card" role="listitem">
			<div class="card-body">
				<h3>${c.nombre}</h3>
				<p class="muted">${c.ciudad||""} · ${c.enfoque||""}</p>
				<div class="actions">
					<a class="btn btn-ghost" href="?id=${c.id}" data-id="${c.id}" data-open-com type="button">Ver detalle</a>
				</div>
			</div>
		</article>`;
	}

	function detalle(c) {
		return `
			<div class="com-detalle">
				<h3>${c.nombre}</h3>
				<p>${c.descripcion||"Organización de ejemplo enfocada en bienestar."}</p>
				<ul class="meta">
					<li><strong>Ciudad:</strong> ${c.ciudad||""}</li>
					<li><strong>Enfoque:</strong> ${c.enfoque||""}</li>
					<li><strong>Contacto:</strong> <a href="mailto:${c.email||"contacto@example.com"}">${c.email||"contacto@example.com"}</a></li>
					<li><strong>Instagram:</strong> <a href="https://instagram.com/${(c.ig||"pitbullcommunity").replace(/^@/, "")}" target="_blank" rel="noopener">${c.ig||"@pitbullcommunity"}</a></li>
				</ul>
			</div>`;
	}

	function modalSetup() {
		const dlg = qs("#modal-comunidad");
		const btn = qs("#modal-comunidad [data-close]");
		if (!dlg) return { open: () => {} };
		btn?.addEventListener("click", () => dlg.close());
		function open(c) { qs("#com-contenido").innerHTML = detalle(c); dlg.showModal(); }
		return { open };
	}

	function readFilters() {
		const f = qs("#filtros-com"); if (!f) return {};
		const fd = new FormData(f);
		return { q: (fd.get("q")||"").toString().trim().toLowerCase(), ciudad: fd.get("ciudad")||"", enfoque: fd.get("enfoque")||"" };
	}

	window.App = Object.assign(window.App || {}, {
		async comunidades() {
			(window.App.index||function(){})();
			const grid = qs("#grid-comunidades");
			const empty = qs("#sin-comunidades");
			const modal = modalSetup();
			const all = await getComunidades();

			// ciudades select
			const ciudades = Array.from(new Set(all.map(c => c.ciudad).filter(Boolean))).sort();
			const ciudadSel = qs("#ciudad");
			if (ciudadSel) ciudadSel.innerHTML = `<option value="">Todas</option>` + ciudades.map(c => `<option value="${c}">${c}</option>`).join("");

			function apply() {
				const f = readFilters();
				let arr = all.filter(c => {
					if (f.q) {
						const hay = `${c.nombre} ${c.ciudad} ${c.ig}`.toLowerCase();
						if (!hay.includes(f.q)) return false;
					}
					if (f.ciudad && c.ciudad !== f.ciudad) return false;
					if (f.enfoque && c.enfoque !== f.enfoque) return false;
					return true;
				});
				grid.innerHTML = arr.map(card).join("");
				empty.hidden = arr.length > 0;
				qsa('[data-open-com]')
					.forEach(a => a.onclick = (ev) => { ev.preventDefault(); const id = Number(a.getAttribute("data-id")); const c = all.find(x => x.id === id); if (c) modal.open(c); });
			}

			qs("#filtros-com")?.addEventListener("input", debounce(apply, 120));
			apply();
		}
	});
})();
