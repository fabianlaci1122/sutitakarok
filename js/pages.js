/* Sütit akarok! – egyszerű aloldalak: nyitvatartás, élő állapot, egyedi torta ajánlatkérő */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);

  const hours = $("#hours");
  if (hours) hours.innerHTML = SA.hoursTable();
  const live = $("#live");
  if (live) live.classList.toggle("is-open", SA.openState().open);

  const form = $("#custom-form");
  if (!form) return;

  const QTY = {
    "Torta": { label: "Hány szelet?", opts: ["8 szelet", "12 szelet", "16 szelet", "20 szelet", "24 szelet", "30 vagy több szelet"] },
    "Esküvői torta": { label: "Hány vendég?", opts: ["30–60 fő", "60–100 fő", "100–150 fő", "150 fő felett"] },
    "Desszertasztal": { label: "Hány vendég?", opts: ["20–40 fő", "40–80 fő", "80–120 fő", "120 fő felett"] },
  };
  const qty = $("#c-qty"), label = $("#c-qty-label"), date = $("#c-date"), err = $("#c-err");
  const min = new Date(); min.setDate(min.getDate() + 3); // TODO: átfutási idő egyeztetése
  date.min = SA.iso(min);
  const sync = () => { const q = QTY[form.tipus.value]; label.textContent = q.label; qty.innerHTML = q.opts.map((o) => `<option>${o}</option>`).join(""); };
  form.addEventListener("change", (e) => { if (e.target.name === "tipus") sync(); });
  // ?tipus=Desszertasztal előre kiválasztja a típust
  const pre = new URLSearchParams(location.search).get("tipus");
  if (pre) { const r = form.querySelector(`input[name="tipus"][value="${CSS.escape(pre)}"]`); if (r) r.checked = true; }
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
    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    const via = await SA.send({ type: "egyedi_ajanlatkeres", ...f }, `${f.tipus} – ajánlatkérés (${f.datum})`,
      [`Típus: ${f.tipus}`, `Dátum: ${f.datum}`, `Mennyiség: ${f.mennyiseg}`, `Mentesség: ${f.mentes}`, "", "Ízek, felirat, ötletek:", f.uzenet || "-", "", `Név: ${f.nev}`, `Telefon: ${f.telefon}`, `E-mail: ${f.email || "-"}`].join("\n"));
    btn.disabled = false;
    let ok = form.querySelector(".form__ok");
    if (!ok) { ok = document.createElement("p"); ok.className = "form__ok"; ok.setAttribute("role", "status"); form.appendChild(ok); }
    ok.textContent = via === "crm"
      ? "Köszönjük! Megkaptuk az ajánlatkérést, hamarosan jelentkezünk."
      : "Megnyitottuk a levelet az e-mail-programodban. Küldd el, és hamarosan jelentkezünk az árral.";
  });
});
