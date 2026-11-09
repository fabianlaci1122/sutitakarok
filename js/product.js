/* Sütit akarok! – termékoldal (termek.html?id=...) */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const esc = SA.esc, C = SA.CONFIG;
  const p = SA.byId(new URLSearchParams(location.search).get("id"));

  if (!p) {
    document.title = "A termék nem található – Sütit akarok!";
    $("#pdp").innerHTML = `<div class="notfound"><p class="label label--plain">404</p><h1 class="d2">Ezt a sütit nem találjuk</h1><p class="lead" style="margin:20px auto 32px">Lehet, hogy elfogyott, vagy rossz linkre kattintottál.</p><a class="btn btn--primary btn--lg" href="webshop.html">Vissza a webshopba</a></div>`;
    return;
  }

  const cat = SA.CATS.find((c) => c.id === p.cat);
  const frozen = p.cat === "fagyi";
  let v = 0, qty = 1;
  document.title = `${p.name} – Sütit akarok!`;
  document.querySelector('meta[name="description"]').setAttribute("content", `${p.name}: ${p.desc} Rendeld meg online a Sütit akarok! cukrászdától.`);

  const ICON = {
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  };

  $("#pdp").innerHTML = `
    <nav class="crumbs" aria-label="Morzsamenü" style="padding-top:36px"><a href="index.html">Főoldal</a><span aria-hidden="true">/</span><a href="webshop.html">Webshop</a><span aria-hidden="true">/</span><a href="webshop.html?cat=${p.cat}">${esc(cat.label)}</a><span aria-hidden="true">/</span><span>${esc(p.name)}</span></nav>
    <div class="pdp">
      <div class="pdp__media">
        <div class="pdp__img">${p.img ? `<img src="${p.img}" alt="${esc(p.name)}" width="640" height="640">` : SA.ph(p)}</div>
      </div>
      <div class="pdp__info">
        <p class="label">${esc(cat.label)}${p.badge ? ` · ${esc(p.badge)}` : ""}</p>
        <h1>${esc(p.name)}</h1>
        <div class="pdp__price"><b id="price"></b><span id="price-note"></span></div>
        <p class="pdp__desc">${esc(p.long || p.desc)}</p>

        ${p.variants.length > 1 ? `
        <p class="opt-title" id="v-title">Válassz méretet <span id="v-label"></span></p>
        <div class="vpills" role="radiogroup" aria-labelledby="v-title">
          ${p.variants.map((x, i) => `<button type="button" role="radio" class="vpill" data-v="${i}" aria-checked="${i === 0}"><b>${esc(x.label)}</b><small>${SA.ft(x.price)}</small></button>`).join("")}
        </div>` : ""}

        <p class="opt-title">Mennyiség</p>
        <div class="buy">
          <div class="qty" role="group" aria-label="Mennyiség">
            <button type="button" data-q="-1" aria-label="Eggyel kevesebb">−</button><output id="qty" aria-live="polite">1</output><button type="button" data-q="1" aria-label="Eggyel több">+</button>
          </div>
          <button class="btn btn--primary btn--lg" type="button" id="add" data-add="${p.id}" data-v="0" data-qty="1">Kosárba · <span id="add-total"></span></button>
        </div>
        <p class="pdp__alt">Felirat, más méret vagy mentes változat kellene? <a href="egyedi-torta.html">Kérj egyedi ajánlatot</a></p>

        <div class="facts">
          <div>${ICON.clock}<b>Elkészítés</b><span>${esc(SA.leadText(p))}</span></div>
          <div>${ICON.pin}<b>Átvétel</b><span>Frankel Leó út 72., ingyenes</span></div>
          <div>${ICON.truck}<b>Kiszállítás</b><span>${frozen ? "Fagyinál nem elérhető" : `Budapesten, ${SA.ft(C.FREE_DELIVERY_FROM)} felett ingyen`}</span></div>
        </div>

        <div class="acc">
          <details open><summary>Átvétel és kiszállítás</summary><p>Személyes átvétel a boltban (1023 Budapest, Frankel Leó út 72.) nyitvatartási időben, a megadott idősávban. ${frozen ? "A fagyit csak személyesen tudod átvenni." : `Budapesten házhoz is visszük ${SA.ft(C.DELIVERY_FEE)}-ért, ${SA.ft(C.FREE_DELIVERY_FROM)} feletti rendelésnél ingyen.`}</p></details>
          <details><summary>Allergének és mentes változat</summary><p>Az allergénekről a boltban vagy telefonon (${esc(C.PHONE_LABEL)}) tájékoztatunk. Gluténmentes, laktózmentes és vegán változatot rendelésre készítünk.</p></details>
          <details><summary>Rendelési határidő</summary><p>${p.lead ? `Ezt a terméket legalább ${p.lead} nappal az átvétel előtt rendeld meg, hogy frissen készíthessük el.` : "Ha van a pultban, akár aznapra is kérheted, zárás előtt legalább 2 órával."} A pontos dátumot a pénztárban választod ki.</p></details>
          <!-- TODO: allergéninformáció termékenként a partnertől -->
        </div>
      </div>
    </div>`;

  function update() {
    const price = p.variants[v].price;
    $("#price").textContent = SA.ft(price);
    $("#price-note").textContent = p.variants.length > 1 ? p.variants[v].label : p.variants[0].label;
    $("#add-total").textContent = SA.ft(price * qty);
    $("#qty").textContent = qty;
    const add = $("#add");
    add.dataset.v = v; add.dataset.qty = qty;
    const sb = $("#sb-add"); sb.dataset.add = p.id; sb.dataset.v = v; sb.dataset.qty = qty;
    $("#sb-name").textContent = p.name;
    $("#sb-price").textContent = `${p.variants[v].label} · ${SA.ft(price * qty)}`;
    document.querySelectorAll(".vpill").forEach((b) => b.setAttribute("aria-checked", String(+b.dataset.v === v)));
  }

  $("#pdp").addEventListener("click", (e) => {
    const vb = e.target.closest(".vpill");
    if (vb) { v = +vb.dataset.v; update(); return; }
    const qb = e.target.closest("[data-q]");
    if (qb) { qty = Math.max(1, Math.min(20, qty + +qb.dataset.q)); update(); }
  });
  // a választógombok nyilakkal is léptethetők
  $("#pdp").addEventListener("keydown", (e) => {
    const vb = e.target.closest(".vpill");
    if (!vb || !["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    v = (v + (e.key === "ArrowRight" ? 1 : -1) + p.variants.length) % p.variants.length;
    update();
    document.querySelector(`.vpill[data-v="${v}"]`).focus();
  });
  update();

  // mobilon rögzített kosár-sáv, amikor a fő gomb kikerül a képből
  const sticky = $("#stickybuy"), addBtn = $("#add");
  let stickyOn = false;
  const checkSticky = () => {
    const on = addBtn.getBoundingClientRect().bottom < 0;
    if (on === stickyOn) return;
    stickyOn = on;
    sticky.classList.toggle("is-on", on);
    sticky.setAttribute("aria-hidden", String(!on));
    $("#sb-add").tabIndex = on ? 0 : -1;
  };
  window.addEventListener("scroll", checkSticky, { passive: true });
  checkSticky();

  // kapcsolódó termékek
  let rel = SA.PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat);
  if (rel.length < 4) rel = rel.concat(SA.PRODUCTS.filter((x) => x.id !== p.id && x.cat !== p.cat && x.featured));
  $("#related").innerHTML = rel.slice(0, 4).map(SA.card).join("");
  $("#related-sec").hidden = false;
});
