/* Sütit akarok! – v3, függőség nélkül */

// Nyitvatartás getDay() szerint (0 = vasárnap). TODO: egyeztetni a partnerrel.
const HOURS = { 0: [9, 19], 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [9, 19] };
const DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

// Rendelési típusonként a mennyiség-opciók
const QTY = {
  "Torta": { label: "Hány szelet?", opts: ["8 szelet", "12 szelet", "16 szelet", "20 szelet", "24 szelet", "30 vagy több szelet"] },
  "Esküvői torta": { label: "Hány vendég?", opts: ["30–60 fő", "60–100 fő", "100–150 fő", "150 fő felett"] },
  "Desszertasztal": { label: "Hány vendég?", opts: ["20–40 fő", "40–80 fő", "80–120 fő", "120 fő felett"] },
  "Adventi naptár": { label: "Hány darab?", opts: ["1 db", "2 db", "3 db", "4 vagy több"] },
};
const ORDER_EMAIL = "sutitakarok.abolt@gmail.com";
const LEAD_DAYS = 3; // TODO: rendelési határidő egyeztetése

const $ = (s, r = document) => r.querySelector(s);
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ---------- Fejléc ----------
function setupHeader() {
  const hdr = $("#hdr"), burger = $(".hdr__burger"), nav = $("#nav");
  const onScroll = () => hdr.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setOpen = (open) => {
    hdr.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menü bezárása" : "Menü megnyitása");
  };
  burger.addEventListener("click", () => setOpen(!hdr.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

// ---------- Adventi naptár illusztráció (decemberben a mai ajtó kiemelve) ----------
function renderCalendar() {
  const now = new Date();
  const today = now.getMonth() === 11 && now.getDate() <= 24 ? now.getDate() : 0;
  // keverten, ahogy egy igazi naptáron
  const order = [7, 18, 3, 12, 22, 1, 15, 9, 20, 5, 24, 11, 2, 17, 8, 23, 14, 4, 19, 10, 6, 21, 13, 16];
  $("#cal-grid").innerHTML = order.map((n) => `<span${n === today ? ' class="is-today"' : ""}>${n}</span>`).join("");
}

// ---------- Nyitvatartás ----------
function renderHours() {
  const now = new Date(), today = now.getDay();
  $("#hours").innerHTML = "<tbody>" + [1, 2, 3, 4, 5, 6, 0].map((d) =>
    `<tr${d === today ? ' class="is-today"' : ""}><td>${DAY_NAMES[d]}</td><td>${HOURS[d][0]}:00 – ${HOURS[d][1]}:00</td></tr>`).join("") + "</tbody>";
  const [o, c] = HOURS[today];
  const mins = now.getHours() * 60 + now.getMinutes();
  $("#open-now").textContent = mins >= o * 60 && mins < c * 60 ? `Most nyitva, ${c}:00-ig` : "Most zárva";
}

// ---------- Tortarendelés (mailto) ----------
function setupForm() {
  const form = $("#order-form");
  const qty = $("#f-qty"), qtyLabel = $("#f-qty-label"), date = $("#f-date"), err = $("#form-err");
  const min = new Date(); min.setDate(min.getDate() + LEAD_DAYS);
  date.min = iso(min);

  const syncQty = () => {
    const q = QTY[form.tipus.value];
    qtyLabel.textContent = q.label;
    qty.innerHTML = q.opts.map((o) => `<option>${o}</option>`).join("");
  };
  form.addEventListener("change", (e) => { if (e.target.name === "tipus") syncQty(); });
  syncQty();

  // A „rendelek” gombok előre kiválasztják a típust
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-kind]");
    if (!a) return;
    const r = form.querySelector(`input[name="tipus"][value="${a.dataset.kind}"]`);
    if (r) { r.checked = true; syncQty(); }
  });

  form.addEventListener("submit", (e) => {
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
    const subject = `${f.tipus} – ajánlatkérés (${f.datum})`;
    const body = [
      `Típus: ${f.tipus}`, `Dátum: ${f.datum}`, `Mennyiség: ${f.mennyiseg}`, `Mentesség: ${f.mentes}`,
      "", "Ízek, felirat, ötletek:", f.uzenet || "-", "",
      `Név: ${f.nev}`, `Telefon: ${f.telefon}`, `E-mail: ${f.email || "-"}`,
    ].join("\n");
    window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    let ok = $(".form__ok", form);
    if (!ok) { ok = document.createElement("p"); ok.className = "form__ok"; ok.setAttribute("role", "status"); form.appendChild(ok); }
    ok.textContent = "Megnyitottuk a levelet az e-mail-programodban. Küldd el, és hamarosan jelentkezünk az árral.";
  });
}

// ---------- Beúszás görgetéskor ----------
function setupReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach((el) => io.observe(el));
}

setupHeader();
renderCalendar();
renderHours();
setupForm();
setupReveal();
$("#year").textContent = new Date().getFullYear();
