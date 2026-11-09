/* Sütit akarok! – közös mag minden oldalra:
   kosár (localStorage), fejléc/lábléc/mini-kosár beillesztése, termékkártya, toast, beúszás, küldés. */
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

  // ======================= FEJLÉC / LÁBLÉC =======================
  const NAV = [
    ["webshop", "webshop.html", "Webshop"],
    ["egyedi", "egyedi-torta.html", "Egyedi torta"],
    ["rolunk", "rolunk.html", "Rólunk"],
    ["kapcsolat", "kapcsolat.html", "Kapcsolat"],
  ];
  const BAG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';

  function headerHTML(page) {
    return `
    <div class="announce" role="region" aria-label="Közlemény">
      <div class="announce__track">
        <span>Gőzgombóc minden nap, kb. 25 perc alatt</span><span>Ingyenes kiszállítás ${SA.ft(C.FREE_DELIVERY_FROM)} felett Budapesten</span><span>Egyedi tortát 3 nappal előre rendelj</span>
      </div>
    </div>
    <header class="hdr" id="hdr">
      <div class="hdr__in">
        <nav class="hdr__nav" id="nav" aria-label="Fő menü">
          ${NAV.map(([id, href, label]) => `<a href="${href}"${id === page ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        </nav>
        <a class="hdr__brand" href="index.html" aria-label="Sütit akarok! – kezdőlap">
          <img src="img/logo-240.png" alt="" width="56" height="56">
          <span>Sütit akarok!</span>
        </a>
        <div class="hdr__tools">
          <a class="hdr__link" href="tel:${C.PHONE}">${C.PHONE_LABEL}</a>
          <a class="cartbtn" href="kosar.html" id="cartbtn" aria-label="Kosár, 0 termék">${BAG}<span class="cartbtn__label">Kosár</span><span class="cartbtn__count" data-cart-count hidden>0</span></a>
          <button class="hdr__burger" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menü megnyitása"><span></span><span></span></button>
        </div>
      </div>
    </header>`;
  }

  function footerHTML() {
    return `
    <footer class="ftr">
      <div class="wrap ftr__cta">
        <p class="ftr__big">Sütit akarsz?</p>
        <div class="ftr__cta-btns"><a class="btn btn--light" href="webshop.html">Irány a webshop</a><a class="btn btn--outline-light" href="${C.MAPS_URL}" target="_blank" rel="noopener">Útvonaltervezés</a></div>
      </div>
      <div class="wrap ftr__in">
        <div class="ftr__brand">
          <img src="img/logo-240.png" alt="" width="72" height="72">
          <p>Cukrászda és fagyizó<br>${C.ADDRESS}</p>
          <p class="ftr__open" data-open-now></p>
        </div>
        <nav class="ftr__col" aria-label="Webshop">
          <p class="ftr__h">Webshop</p>
          <a href="webshop.html">Összes termék</a>
          <a href="webshop.html?cat=torta">Egész torták</a>
          <a href="webshop.html?cat=szelet">Sütik és dobozok</a>
          <a href="termek.html?id=adventi-naptar">Adventi naptár</a>
        </nav>
        <nav class="ftr__col" aria-label="Rólunk">
          <p class="ftr__h">Sütit akarok!</p>
          <a href="egyedi-torta.html">Egyedi torta és rendezvény</a>
          <a href="rolunk.html">Rólunk</a>
          <a href="kapcsolat.html">Kapcsolat és nyitvatartás</a>
          <a href="#">ÁSZF</a>
          <a href="#">Adatkezelés</a>
        </nav>
        <div class="ftr__col">
          <p class="ftr__h">Kapcsolat</p>
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

  function drawerHTML() {
    return `
    <div class="scrim" id="scrim" hidden></div>
    <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true" inert>
      <div class="drawer__head">
        <p id="drawer-title">Kosár <span data-cart-count-plain></span></p>
        <button type="button" class="iconbtn" data-close-drawer aria-label="Kosár bezárása"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="drawer__body" id="drawer-body"></div>
      <div class="drawer__foot" id="drawer-foot"></div>
    </aside>`;
  }

  // ======================= MINI-KOSÁR =======================
  let lastFocus = null;
  function renderDrawer() {
    const body = $("#drawer-body"), foot = $("#drawer-foot");
    if (!body) return;
    const lines = SA.cart.lines();
    document.querySelectorAll("[data-cart-count-plain]").forEach((el) => (el.textContent = lines.length ? `(${SA.cart.count()})` : ""));
    if (!lines.length) {
      body.innerHTML = `<div class="drawer__empty"><img src="img/logo-240.png" alt="" width="72" height="72"><p class="script">Még üres a kosarad</p><p>Pedig tudjuk, hogy sütit akarsz.</p><a class="btn btn--primary" href="webshop.html">Irány a webshop</a></div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = `<ul class="mini">${lines.map((l) => `
      <li class="mini__line">
        ${l.p.img ? `<img src="${l.p.img}" alt="" width="72" height="72">` : SA.ph(l.p, "ph ph--sm")}
        <div>
          <a class="mini__name" href="termek.html?id=${l.p.id}">${esc(l.p.name)}</a>
          <p class="mini__var">${esc(l.variant)}</p>
          <div class="qty qty--sm" role="group" aria-label="${esc(l.p.name)} mennyiség">
            <button type="button" data-step="${l.id}:${l.v}:-1" aria-label="Eggyel kevesebb">−</button><output>${l.qty}</output><button type="button" data-step="${l.id}:${l.v}:1" aria-label="Eggyel több">+</button>
          </div>
        </div>
        <span class="mini__total">${SA.ft(l.total)}</span>
      </li>`).join("")}</ul>`;
    const sub = SA.cart.subtotal(), left = Math.max(0, C.FREE_DELIVERY_FROM - sub);
    foot.innerHTML = `
      <div class="freebar"><span>${left ? `Még <b>${SA.ft(left)}</b>, és ingyen kiszállítjuk.` : "Ingyenes kiszállítás jár a rendelésedhez."}</span><div class="freebar__track"><div class="freebar__fill" style="width:${Math.min(100, (sub / C.FREE_DELIVERY_FROM) * 100)}%"></div></div></div>
      <div class="sumrow sumrow--total"><span>Részösszeg</span><span>${SA.ft(sub)}</span></div>
      <a class="btn btn--primary btn--block btn--lg" href="kosar.html">Tovább a pénztárhoz</a>
      <button class="btn btn--text btn--block" type="button" data-close-drawer>Vásárlás folytatása</button>`;
  }

  SA.openDrawer = function () {
    const d = $("#drawer");
    if (!d || document.body.dataset.page === "kosar") return;
    lastFocus = document.activeElement;
    renderDrawer();
    $("#scrim").hidden = false;
    d.removeAttribute("inert");
    d.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => { document.body.classList.add("drawer-open"); });
    setTimeout(() => d.querySelector("[data-close-drawer]").focus(), 50);
  };
  SA.closeDrawer = function () {
    const d = $("#drawer");
    if (!d || !document.body.classList.contains("drawer-open")) return;
    document.body.classList.remove("drawer-open");
    d.setAttribute("aria-hidden", "true");
    d.setAttribute("inert", "");
    setTimeout(() => { $("#scrim").hidden = true; }, 350);
    if (lastFocus) lastFocus.focus();
  };

  // ======================= TOAST =======================
  let toastTimer;
  SA.toast = function (html) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.innerHTML = html;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 3200);
  };

  // ======================= ESEMÉNYEK =======================
  function renderBadge() {
    const n = SA.cart.count();
    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    const b = $("#cartbtn");
    if (b) b.setAttribute("aria-label", `Kosár, ${n} termék`);
  }

  document.addEventListener("cart:change", () => { renderBadge(); if (document.body.classList.contains("drawer-open")) renderDrawer(); });

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      e.preventDefault();
      const p = SA.byId(add.dataset.add);
      if (!p) return;
      const v = +(add.dataset.v || 0);
      const qty = +(add.dataset.qty || 1);
      SA.cart.add(p.id, v, qty);
      const b = $("#cartbtn");
      if (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
      if (document.body.dataset.page === "kosar") SA.toast(`<strong>${esc(p.name)}</strong> a kosárban.`);
      else SA.openDrawer();
      return;
    }
    const st = e.target.closest("[data-step]");
    if (st) { const [id, v, d] = st.dataset.step.split(":"); SA.cart.step(id, +v, +d); return; }
    if (e.target.closest("[data-close-drawer]") || e.target.id === "scrim") { SA.closeDrawer(); return; }
    const cb = e.target.closest("#cartbtn");
    if (cb && document.body.dataset.page !== "kosar") { e.preventDefault(); SA.openDrawer(); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    SA.closeDrawer();
    const hdr = $("#hdr");
    if (hdr && hdr.classList.contains("is-open")) { hdr.classList.remove("is-open"); hdr.querySelector(".hdr__burger").setAttribute("aria-expanded", "false"); }
  });

  function setupHeader() {
    const hdr = $("#hdr");
    if (!hdr) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      hdr.classList.toggle("is-scrolled", y > 10);
      // lefelé görgetéskor elrejtjük, felfelé visszajön
      hdr.classList.toggle("is-hidden", y > 320 && y > lastY && !hdr.classList.contains("is-open"));
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const burger = hdr.querySelector(".hdr__burger");
    burger.addEventListener("click", () => {
      const open = !hdr.classList.contains("is-open");
      hdr.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Menü bezárása" : "Menü megnyitása");
    });
  }

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
    document.body.insertAdjacentHTML("beforeend", drawerHTML());
    document.querySelectorAll("[data-open-now]").forEach((el) => { const s = SA.openState(); el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    setupHeader();
    renderBadge();
    SA.observeReveal();
  });
})();
