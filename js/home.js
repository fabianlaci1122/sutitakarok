/* Sütit akarok! – főoldal: termékrács, szűrők, adventi naptár, egyedi rendelés, nyitvatartás */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => SA.esc(s);
  const DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
  let cat = "all";
  const picked = {}; // termékenként kiválasztott változat

  // ---------- termékrács ----------
  function placeholder(p) {
    return `<div class="ph" aria-hidden="true"><span>${esc(p.name)}</span><small>Fotó hamarosan</small></div>`;
  }

  function card(p) {
    const v = picked[p.id] || 0;
    const variants = p.variants.length > 1
      ? `<div class="vars" role="radiogroup" aria-label="${esc(p.name)} mérete">${p.variants.map((x, i) =>
          `<button type="button" role="radio" aria-checked="${i === v}" class="var${i === v ? " is-on" : ""}" data-var="${p.id}:${i}">${esc(x.label)}</button>`).join("")}</div>`
      : `<p class="vars vars--single">${esc(p.variants[0].label)}</p>`;
    const lead = p.lead >= 2 ? `${p.lead} nappal előre` : p.lead === 1 ? "Előző napig rendeld" : "Akár aznapra";
    return `<article class="prod" data-id="${p.id}">
      <div class="prod__media">
        ${p.img ? `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy" width="640" height="640">` : placeholder(p)}
        ${p.badge ? `<span class="prod__badge">${esc(p.badge)}</span>` : ""}
      </div>
      <div class="prod__body">
        <div class="prod__top"><h3>${esc(p.name)}</h3><span class="prod__lead">${lead}</span></div>
        <p class="prod__desc">${esc(p.desc)}</p>
        ${variants}
        <div class="prod__foot">
          <span class="price" data-price>${SA.ft(p.variants[v].price)}</span>
          <button class="btn btn--primary btn--sm" type="button" data-add="${p.id}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Kosárba
          </button>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = SA.PRODUCTS.filter((p) => cat === "all" || p.cat === cat);
    $("#grid").innerHTML = list.map(card).join("");
  }

  function renderChips() {
    $("#chips").innerHTML = SA.CATS.map((c) => {
      const n = c.id === "all" ? SA.PRODUCTS.length : SA.PRODUCTS.filter((p) => p.cat === c.id).length;
      return `<button type="button" role="tab" class="chip${c.id === cat ? " is-on" : ""}" aria-selected="${c.id === cat}" data-cat="${c.id}">${esc(c.label)} <span>${n}</span></button>`;
    }).join("");
  }

  document.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-cat]");
    if (chip) { cat = chip.dataset.cat; renderChips(); renderGrid(); return; }

    const vb = e.target.closest("[data-var]");
    if (vb) {
      const [id, i] = vb.dataset.var.split(":");
      picked[id] = +i;
      const art = vb.closest(".prod");
      art.querySelectorAll(".var").forEach((b, k) => { b.classList.toggle("is-on", k === +i); b.setAttribute("aria-checked", String(k === +i)); });
      art.querySelector("[data-price]").textContent = SA.ft(SA.byId(id).variants[+i].price);
      return;
    }

    const add = e.target.closest("[data-add]");
    if (add) {
      const p = SA.byId(add.dataset.add);
      const v = picked[p.id] || 0;
      SA.cart.add(p.id, v, 1);
      add.classList.add("is-added");
      setTimeout(() => add.classList.remove("is-added"), 900);
      SA.toast(`<strong>${esc(p.name)}</strong> (${esc(p.variants[v].label)}) a kosárban. <a href="kosar.html">Kosár megnyitása →</a>`);
    }
  });

  // ---------- adventi naptár illusztráció ----------
  function renderCalendar() {
    const now = new Date();
    const today = now.getMonth() === 11 && now.getDate() <= 24 ? now.getDate() : 0;
    const order = [7, 18, 3, 12, 22, 1, 15, 9, 20, 5, 24, 11, 2, 17, 8, 23, 14, 4, 19, 10, 6, 21, 13, 16];
    $("#cal-grid").innerHTML = order.map((n) => `<span${n === today ? ' class="is-today"' : ""}>${n}</span>`).join("");
  }

  // ---------- nyitvatartás ----------
  function renderHours() {
    const now = new Date(), d = now.getDay();
    const H = SA.CONFIG.HOURS;
    $("#hours").innerHTML = "<tbody>" + [1, 2, 3, 4, 5, 6, 0].map((x) =>
      `<tr${x === d ? ' class="is-today"' : ""}><td>${DAY_NAMES[x]}</td><td>${H[x][0]}:00 – ${H[x][1]}:00</td></tr>`).join("") + "</tbody>";
    const [o, c] = H[d];
    const m = now.getHours() * 60 + now.getMinutes();
    const open = m >= o * 60 && m < c * 60;
    const el = $("#open-now");
    el.textContent = open ? `Most nyitva, ${c}:00-ig` : (m < o * 60 ? `Ma ${o}:00-kor nyitunk` : "Most zárva");
    el.closest(".float").classList.toggle("is-open", open);
  }

  // ---------- egyedi rendelés (mailto vagy CRM) ----------
  const QTY = {
    "Torta": { label: "Hány szelet?", opts: ["8 szelet", "12 szelet", "16 szelet", "20 szelet", "24 szelet", "30 vagy több szelet"] },
    "Esküvői torta": { label: "Hány vendég?", opts: ["30–60 fő", "60–100 fő", "100–150 fő", "150 fő felett"] },
    "Desszertasztal": { label: "Hány vendég?", opts: ["20–40 fő", "40–80 fő", "80–120 fő", "120 fő felett"] },
  };
  function setupCustom() {
    const form = $("#custom-form");
    const qty = $("#c-qty"), label = $("#c-qty-label"), date = $("#c-date"), err = $("#c-err");
    const min = new Date(); min.setDate(min.getDate() + 3); // TODO: átfutási idő egyeztetése
    date.min = SA.iso(min);
    const sync = () => { const q = QTY[form.tipus.value]; label.textContent = q.label; qty.innerHTML = q.opts.map((o) => `<option>${o}</option>`).join(""); };
    form.addEventListener("change", (e) => { if (e.target.name === "tipus") sync(); });
    sync();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.querySelectorAll(".is-invalid").forEach((x) => { x.classList.remove("is-invalid"); x.removeAttribute("aria-invalid"); });
      const bad = [];
      if (!form.nev.value.trim()) bad.push(form.nev);
      if (!/^[+\d][\d\s/-]{7,}$/.test(form.telefon.value.trim())) bad.push(form.telefon);
      if (!form.datum.value || form.datum.value < date.min) bad.push(form.datum);
      if (form.email.value && !form.email.checkValidity()) bad.push(form.email);
      if (bad.length) {
        bad.forEach((x) => { x.classList.add("is-invalid"); x.setAttribute("aria-invalid", "true"); });
        bad[0].focus();
        err.textContent = `Add meg a nevet, egy érvényes telefonszámot és a dátumot (legkorábban ${date.min.replaceAll("-", ". ")}.).`;
        return;
      }
      err.textContent = "";
      const f = Object.fromEntries(new FormData(form));
      const sent = await SA.send({ type: "egyedi_ajanlatkeres", ...f },
        `${f.tipus} – ajánlatkérés (${f.datum})`,
        [`Típus: ${f.tipus}`, `Dátum: ${f.datum}`, `Mennyiség: ${f.mennyiseg}`, `Mentesség: ${f.mentes}`, "", "Ízek, felirat, ötletek:", f.uzenet || "-", "", `Név: ${f.nev}`, `Telefon: ${f.telefon}`, `E-mail: ${f.email || "-"}`].join("\n"));
      let ok = form.querySelector(".form__ok");
      if (!ok) { ok = document.createElement("p"); ok.className = "form__ok"; ok.setAttribute("role", "status"); form.appendChild(ok); }
      ok.textContent = sent === "crm"
        ? "Köszönjük! Megkaptuk az ajánlatkérést, hamarosan jelentkezünk."
        : "Megnyitottuk a levelet az e-mail-programodban. Küldd el, és hamarosan jelentkezünk az árral.";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderChips();
    renderGrid();
    renderCalendar();
    renderHours();
    setupCustom();
  });
})();
