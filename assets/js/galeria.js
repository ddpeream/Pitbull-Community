/* Pitbull Community - galeria.js */
(() => {
	"use strict";
	const qs = (s, el = document) => el.querySelector(s);
	const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

	function makeMock() {
		const tags = ["adopciones","entrenamiento","comunidad","eventos"];
		return Array.from({ length: 24 }, (_, i) => {
			const t = tags[i % tags.length];
			const w = 400 + (i % 3) * 80; const h = 300 + (i % 4) * 60;
			return { id: i+1, tag: t, src: `https://picsum.photos/seed/pb${i+1}/${w}/${h}`, cap: `Foto ${i+1} · ${t}` };
		});
	}

	function renderGallery(items) {
		const m = qs("#masonry");
		m.innerHTML = items.map(it => `
			<figure>
				<img src="${it.src}" alt="${it.cap}" loading="lazy" data-id="${it.id}" data-cap="${it.cap}">
			</figure>`).join("");
		qsa("img", m).forEach(img => img.onclick = () => openLightbox(Number(img.dataset.id), items));
	}

	function openLightbox(id, items) {
		const idx = items.findIndex(x => x.id === id);
		if (idx === -1) return;
		const lb = qs("#lightbox"); const img = qs("#lb-img"); const cap = qs("#lb-cap");
		function show(i) { const it = items[i]; img.src = it.src; img.alt = it.cap; cap.textContent = it.cap; lb.dataset.idx = String(i); }
		function prev() { const i = Number(lb.dataset.idx||"0"); show((i - 1 + items.length) % items.length); }
		function next() { const i = Number(lb.dataset.idx||"0"); show((i + 1) % items.length); }
		qs("#lb-close").onclick = () => { lb.hidden = true; document.removeEventListener("keydown", onKey); };
		qs("#lb-prev").onclick = prev; qs("#lb-next").onclick = next;
		function onKey(e) { if (e.key === "Escape") { lb.hidden = true; document.removeEventListener("keydown", onKey); } if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); }
		document.addEventListener("keydown", onKey);
		lb.hidden = false; show(idx);
	}

	window.App = Object.assign(window.App || {}, {
		galeria() {
			(window.App.index||function(){})();
			const all = makeMock();
			const sel = qs("#tag");
			function apply() { const tag = sel?.value || ""; const arr = tag ? all.filter(x => x.tag === tag) : all; renderGallery(arr); }
			sel?.addEventListener("change", apply);
			apply();
		}
	});
})();
