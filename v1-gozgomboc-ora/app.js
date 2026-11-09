/* Sütit akarok! – oldal logika (függőség nélkül)
   A heti tartalmat a lenti adattömbök vezérlik: EVENTS, NEWS, TILES, FLAVORS. */

// ---------- Adatok ----------
// Nyitvatartás getDay() szerint (0 = vasárnap). TODO: egyeztetni a partnerrel.
const HOURS = {
  0: [9, 19], 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [9, 19],
};
const DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
const GG_MINUTES = 25; // ennyi ideig készül a gőzgombóc

// Napi kínálat, ami minden nap ugyanaz, és a hétvégi extrák
const DAILY = ["Klasszikus gőzgombóc", "Napi sütik és torták", "Reggeli egész nap"];
const WEEKEND_EXTRA = ["Nutellás gőzgombóc", "Pisztáciás gőzgombóc"];

// Dátumhoz kötött témanapok (ÉÉÉÉ-HH-NN). Ide kell felvenni az Instagramon bejelentett akciókat.
const EVENTS = {
  "2026-11-07": ["Gesztenyepüré-hétvége"],
  "2026-11-08": ["Gesztenyepüré-hétvége"],
};

// Aktuális hírek / kampányok. `until` után eltűnnek, `past: true` = „legutóbb volt”.
const NEWS = [
  {
    kicker: "Most rendelhető", title: "Adventi naptár", style: "green", until: "2026-12-01",
    text: "24 meglepicsomag és 2 cukiság, minden napra egy. 11 990 Ft-tól.",
    // TODO: pontos ár, rendelési határidő és átvétel a partnertől
    cta: { label: "Előrendelem", href: "#rendeles" },
  },
  {
    kicker: "Karácsonyra", title: "Céges karácsony", until: "2026-12-20",
    text: "Desszertasztal, sütis dobozok és ajándékcsomagok a csapatnak vagy az ügyfeleknek. Kérj ajánlatot létszámmal és dátummal.",
    cta: { label: "Ajánlatot kérek", href: "#rendeles", kind: "Céges karácsony" },
  },
  {
    kicker: "Legutóbb volt", title: "Gesztenyepüré-hétvége", past: true, from: "2026-11-07", until: "2026-11-22",
    list: ["Gesztenyepüré de luxe (brownie, mascarpone, karamell)", "Rumos meggyes gesztenyepüré", "Gesztenyepürés brutál Somlói", "Gesztenyés tiramisu", "Mont Blanc brownie"],
    text: "A következő témahétvégét az Instagramon jelentjük be.",
    cta: { label: "Követem az Instagramon", href: "https://www.instagram.com/sutitakarok/", ext: true },
  },
];

const TILES = [
  {
    title: "Flódni", star: true, quote: "„Budapest legjobb flódnija”",
    text: "Mák, alma, dió és szilvalekvár, rétegesen. A legnépszerűbb sütink, és fagyiként is megkóstolhatod.",
    tags: ["Minden nap", "Egész tálcában is"],
  },
  {
    title: "Sajttorták",
    text: "Red velvet, pisztáciás, gesztenyés, szezonális gyümölcsös. Szeletre a pultból, vagy egész tortában rendelésre.",
    tags: ["Szeletre", "Rendelésre"],
  },
  {
    title: "Brownietorták és piték",
    text: "Sűrű, csokis brownietorták, valamint key lime pite és banoffee pite a nagy kedvencek közül.",
    tags: ["Szeletre", "Rendelésre"],
  },
  {
    title: "Mentes sütik",
    text: "Gluténmentes, laktózmentes és vegán sütik minden nap. A mentesség nálunk nem kompromisszum, ugyanolyan finomnak kell lennie.",
    tags: ["Gluténmentes", "Laktózmentes", "Vegán"],
  },
  {
    title: "Nagyis sütik",
    text: "Somlói, Túró Rudi-szelet, mákos kalács, krémes. Azok a sütik, amiket Gerti a legjobban szeret.",
    tags: ["Naponta változik"],
  },
  {
    title: "Reggeli egész nap",
    text: "Reggelizni nálunk nem csak délelőtt lehet. Mellé kávé, és a pultból egy szelet, ha már itt vagy.",
    tags: ["Kávé", "Helyben vagy elvitelre"],
    // TODO: reggeli-menü tételei és árai a partnertől
  },
];

const FLAVORS = [
  { name: "Nagymama flódnija", note: "mák és alma", c: "#d9c3a0" },
  { name: "Málna", note: "friss gyümölcsből", c: "#e2577f" },
  { name: "Alphonso mangó", note: "", c: "#f3b13f" },
  { name: "Pisztácia", note: "pisztáciás tölcsérben is", c: "#a9c27a" },
  { name: "Cheesecake", note: "sós pekándióval", c: "#f2e3bf" },
  { name: "Kávé", note: "felnőtteknek", c: "#8b5b3e" },
  { name: "Intenzív csoki", note: "tejmentes", c: "#4b2b24" },
  { name: "Gyerekkori csoki", note: "a klasszikus", c: "#9a6447" },
  { name: "Vegán jégkrém", note: "és mindenmentes", c: "#f7c9d6" },
];

// Rendelési típusonként a mennyiség-opciók
const QTY = {
  "Torta": { label: "Hány szelet?", opts: ["8 szelet", "12 szelet", "16 szelet", "20 szelet", "24 szelet", "30 vagy több szelet"] },
  "Desszertasztal": { label: "Hány vendég?", opts: ["20–40 fő", "40–80 fő", "80–120 fő", "120 fő felett"] },
  "Esküvői torta": { label: "Hány vendég?", opts: ["30–60 fő", "60–100 fő", "100–150 fő", "150 fő felett"] },
  "Céges karácsony": { label: "Hány fős a csapat?", opts: ["10–20 fő", "20–50 fő", "50–100 fő", "100 fő felett"] },
};
const ORDER_EMAIL = "sutitakarok.abolt@gmail.com";
const LEAD_DAYS = 3; // TODO: rendelési határidő egyeztetése

// ---------- Segédek ----------
const $ = (s, r = document) => r.querySelector(s);
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (d) => `${d.getHours()}:${pad(d.getMinutes())}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SVGNS = "http://www.w3.org/2000/svg";

function openState(now = new Date()) {
  const [o, c] = HOURS[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = mins >= o * 60 && mins < c * 60;
  return { open, openH: o, closeH: c, mins };
}

function nextOpening(now) {
  const st = openState(now);
  if (st.mins < st.openH * 60) return `ma ${st.openH}:00-kor`;
  const t = new Date(now); t.setDate(t.getDate() + 1);
  return `holnap ${HOURS[t.getDay()][0]}:00-kor`;
}

// ---------- Fejléc státusz ----------
function renderStatus() {
  const now = new Date();
  const st = openState(now);
  const el = $("#status");
  el.classList.toggle("is-open", st.open);
  $(".status__txt", el).textContent = st.open ? `Nyitva ${st.closeH}:00-ig` : `Zárva · nyitunk ${nextOpening(now)}`;
}

// ---------- Gőzgombóc-óra ----------
function polar(deg, r) {
  const a = (deg * Math.PI) / 180;
  return [120 + r * Math.sin(a), 120 - r * Math.cos(a)];
}

function buildClockStatic() {
  const ticks = $("#clock-ticks");
  for (let i = 0; i < 60; i += 5) {
    const big = i % 15 === 0;
    const [x1, y1] = polar(i * 6, big ? 96 : 100);
    const [x2, y2] = polar(i * 6, 106);
    const l = document.createElementNS(SVGNS, "line");
    l.setAttribute("x1", x1); l.setAttribute("y1", y1);
    l.setAttribute("x2", x2); l.setAttribute("y2", y2);
    l.setAttribute("class", big ? "clock__tick clock__tick--big" : "clock__tick");
    ticks.appendChild(l);
  }
  // Mákszórás: determinisztikus „véletlen”, hogy minden betöltésnél ugyanúgy nézzen ki
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const mak = $("#clock-mak");
  for (let i = 0; i < 70; i++) {
    const x = 78 + rnd() * 84;
    const top = 132 - Math.sqrt(Math.max(0, 1 - ((x - 120) / 50) ** 2)) * 46; // a gombóc teteje
    const y = top + 4 + rnd() * 18;
    const e = document.createElementNS(SVGNS, "ellipse");
    e.setAttribute("cx", x.toFixed(1)); e.setAttribute("cy", y.toFixed(1));
    e.setAttribute("rx", (1.1 + rnd() * 0.8).toFixed(2)); e.setAttribute("ry", "1");
    e.setAttribute("transform", `rotate(${Math.round(rnd() * 180)} ${x.toFixed(1)} ${y.toFixed(1)})`);
    e.setAttribute("class", "clock__mak");
    mak.appendChild(e);
  }
}

function renderClock() {
  const now = new Date();
  const m = now.getMinutes() + now.getSeconds() / 60;
  const h = (now.getHours() % 12) + m / 60;
  const setHand = (id, deg, len) => {
    const [x, y] = polar(deg, len);
    const el = $(id); el.setAttribute("x2", x.toFixed(1)); el.setAttribute("y2", y.toFixed(1));
  };
  setHand("#clock-min", m * 6, 86);
  setHand("#clock-hour", h * 30, 56);

  const a0 = m * 6, a1 = a0 + GG_MINUTES * 6;
  const [sx, sy] = polar(a0, 100), [ex, ey] = polar(a1, 100);
  $("#clock-arc").setAttribute("d", `M${sx.toFixed(1)} ${sy.toFixed(1)} A100 100 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`);

  const ready = new Date(now.getTime() + GG_MINUTES * 60000);
  const st = openState(now);
  const readyMins = ready.getHours() * 60 + ready.getMinutes();
  let msg;
  if (st.open && readyMins <= st.closeH * 60 && ready.getDate() === now.getDate()) {
    msg = `Ha most hívsz, ${hm(ready)}-kor kész.`; // a -kor rag minden időpontra jó
  } else if (st.open) {
    msg = "Mára már nem fér bele, holnap reggeltől újra.";
  } else {
    msg = `Most zárva vagyunk, nyitunk ${nextOpening(now)}.`;
  }
  $("#gg-ready").textContent = msg;
}

// ---------- A héten ----------
function renderWeek() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const list = $("#week");
  const fmt = new Intl.DateTimeFormat("hu-HU", { month: "short", day: "numeric" });
  let html = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6;
    const isToday = d.getTime() === today.getTime();
    const [o, c] = HOURS[dow];
    const items = [...DAILY.map((t) => ({ t })), ...(weekend ? WEEKEND_EXTRA.map((t) => ({ t, extra: true })) : []),
      ...(EVENTS[iso(d)] || []).map((t) => ({ t, extra: true }))];
    html += `<li class="day${weekend ? " day--weekend" : ""}${isToday ? " day--today" : ""}"${isToday ? ' aria-current="date"' : ""}>
      ${isToday ? '<span class="day__tag">Ma</span>' : ""}
      <span class="day__name">${DAY_NAMES[dow]}</span>
      <span class="day__date">${fmt.format(d)} · ${o}–${c}</span>
      <ul>${items.map((x) => `<li${x.extra ? ' class="extra"' : ""}>${esc(x.t)}</li>`).join("")}</ul>
    </li>`;
  }
  list.innerHTML = html;
}

function renderNews() {
  const t = iso(new Date());
  const items = NEWS.filter((n) => (!n.until || t <= n.until) && (!n.from || t >= n.from));
  $("#news").innerHTML = items.map((n) => `
    <article class="card${n.style === "green" ? " card--green" : ""}${n.past ? " card--past" : ""}">
      <p class="card__kicker">${esc(n.kicker)}</p>
      <h3>${esc(n.title)}</h3>
      ${n.list ? `<ul>${n.list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      <p>${esc(n.text)}</p>
      ${n.cta ? `<a class="btn ${n.past ? "btn--ghost" : "btn--dark"}" href="${n.cta.href}"${n.cta.ext ? ' target="_blank" rel="noopener"' : ""}${n.cta.kind ? ` data-kind="${esc(n.cta.kind)}"` : ""}>${esc(n.cta.label)}</a>` : ""}
    </article>`).join("");
}

function renderTiles() {
  $("#tiles").innerHTML = TILES.map((x) => `
    <article class="tile${x.star ? " tile--star" : ""}">
      ${x.quote ? `<p class="tile__quote">${esc(x.quote)}</p>` : ""}
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.text)}</p>
      <ul class="tile__tags">${x.tags.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
    </article>`).join("");
}

function renderFlavors() {
  $("#scoops").innerHTML = FLAVORS.map((f) => `
    <li class="scoop"><span class="scoop__ball" style="--c:${f.c}"></span>${esc(f.name)}${f.note ? `<small>${esc(f.note)}</small>` : ""}</li>`).join("");
}

function renderHours() {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const today = new Date().getDay();
  $("#hours").innerHTML = "<tbody>" + order.map((d) =>
    `<tr${d === today ? ' class="is-today"' : ""}><td>${DAY_NAMES[d]}${d === today ? " (ma)" : ""}</td><td>${HOURS[d][0]}:00 – ${HOURS[d][1]}:00</td></tr>`).join("") + "</tbody>";
}

// ---------- Rendelési űrlap ----------
function setupForm() {
  const form = $("#order-form");
  const qty = $("#f-qty"), qtyLabel = $("#f-qty-label"), date = $("#f-date"), err = $("#form-err");
  const min = new Date(); min.setDate(min.getDate() + LEAD_DAYS);
  date.min = iso(min);

  const syncQty = () => {
    const kind = form.tipus.value;
    qtyLabel.textContent = QTY[kind].label;
    qty.innerHTML = QTY[kind].opts.map((o) => `<option>${o}</option>`).join("");
  };
  form.addEventListener("change", (e) => { if (e.target.name === "tipus") syncQty(); });
  syncQty();

  // A hírkártyák „Ajánlatot kérek” gombja előre kiválasztja a típust
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-kind]");
    if (!a) return;
    const r = form.querySelector(`input[name="tipus"][value="${a.dataset.kind}"]`);
    if (r) { r.checked = true; syncQty(); }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.querySelectorAll(".is-invalid").forEach((x) => x.classList.remove("is-invalid"));
    const missing = [];
    if (!form.nev.value.trim()) missing.push(form.nev);
    if (!/^[+\d][\d\s/-]{7,}$/.test(form.telefon.value.trim())) missing.push(form.telefon);
    if (!form.datum.value || form.datum.value < date.min) missing.push(form.datum);
    if (form.email.value && !form.email.checkValidity()) missing.push(form.email);
    if (missing.length) {
      missing.forEach((x) => { x.classList.add("is-invalid"); x.setAttribute("aria-invalid", "true"); });
      missing[0].focus();
      const dateBad = missing.includes(form.datum);
      err.textContent = dateBad
        ? `Add meg a nevet, a telefonszámot és a dátumot. A legkorábbi dátum: ${date.min.replaceAll("-", ". ")}.`
        : "Add meg a nevet és egy érvényes telefonszámot.";
      return;
    }
    err.textContent = "";
    const f = Object.fromEntries(new FormData(form));
    const subject = `${f.tipus} – ajánlatkérés (${f.datum})`;
    const body = [
      `Típus: ${f.tipus}`, `Dátum: ${f.datum}`, `Mennyiség: ${f.mennyiseg}`, `Mentesség: ${f.mentes}`,
      "", `Ízek, felirat, ötletek:`, f.uzenet || "-", "",
      `Név: ${f.nev}`, `Telefon: ${f.telefon}`, `E-mail: ${f.email || "-"}`,
    ].join("\n");
    window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    let ok = $(".form__ok", form);
    if (!ok) { ok = document.createElement("p"); ok.className = "form__ok"; ok.setAttribute("role", "status"); form.appendChild(ok); }
    ok.textContent = "Megnyitottuk a levelet az e-mail-programodban. Küldd el, és hamarosan jelentkezünk az árral.";
  });
}

// ---------- Menü ----------
function setupNav() {
  const btn = $(".nav__toggle"), ul = $("#menu");
  btn.addEventListener("click", () => {
    const open = ul.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });
  ul.addEventListener("click", (e) => {
    if (e.target.closest("a")) { ul.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }
  });
}

// ---------- Indítás ----------
buildClockStatic();
renderStatus(); renderClock();
renderWeek(); renderNews(); renderTiles(); renderFlavors(); renderHours();
setupForm(); setupNav();
$("#year").textContent = new Date().getFullYear();
setInterval(() => { renderStatus(); renderClock(); }, 20000);
