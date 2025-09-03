/* Pitbull Community - pitbulls.js */
(() => {
	"use strict";
	const qs = (s, el = document) => el.querySelector(s);
	const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
	const debounce = (fn, wait = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; };

	async function getDogs() {
		const cacheKey = "dogs";
		try {
			const cached = sessionStorage.getItem(cacheKey);
			if (cached) return JSON.parse(cached);
			const res = await fetch("./data/dogs.json");
			const data = await res.json();
			sessionStorage.setItem(cacheKey, JSON.stringify(data));
			return data;
		} catch { return []; }
	}

	function matchFilters(d, f) {
		if (f.q) {
			const hay = `${d.nombre} ${d.ciudad} ${(d.etiquetas||[]).join(" ")}`.toLowerCase();
			if (!hay.includes(f.q)) return false;
		}
		if (f.edad && d.edad !== f.edad) return false;
		if (f.sexo && d.sexo !== f.sexo) return false;
		if (f.tamano && d.tamano !== f.tamano) return false;
		if (f.compat && !(d.compatibilidad||[]).includes(f.compat)) return false;
		if (f.estado && d.estado !== f.estado) return false;
		return true;
	}

	function sortDogs(arr, orden) {
		if (orden === "compatibilidad") {
			return arr.slice().sort((a, b) => (b.compatibilidad?.length||0) - (a.compatibilidad?.length||0));
		}
		// recientes: assume higher id is newer
		return arr.slice().sort((a, b) => (b.id||0) - (a.id||0));
	}

	function cardDog(d) {
		const translate = window.t || ((key) => key);
		const tags = (d.etiquetas||[]).slice(0,3).map(t => `<span class="tag">${t}</span>`).join(" ");
		return `
		<article class="card dog" role="listitem">
			<img src="${d.foto||"https://picsum.photos/seed/dog"+d.id+"/640/420"}" alt="${d.nombre}" loading="lazy" width="640" height="420">
			<div class="card-body">
				<h3>${d.nombre}</h3>
				<p class="muted">${d.ciudad || ""} · ${d.edad||""} · ${d.sexo||""} · ${d.tamano||""}</p>
				<div class="tags">${tags}</div>
				<div class="actions"><button class="btn btn-ghost" data-id="${d.id}" data-open-ficha type="button">${translate('view_profile')}</button></div>
			</div>
		</article>`;
	}

	function fichaHTML(d) {
		// Use the global translation function
		const translate = window.t || ((key) => key);
		
		// Health information - use real data if available, otherwise show placeholders
		const salud = d.salud || {};
		const saludHTML = `
			<h4>${translate('health')}</h4>
			<ul class="meta health-info">
				<li><strong>${translate('vaccines_up_to_date')}:</strong> ${salud.vacunas_al_dia || translate('pending_verification')}</li>
				<li><strong>${translate('dewormed')}:</strong> ${salud.desparasitado || translate('pending_verification')}</li>
				<li><strong>${translate('sterilized')}:</strong> ${salud.esterilizado || translate('pending_verification')}</li>
			</ul>
			${salud.notas ? `<p class="muted"><strong>${translate('notes')}:</strong> ${salud.notas}</p>` : ''}
		`;
		
		return `
			<div class="ficha">
				<div class="ficha-media"><img src="${d.foto||"https://picsum.photos/seed/dog"+d.id+"/960/640"}" alt="${d.nombre}"></div>
				<div class="ficha-body">
					<h3>${d.nombre}</h3>
					<p class="muted">${d.ciudad||""}</p>
					<ul class="meta">
						<li><strong>${translate('age')}:</strong> ${d.edad||""}</li>
						<li><strong>${translate('gender')}:</strong> ${d.sexo||""}</li>
						<li><strong>${translate('size')}:</strong> ${d.tamano||""}</li>
						<li><strong>${translate('compatibility')}:</strong> ${(d.compatibilidad||[]).join(", ")}</li>
					</ul>
					<p>${d.descripcion||translate('no_description_available')}</p>
					${saludHTML}
				</div>
			</div>`;
	}

	function setupModal() {
		const dlg = qs("#modal-ficha");
		const closeBtn = qs("#modal-ficha .icon-btn");
		if (!dlg) return { open: () => {} };
		closeBtn?.addEventListener("click", () => dlg.close());
		dlg.addEventListener("cancel", (e) => { e.preventDefault(); dlg.close(); });
		function open(d) { qs("#ficha-contenido").innerHTML = fichaHTML(d); dlg.showModal(); }
		return { open };
	}

	function readFilters() {
		const f = qs("#filtros");
		const fd = new FormData(f);
		return {
			q: (fd.get("q")||"").toString().trim().toLowerCase(),
			edad: fd.get("edad")||"",
			sexo: fd.get("sexo")||"",
			tamano: fd.get("tamano")||"",
			compat: fd.get("compat")||"",
			estado: fd.get("estado")||"",
			orden: fd.get("orden")||"recientes",
		};
	}

  window.App = Object.assign(window.App || {}, {
    async pitbulls() {
      // Initialize i18n first
      if (window.i18n) {
        await window.i18n.init();
      }
      
      // common
      (window.App.index||function(){})(); // reuse header behaviors

      const container = qs("#resultados");
      const btnMas = qs("#cargar-mas");
      const empty = qs("#sin-resultados");
      const modal = setupModal();
      const all = await getDogs();
      let filtered = [];
      let page = 0; const pageSize = 9;			function renderPage(reset = false) {
				if (reset) { container.innerHTML = ""; page = 0; }
				const start = page * pageSize;
				const slice = filtered.slice(start, start + pageSize);
				container.insertAdjacentHTML("beforeend", slice.map(cardDog).join(""));
				page++;
				btnMas.hidden = page * pageSize >= filtered.length;
				empty.hidden = filtered.length > 0;
				// bind ficha buttons
				qsa('[data-open-ficha]')
					.forEach(b => b.onclick = () => { const id = Number(b.getAttribute("data-id")); const d = filtered.find(x => x.id === id); if (d) modal.open(d); });
			}

			function apply() {
				const f = readFilters();
				filtered = sortDogs(all.filter(d => matchFilters(d, f)), f.orden);
				renderPage(true);
			}

			qs("#filtros")?.addEventListener("input", debounce(apply, 120));
			btnMas?.addEventListener("click", () => renderPage(false));

			apply();
		}
	});
})();
