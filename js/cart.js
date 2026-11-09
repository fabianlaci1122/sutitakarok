/* Sütit akarok! – közös kosár (localStorage), fejléc, toast, beúszás. Mindkét oldal betölti. */
(function () {
  const KEY = "sutitakarok_cart_v2";

  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  };
  const write = (items) => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* privát mód: a kosár csak az oldalon él */ }
    SA._mem = items;
    document.dispatchEvent(new CustomEvent("cart:change"));
  };
  const items = () => SA._mem || (SA._mem = read());

  SA.cart = {
    items,
    // sorok termékadatokkal kiegészítve; az időközben megszűnt termékek kiesnek
    lines() {
      return items().map((it) => {
        const p = SA.byId(it.id);
        if (!p || !p.variants[it.v]) return null;
        const v = p.variants[it.v];
        return { ...it, p, variant: v.label, price: v.price, total: v.price * it.qty };
      }).filter(Boolean);
    },
    add(id, v = 0, qty = 1) {
      const list = items().slice();
      const hit = list.find((x) => x.id === id && x.v === v);
      if (hit) hit.qty = Math.min(99, hit.qty + qty); else list.push({ id, v, qty });
      write(list);
    },
    setQty(id, v, qty) {
      let list = items().map((x) => (x.id === id && x.v === v ? { ...x, qty: Math.max(1, Math.min(99, qty)) } : x));
      write(list);
    },
    remove(id, v) { write(items().filter((x) => !(x.id === id && x.v === v))); },
    clear() { write([]); },
    count() { return items().reduce((s, x) => s + x.qty, 0); },
    subtotal() { return SA.cart.lines().reduce((s, l) => s + l.total, 0); },
    leadDays() { return SA.cart.lines().reduce((m, l) => Math.max(m, l.p.lead || 0), 0); },
  };

  // más fülön módosított kosár
  window.addEventListener("storage", (e) => { if (e.key === KEY) { SA._mem = read(); document.dispatchEvent(new CustomEvent("cart:change")); } });

  // ---------- fejléc: kosár-jelvény, árnyék görgetéskor, mobilmenü ----------
  function renderBadge() {
    const n = SA.cart.count();
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = n;
      el.hidden = n === 0;
    });
    document.querySelectorAll("[data-cart-link]").forEach((a) => a.setAttribute("aria-label", `Kosár, ${n} termék`));
  }
  document.addEventListener("cart:change", renderBadge);

  function setupHeader() {
    const hdr = document.querySelector(".hdr");
    if (!hdr) return;
    const onScroll = () => hdr.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const burger = hdr.querySelector(".hdr__burger");
    const nav = hdr.querySelector(".hdr__nav");
    if (!burger || !nav) return;
    const setOpen = (open) => {
      hdr.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Menü bezárása" : "Menü megnyitása");
    };
    burger.addEventListener("click", () => setOpen(!hdr.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // ---------- toast ----------
  let toastTimer;
  SA.toast = function (html) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.setAttribute("role", "status");
      t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
    t.innerHTML = html;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 3600);
  };

  // ---------- beúszás görgetéskor ----------
  function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
  }
  SA.observeReveal = setupReveal;

  /* Közös küldés: CRM-webhook, ha be van állítva, különben mailto. Visszaadja: "crm" | "mail". */
  SA.send = async function (payload, subject, body) {
    const url = SA.CONFIG.CRM_WEBHOOK_URL;
    if (url) {
      try {
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "sutitakarok-web", ...payload }) });
        if (r.ok) return "crm";
      } catch { /* hálózati hiba: e-mailre esünk vissza */ }
    }
    window.location.href = `mailto:${SA.CONFIG.ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return "mail";
  };

  SA.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  SA.iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  document.addEventListener("DOMContentLoaded", () => {
    setupHeader();
    renderBadge();
    setupReveal();
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  });
})();
