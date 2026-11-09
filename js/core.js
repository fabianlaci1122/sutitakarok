/* Sütit akarok! – közös mag minden oldalra:
   kosár (localStorage), fejléc oldalfülekkel és lapozóval, lábléc, termékkártya, toast, beúszás, küldés.
   A kosár ablakát a js/cartwin.js rajzolja. */
(function () {
  const C = SA.CONFIG;
  const KEY = "sutitakarok_cart_v2";
  const $ = (s, r = document) => r.querySelector(s);

  SA.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  SA.iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const esc = SA.esc;

  // ======================= KOSÁR =======================
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (items) => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* privát mód: csak memóriában */ }
    SA._mem = items;
    document.dispatchEvent(new CustomEvent("cart:change"));
  };
  const items = () => SA._mem || (SA._mem = read());

  SA.cart = {
    items,
    lines() {
      return items().map((it) => {
        const p = SA.byId(it.id);
        if (!p || !p.variants[it.v]) return null;
        const v = p.variants[it.v];
        return { ...it, p, variant: v.label, price: v.price, total: v.price * it.qty };
      }).filter(Boolean);
    },
    add(id, v = 0, qty = 1) {
      const list = items().map((x) => ({ ...x }));
      const hit = list.find((x) => x.id === id && x.v === v);
      if (hit) hit.qty = Math.min(99, hit.qty + qty); else list.push({ id, v, qty });
      write(list);
    },
    setQty(id, v, qty) { write(items().map((x) => (x.id === id && x.v === v ? { ...x, qty: Math.max(1, Math.min(99, qty)) } : x))); },
    step(id, v, d) {
      const it = items().find((x) => x.id === id && x.v === v);
      if (!it) return;
      if (it.qty + d < 1) SA.cart.remove(id, v); else SA.cart.setQty(id, v, it.qty + d);
    },
    remove(id, v) { write(items().filter((x) => !(x.id === id && x.v === v))); },
    clear() { write([]); },
    count() { return items().reduce((s, x) => s + x.qty, 0); },
    subtotal() { return SA.cart.lines().reduce((s, l) => s + l.total, 0); },
    leadDays() { return SA.cart.lines().reduce((m, l) => Math.max(m, l.p.lead || 0), 0); },
  };
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) { SA._mem = read(); document.dispatchEvent(new CustomEvent("cart:change")); }
  });

  // ======================= KÜLDÉS =======================
  /* CRM-webhook, ha be van állítva, különben mailto. Visszaadja: "crm" | "mail". */
  SA.send = async function (payload, subject, body) {
    if (C.CRM_WEBHOOK_URL) {
      try {
        const r = await fetch(C.CRM_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "sutitakarok-web", ...payload }) });
        if (r.ok) return "crm";
      } catch { /* hálózati hiba: e-mailre esünk vissza */ }
    }
    window.location.href = `mailto:${C.ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return "mail";
  };

  // ======================= NYITVATARTÁS =======================
  SA.DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
  SA.openState = (now = new Date()) => {
    const [o, c] = C.HOURS[now.getDay()];
    const m = now.getHours() * 60 + now.getMinutes();
    if (m >= o * 60 && m < c * 60) return { open: true, text: `Most nyitva, ${c}:00-ig` };
    if (m < o * 60) return { open: false, text: `Ma ${o}:00-kor nyitunk` };
    const t = new Date(now); t.setDate(t.getDate() + 1);
    return { open: false, text: `Holnap ${C.HOURS[t.getDay()][0]}:00-kor nyitunk` };
  };
  SA.hoursTable = () => {
    const d = new Date().getDay();
    return "<tbody>" + [1, 2, 3, 4, 5, 6, 0].map((x) =>
      `<tr${x === d ? ' class="is-today"' : ""}><td>${SA.DAY_NAMES[x]}${x === d ? " <span>ma</span>" : ""}</td><td>${C.HOURS[x][0]}:00 – ${C.HOURS[x][1]}:00</td></tr>`).join("") + "</tbody>";
  };

  // ======================= TERMÉKKÁRTYA =======================
  SA.ph = (p, cls = "ph") => `<div class="${cls}" aria-hidden="true"><img src="img/logo-240.png" alt=""><span>${esc(p.name)}</span></div>`;
  SA.card = (p) => {
    const from = p.variants.length > 1 ? `${SA.ft(SA.minPrice(p))}-tól` : SA.ft(p.variants[0].price);
    return `<article class="card">
      <div class="card__top">
        <a class="card__media" href="termek.html?id=${p.id}" tabindex="-1" aria-hidden="true">
          ${p.img ? `<img src="${p.img}" alt="" loading="lazy" width="640" height="640">` : SA.ph(p)}
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        </a>
        <button class="card__quick" type="button" data-add="${p.id}" data-v="0" aria-label="${esc(p.name)} (${esc(p.variants[0].label)}) kosárba">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      <div class="card__body">
        <h3><a href="termek.html?id=${p.id}">${esc(p.name)}</a></h3>
        <p>${esc(p.desc)}</p>
        <div class="card__meta"><span class="card__price">${from}</span><span class="card__lead">${SA.leadText(p)}</span></div>
      </div>
    </article>`;
  };

  // ======================= OLDALAK SORRENDJE (fülek + lapozó) =======================
  SA.PAGES = [
    { id: "home", href: "index.html", label: "Főoldal" },
    { id: "webshop", href: "webshop.html", label: "Webshop" },
    { id: "egyedi", href: "egyedi-torta.html", label: "Egyedi torta" },
    { id: "rolunk", href: "rolunk.html", label: "Rólunk" },
    { id: "kapcsolat", href: "kapcsolat.html", label: "Kapcsolat" },
  ];
  const ICON = {
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  };

  /* Két külön szakasz: felül a logó és a név (görgetéskor eltűnik),
     alatta a menüsáv csak kattintható oldalfülekkel és a kosárral (görgetéskor is fent marad). */
  function headerHTML(page) {
    return `
    <header class="brandbar">
      <a class="brandbar__link" href="index.html" aria-label="Sütit akarok! – kezdőlap">
        <img src="img/logo-240.png" alt="" width="64" height="64">
        <span class="brandbar__name">Sütit akarok!</span>
        <span class="brandbar__sub">Kézműves cukrászda · Budapest II.</span>
      </a>
    </header>
    <div class="navbar" id="hdr">
      <div class="navbar__in">
        <nav class="tabs" aria-label="Oldalak">
          ${SA.PAGES.map((p) => `<a href="${p.href}"${p.id === page ? ' aria-current="page"' : ""}>${p.label}</a>`).join("")}
        </nav>
        <button class="cartbtn" type="button" id="cartbtn" data-open-cart aria-haspopup="dialog" aria-label="Kosár megnyitása, 0 termék">${ICON.bag}<span class="cartbtn__label">Kosár</span><span class="cartbtn__count" data-cart-count hidden>0</span></button>
      </div>
    </div>`;
  }

  function footerHTML() {
    return `
    <footer class="ftr">
      <div class="wrap ftr__in">
        <div class="ftr__brand">
          <img src="img/logo-240.png" alt="" width="56" height="56">
          <p class="ftr__name">Sütit akarok!</p>
          <p>Cukrászda és fagyizó<br>${C.ADDRESS}</p>
          <p class="ftr__coord">47.5211° N · 19.0367° E</p>
        </div>
        <nav class="ftr__col" aria-label="Oldalak">
          <p class="ftr__h">Oldalak</p>
          ${SA.PAGES.map((p) => `<a href="${p.href}">${p.label}</a>`).join("")}
        </nav>
        <nav class="ftr__col" aria-label="Webshop">
          <p class="ftr__h">Webshop</p>
          <a href="webshop.html?cat=torta">Egész torták</a>
          <a href="webshop.html?cat=szelet">Sütik és dobozok</a>
          <a href="termek.html?id=adventi-naptar">Adventi naptár</a>
          <button type="button" class="ftr__btn" data-open-cart>Kosár</button>
          <a href="#">ÁSZF</a>
          <a href="#">Adatkezelés</a>
        </nav>
        <div class="ftr__col">
          <p class="ftr__h">Kapcsolat</p>
          <p class="ftr__open" data-open-now></p>
          <a href="tel:${C.PHONE}">${C.PHONE_LABEL}</a>
          <a href="mailto:${C.ORDER_EMAIL}">${C.ORDER_EMAIL}</a>
          <div class="social">
            <a href="${C.INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="dot"/></svg></a>
            <a href="${C.FACEBOOK}" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8z"/></svg></a>
          </div>
        </div>
      </div>
      <div class="wrap ftr__legal">
        <p>© ${new Date().getFullYear()} Sütit akarok! · Az árak mintaárak.</p>
        <p>Fotók: We Love Budapest · Hámori Zsófia / WMN · hovamenjek.hu · Sütit akarok! Instagram</p>
        <!-- TODO: ÁSZF, adatkezelés; a sajtófotókhoz engedély kell -->
      </div>
    </footer>`;
  }

  // ======================= TOAST =======================
  let toastTimer;
  SA.toast = function (html, action) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.innerHTML = `<span>${html}</span>${action ? `<button type="button" class="toast__btn" data-open-cart>${action}</button>` : ""}`;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 4200);
  };

  // ======================= ESEMÉNYEK =======================
  function renderBadge() {
    const n = SA.cart.count();
    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    const b = $("#cartbtn");
    if (b) b.setAttribute("aria-label", `Kosár megnyitása, ${n} termék`);
  }
  document.addEventListener("cart:change", renderBadge);

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      e.preventDefault();
      const p = SA.byId(add.dataset.add);
      if (!p) return;
      const v = +(add.dataset.v || 0);
      SA.cart.add(p.id, v, +(add.dataset.qty || 1));
      const b = $("#cartbtn");
      if (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
      if (!document.body.classList.contains("win-open")) SA.toast(`<b>${esc(p.name)}</b> · ${esc(p.variants[v].label)} a kosárban`, "Kosár megnyitása");
      return;
    }
    const st = e.target.closest("[data-step]");
    if (st) { const [id, v, d] = st.dataset.step.split(":"); SA.cart.step(id, +v, +d); return; }
    if (e.target.closest("[data-open-cart]")) {
      e.preventDefault();
      $(".toast")?.classList.remove("is-on");
      if (SA.openCart) SA.openCart();
    }
  });

  function setupHeader() {
    const hdr = $("#hdr");
    if (!hdr) return;
    const onScroll = () => hdr.classList.toggle("is-scrolled", hdr.getBoundingClientRect().top <= 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ======================= BEÚSZÁS =======================
  SA.observeReveal = function (root = document) {
    const els = root.querySelectorAll(".reveal:not(.is-in), .reveal-img:not(.is-in)");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  };
  // tartalék: ha egy böngésző nem küld IntersectionObserver-eseményt, görgetéskor akkor is előjön a tartalom
  let revealTick = false;
  const revealFallback = () => {
    if (revealTick) return;
    revealTick = true;
    requestAnimationFrame(() => {
      revealTick = false;
      document.querySelectorAll(".reveal:not(.is-in), .reveal-img:not(.is-in)").forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight * 0.95) el.classList.add("is-in");
      });
    });
  };
  window.addEventListener("scroll", revealFallback, { passive: true });
  window.addEventListener("load", () => setTimeout(revealFallback, 300));

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page || "";
    const hs = $("#site-header"), fs = $("#site-footer");
    if (hs) hs.outerHTML = headerHTML(page);
    if (fs) fs.outerHTML = footerHTML();
    document.querySelectorAll("[data-open-now]").forEach((el) => { const s = SA.openState(); el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    setupHeader();
    renderBadge();
    SA.observeReveal();
  });
})();
