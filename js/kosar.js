/* Sütit akarok! – kosár és rendelés oldal */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => SA.esc(s);
  const C = SA.CONFIG;
  const DAY = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
  const DELIVERY_SLOTS = ["10:00–14:00", "14:00–18:00"]; // TODO: kiszállítási idősávok a partnertől
  let mode = "cart"; // cart | done

  const imgOrPh = (p, cls) => p.img
    ? `<img class="${cls}" src="${p.img}" alt="" width="96" height="96">`
    : SA.ph(p, `${cls} ph`);

  const hasFrozen = () => SA.cart.lines().some((l) => l.p.cat === "fagyi");

  // ---------- nézetek ----------
  function renderEmpty() {
    setSteps(1);
    const picks = ["malnas-sajttorta", "gozgomboc", "valogatott-doboz", "fagyi-doboz"].map(SA.byId).filter(Boolean);
    $("#view").innerHTML = `
      <div class="empty">
        <div class="empty__logo"><img src="img/logo-240.png" alt=""></div>
        <h2>Még üres a kosarad</h2>
        <p class="lead" style="margin:0 auto 30px">Pedig tudjuk, hogy sütit akarsz. Nézz szét a kínálatban!</p>
        <a class="btn btn--primary btn--lg" href="webshop.html">Irány a webshop</a>
        <div class="grid">${picks.map(SA.card).join("")}</div>
      </div>`;
  }

  function renderCheckout() {
    setSteps(1);
    $("#view").innerHTML = `
      <form class="checkout" id="order" novalidate>
        <div class="checkout__main">
          <section class="panel" aria-labelledby="h-items">
            <h2 class="ptitle" id="h-items"><span class="num">1</span>A kosarad</h2>
            <ul class="lines" id="lines"></ul>
          </section>

          <section class="panel" aria-labelledby="h-mode">
            <h2 class="ptitle" id="h-mode"><span class="num">2</span>Átvétel</h2>
            <div class="opts">
              <label class="opt"><input type="radio" name="mod" value="atvetel" checked><span><b>Személyes átvétel</b><small>Frankel Leó út 72., Budapest II.</small><small><em>Ingyenes</em></small></span></label>
              <label class="opt"><input type="radio" name="mod" value="kiszallitas" id="opt-delivery"><span><b>Kiszállítás Budapesten</b><small id="delivery-note">Hűtött dobozban, a megadott idősávban</small><small><em>${SA.ft(C.DELIVERY_FEE)}</em>, ${SA.ft(C.FREE_DELIVERY_FROM)} felett ingyenes</small></span></label>
            </div>
            <div class="addr" id="addr" hidden>
              <div class="grid2">
                <label class="field"><span>Irányítószám</span><input name="irsz" inputmode="numeric" autocomplete="postal-code" maxlength="4" placeholder="1023"></label>
                <label class="field"><span>Település</span><input name="varos" value="Budapest" autocomplete="address-level2"></label>
              </div>
              <label class="field"><span>Utca, házszám, emelet, ajtó</span><input name="cim" autocomplete="street-address"></label>
            </div>
            <div class="grid2">
              <label class="field"><span>Dátum</span><input type="date" name="datum" id="f-date" required></label>
              <label class="field"><span>Idősáv</span><select name="idosav" id="f-slot" required></select></label>
            </div>
            <p class="hint" id="lead-hint"></p>
          </section>

          <section class="panel" aria-labelledby="h-data">
            <h2 class="ptitle" id="h-data"><span class="num">3</span>Adataid</h2>
            <div class="grid2">
              <label class="field"><span>Teljes név</span><input name="nev" autocomplete="name" required></label>
              <label class="field"><span>Telefonszám</span><input name="telefon" type="tel" autocomplete="tel" placeholder="06 30 123 4567" required></label>
            </div>
            <label class="field"><span>E-mail <small>(ide küldjük a visszaigazolást)</small></span><input name="email" type="email" autocomplete="email" required></label>
            <label class="field"><span>Megjegyzés <small>(nem kötelező)</small></span><textarea name="megjegyzes" rows="3" placeholder="Pl. felirat a tortára, allergia, kapukód"></textarea></label>
          </section>

          <section class="panel" aria-labelledby="h-pay">
            <h2 class="ptitle" id="h-pay"><span class="num">4</span>Fizetés</h2>
            <div class="opts">
              <label class="opt"><input type="radio" name="fizetes" value="Átvételkor" checked><span><b>Fizetés átvételkor</b><small>Bankkártyával vagy készpénzzel</small></span></label>
              <label class="opt"><input type="radio" name="fizetes" value="Online" disabled><span><b>Online bankkártya</b><small>Hamarosan</small></span></label>
              <!-- TODO: online fizetés (pl. SimplePay / Stripe) bekötése -->
            </div>
          </section>
        </div>

        <aside class="panel summary" aria-labelledby="h-sum">
          <h2 class="ptitle" id="h-sum">Összesítő</h2>
          <div id="sum"></div>
          <label class="check"><input type="checkbox" name="aszf" required><span>Elfogadom az <a href="#">ÁSZF-et</a> és az <a href="#">adatkezelési tájékoztatót</a>.</span></label>
          <p class="form__err" id="err" role="alert"></p>
          <button class="btn btn--primary btn--lg btn--block" type="submit">Rendelés elküldése</button>
          <p class="safe"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Most nem kell fizetned, átvételkor rendezed.</p>
        </aside>
      </form>`;

    const form = $("#order");
    form.addEventListener("change", (e) => {
      if (e.target.name === "mod") { $("#addr").hidden = form.mod.value !== "kiszallitas"; syncDates(); renderSummary(); }
      if (e.target.name === "datum") syncSlots();
    });
    form.addEventListener("submit", submit);
    renderLines();
    renderSummary();
    syncDelivery();
    syncDates();
  }

  function renderLines() {
    $("#lines").innerHTML = SA.cart.lines().map((l) => `
      <li class="line">
        ${imgOrPh(l.p, "line__img")}
        <div>
          <h3><a href="termek.html?id=${l.p.id}">${esc(l.p.name)}</a></h3>
          <p class="line__meta">${esc(l.variant)} · ${SA.ft(l.price)}</p>
          <div class="line__ctrl">
            <div class="qty" role="group" aria-label="${esc(l.p.name)} mennyiség">
              <button type="button" data-step="${l.id}:${l.v}:-1" aria-label="Eggyel kevesebb">−</button>
              <output aria-live="polite">${l.qty}</output>
              <button type="button" data-step="${l.id}:${l.v}:1" aria-label="Eggyel több">+</button>
            </div>
            <button type="button" class="line__rm" data-rm="${l.id}:${l.v}">Törlés</button>
          </div>
        </div>
        <span class="line__total">${SA.ft(l.total)}</span>
      </li>`).join("");
  }

  function fee() {
    const form = $("#order");
    if (!form || form.mod.value !== "kiszallitas") return 0;
    return SA.cart.subtotal() >= C.FREE_DELIVERY_FROM ? 0 : C.DELIVERY_FEE;
  }

  function renderSummary() {
    const sub = SA.cart.subtotal(), f = fee(), n = SA.cart.count();
    const delivery = $("#order")?.mod.value === "kiszallitas";
    const left = Math.max(0, C.FREE_DELIVERY_FROM - sub);
    $("#sum").innerHTML = `
      <div class="sumrow"><span>Termékek (${n} db)</span><span>${SA.ft(sub)}</span></div>
      <div class="sumrow"><span>${delivery ? "Kiszállítás" : "Személyes átvétel"}</span><span>${f ? SA.ft(f) : "Ingyenes"}</span></div>
      ${delivery ? `<div class="freebar">${left ? `Még ${SA.ft(left)}, és ingyen visszük.` : "Ingyenes kiszállítás jár a rendelésedhez."}<div class="freebar__track"><div class="freebar__fill" style="width:${Math.min(100, (sub / C.FREE_DELIVERY_FROM) * 100)}%"></div></div></div>` : ""}
      <div class="sumrow sumrow--total"><span>Fizetendő</span><span>${SA.ft(sub + f)}</span></div>`;
  }

  // fagyit nem szállítunk ki
  function syncDelivery() {
    const opt = $("#opt-delivery");
    if (!opt) return;
    const frozen = hasFrozen();
    opt.disabled = frozen;
    $("#delivery-note").textContent = frozen ? "A fagyi miatt csak személyes átvétel lehetséges" : "Hűtött dobozban, a megadott idősávban";
    if (frozen && opt.checked) { $("#order").mod.value = "atvetel"; $("#addr").hidden = true; }
  }

  // ---------- dátum és idősáv ----------
  function earliest() {
    const now = new Date();
    const d = new Date(now); d.setHours(0, 0, 0, 0);
    let lead = SA.cart.leadDays();
    if ($("#order").mod.value === "kiszallitas") lead = Math.max(lead, 1);
    d.setDate(d.getDate() + lead);
    // aznapi átvétel csak zárás előtt 2 órával
    if (lead === 0 && now.getHours() >= C.HOURS[now.getDay()][1] - 2) d.setDate(d.getDate() + 1);
    return d;
  }

  function syncDates() {
    const form = $("#order");
    const min = earliest();
    form.datum.min = SA.iso(min);
    if (!form.datum.value || form.datum.value < form.datum.min) form.datum.value = form.datum.min;
    const lead = SA.cart.leadDays();
    const who = SA.cart.lines().filter((l) => l.p.lead === lead && lead > 0).map((l) => l.p.name);
    $("#lead-hint").textContent = lead > 0
      ? `Legkorábban ${min.toLocaleDateString("hu-HU", { month: "long", day: "numeric" })}, ${DAY[min.getDay()]} (a(z) ${who[0]} ${lead} napos elkészítési ideje miatt).`
      : `Legkorábban ${min.toLocaleDateString("hu-HU", { month: "long", day: "numeric" })}, ${DAY[min.getDay()]}. A pultos termékek akár aznapra is kérhetők.`;
    syncSlots();
  }

  function syncSlots() {
    const form = $("#order");
    const sel = form.idosav;
    const prev = sel.value;
    let slots;
    if (form.mod.value === "kiszallitas") slots = DELIVERY_SLOTS;
    else {
      const d = new Date(form.datum.value + "T00:00");
      const [o, c] = C.HOURS[isNaN(d) ? 1 : d.getDay()];
      slots = [];
      const isToday = form.datum.value === SA.iso(new Date());
      const nowH = new Date().getHours() + 1;
      // kétórás sávok, az utolsó a zárásig tart (pl. 18:00–19:00)
      for (let h = o; h < c; h += 2) if (!isToday || h >= nowH) slots.push(`${h}:00–${Math.min(h + 2, c)}:00`);
    }
    sel.innerHTML = slots.length ? slots.map((s) => `<option${s === prev ? " selected" : ""}>${s}</option>`).join("") : `<option value="">Erre a napra már nincs szabad idősáv</option>`;
  }

  // ---------- műveletek (a +/− léptetést a core.js kezeli: data-step) ----------
  document.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-rm]");
    if (rm) {
      const [id, v] = rm.dataset.rm.split(":");
      const p = SA.byId(id);
      SA.cart.remove(id, +v);
      SA.toast(`<strong>${esc(p.name)}</strong> kikerült a kosárból.`);
    }
  });

  document.addEventListener("cart:change", () => {
    if (mode !== "cart") return;
    if (!SA.cart.count()) { renderEmpty(); return; }
    if (!$("#order")) { renderCheckout(); return; }
    renderLines(); syncDelivery(); renderSummary(); syncDates();
  });

  async function submit(e) {
    e.preventDefault();
    const form = e.target, err = $("#err");
    form.querySelectorAll(".is-invalid").forEach((x) => { x.classList.remove("is-invalid"); x.removeAttribute("aria-invalid"); });
    const bad = [];
    const delivery = form.mod.value === "kiszallitas";
    if (!form.nev.value.trim()) bad.push(form.nev);
    if (!/^[+\d][\d\s/-]{7,}$/.test(form.telefon.value.trim())) bad.push(form.telefon);
    if (!form.email.value || !form.email.checkValidity()) bad.push(form.email);
    if (!form.datum.value || form.datum.value < form.datum.min) bad.push(form.datum);
    if (!form.idosav.value) bad.push(form.idosav);
    if (delivery) {
      if (!/^1\d{3}$/.test(form.irsz.value.trim())) bad.push(form.irsz);
      if (!form.cim.value.trim()) bad.push(form.cim);
    }
    if (bad.length) {
      bad.forEach((x) => { x.classList.add("is-invalid"); x.setAttribute("aria-invalid", "true"); });
      bad[0].focus();
      err.textContent = delivery && bad.includes(form.irsz) ? "Budapesti irányítószámot adj meg (1xxx), és töltsd ki a pirossal jelölt mezőket." : "Töltsd ki a pirossal jelölt mezőket.";
      return;
    }
    if (!form.aszf.checked) { err.textContent = "A rendeléshez fogadd el az ÁSZF-et és az adatkezelési tájékoztatót."; form.aszf.focus(); return; }
    err.textContent = "";

    const now = new Date();
    const no = `SA-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const f = Object.fromEntries(new FormData(form));
    const lines = SA.cart.lines();
    const sub = SA.cart.subtotal(), fe = fee();
    const order = {
      type: "webshop_rendeles", rendelesszam: no,
      tetelek: lines.map((l) => ({ termek: l.p.name, valtozat: l.variant, db: l.qty, egysegar: l.price, osszeg: l.total })),
      reszosszeg: sub, szallitasi_dij: fe, vegosszeg: sub + fe,
      atvetel: delivery ? "Kiszállítás" : "Személyes átvétel", datum: f.datum, idosav: f.idosav,
      cim: delivery ? `${f.irsz} ${f.varos}, ${f.cim}` : "Frankel Leó út 72.",
      nev: f.nev, telefon: f.telefon, email: f.email, megjegyzes: f.megjegyzes || "", fizetes: f.fizetes,
    };
    const body = [
      `Rendelésszám: ${no}`, "",
      ...lines.map((l) => `• ${l.p.name} (${l.variant}) × ${l.qty} = ${SA.ft(l.total)}`), "",
      `Részösszeg: ${SA.ft(sub)}`, `Szállítás: ${fe ? SA.ft(fe) : "0 Ft"}`, `Fizetendő: ${SA.ft(sub + fe)} (${f.fizetes})`, "",
      `${order.atvetel}: ${f.datum}, ${f.idosav}`, `Cím: ${order.cim}`, "",
      `Név: ${f.nev}`, `Telefon: ${f.telefon}`, `E-mail: ${f.email}`, `Megjegyzés: ${f.megjegyzes || "-"}`,
    ].join("\n");

    const btn = form.querySelector("[type=submit]");
    btn.disabled = true; btn.textContent = "Küldés…";
    const via = await SA.send(order, `Webshop rendelés ${no}`, body);
    mode = "done";
    SA.cart.clear();
    renderDone(order, lines, via, body);
  }

  function renderDone(order, lines, via, body) {
    setSteps(3);
    $("#page-title").textContent = "Köszönjük!";
    const d = new Date(order.datum + "T00:00");
    $("#view").innerHTML = `
      <div class="done">
        <div class="done__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
        <h2 tabindex="-1" id="done-title">${via === "crm" ? "Megkaptuk a rendelésed" : "Már csak el kell küldened"}</h2>
        <p>${via === "crm"
          ? `Visszaigazolást küldtünk a(z) <strong>${esc(order.email)}</strong> címre.`
          : "Megnyitottuk a rendelést az e-mail-programodban. Küldd el, és visszaigazoljuk."}</p>
        <span class="done__no">${esc(order.rendelesszam)}</span>
        <div class="panel">
          <ul class="lines">${lines.map((l) => `<li class="line">${imgOrPh(l.p, "line__img")}<div><h3>${esc(l.p.name)}</h3><p class="line__meta">${esc(l.variant)} × ${l.qty}</p></div><span class="line__total">${SA.ft(l.total)}</span></li>`).join("")}</ul>
          <div class="sumrow sumrow--total"><span>Fizetendő átvételkor</span><span>${SA.ft(order.vegosszeg)}</span></div>
          <div class="sumrow"><span>${esc(order.atvetel)}</span><span>${d.toLocaleDateString("hu-HU", { month: "long", day: "numeric" })}, ${esc(order.idosav)}</span></div>
          <div class="sumrow"><span>Cím</span><span>${esc(order.cim)}</span></div>
        </div>
        ${via === "mail" ? `<p><a class="btn btn--ghost" id="resend" href="mailto:${C.ORDER_EMAIL}?subject=${encodeURIComponent("Webshop rendelés " + order.rendelesszam)}&body=${encodeURIComponent(body)}">E-mail újbóli megnyitása</a></p>` : ""}
        <a class="btn btn--primary btn--lg" href="webshop.html">Vissza a webshopba</a>
      </div>`;
    $("#done-title").focus();
    window.scrollTo({ top: 0 });
  }

  function setSteps(n) {
    document.querySelectorAll("#steps li").forEach((li, i) => {
      li.classList.toggle("is-on", i === n - 1);
      li.classList.toggle("is-done", i < n - 1);
      if (i === n - 1) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (SA.cart.count()) renderCheckout(); else renderEmpty();
  });
})();
