/* Sütit akarok! – a kosár külön ablakban (natív <dialog>), benne a teljes rendelés:
   1. Kosár → 2. Adatok → 3. Kész. Minden oldalról elérhető (fejléc, toast, lábléc, #kosar link). */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => SA.esc(s);
  const C = SA.CONFIG;
  const DAY = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
  const DELIVERY_SLOTS = ["10:00–14:00", "14:00–18:00"]; // TODO: kiszállítási idősávok a partnertől
  const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  let view = "cart";          // cart | checkout | done
  const draft = { mod: "atvetel", fizetes: "Átvételkor" }; // az űrlap tartalma lépések között is megmarad
  let win, body;

  const thumb = (p, cls = "line__img") => (p.img ? `<img class="${cls}" src="${p.img}" alt="" width="96" height="96">` : SA.ph(p, `${cls} ph`));
  const hasFrozen = () => SA.cart.lines().some((l) => l.p.cat === "fagyi");
  const isDelivery = () => draft.mod === "kiszallitas" && !hasFrozen();
  const fee = () => (isDelivery() && SA.cart.subtotal() < C.FREE_DELIVERY_FROM ? C.DELIVERY_FEE : 0);

  function build() {
    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="win" id="cartwin" aria-labelledby="win-title">
        <div class="win__head">
          <div class="win__titles">
            <p class="win__title" id="win-title">Kosár</p>
            <ol class="wsteps" id="wsteps" aria-label="A rendelés lépései">
              <li><i>01</i>Kosár</li><li><i>02</i>Adatok</li><li><i>03</i>Kész</li>
            </ol>
          </div>
          <button type="button" class="iconbtn" data-close-win aria-label="Kosár ablak bezárása">${CLOSE}</button>
        </div>
        <div class="win__body" id="win-body"></div>
      </dialog>`);
    win = $("#cartwin");
    body = $("#win-body");
    win.addEventListener("click", (e) => {
      if (e.target === win || e.target.closest("[data-close-win]")) close();
      const go = e.target.closest("[data-go]");
      if (go) { e.preventDefault(); show(go.dataset.go); }
      const rm = e.target.closest("[data-rm]");
      if (rm) { const [id, v] = rm.dataset.rm.split(":"); SA.cart.remove(id, +v); }
    });
    win.addEventListener("close", () => {
      document.body.classList.remove("win-open");
      if (view === "done") view = "cart";
      if (location.hash === "#kosar") history.replaceState(null, "", location.pathname + location.search);
    });
  }

  function open() {
    if (!win) build();
    if (view === "done") view = "cart";
    if (view === "checkout" && !SA.cart.count()) view = "cart";
    show(view);
    document.body.classList.add("win-open");
    if (!win.open) win.showModal();
  }
  function close() { if (win && win.open) win.close(); }
  SA.openCart = open;
  SA.closeCart = close;

  function setSteps(n) {
    win.querySelectorAll("#wsteps li").forEach((li, i) => {
      li.classList.toggle("is-on", i === n - 1);
      li.classList.toggle("is-done", i < n - 1);
      if (i === n - 1) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
  }

  function show(v) {
    view = v;
    if (v === "cart") renderCart();
    if (v === "checkout") renderCheckout();
    body.scrollTop = 0;
  }

  // ---------- 1. KOSÁR ----------
  function summaryHTML(withLines) {
    const sub = SA.cart.subtotal(), f = fee(), n = SA.cart.count();
    const left = Math.max(0, C.FREE_DELIVERY_FROM - sub);
    return `
      ${withLines ? `<ul class="mini">${SA.cart.lines().map((l) => `<li class="mini__line">${thumb(l.p, "mini__img")}<div><p class="mini__name">${esc(l.p.name)}</p><p class="mini__var">${esc(l.variant)} × ${l.qty}</p></div><span class="mini__total">${SA.ft(l.total)}</span></li>`).join("")}</ul>` : ""}
      <div class="sumrow"><span>Termékek · ${n} db</span><span>${SA.ft(sub)}</span></div>
      <div class="sumrow"><span>${isDelivery() ? "Kiszállítás" : "Személyes átvétel"}</span><span>${f ? SA.ft(f) : "Ingyenes"}</span></div>
      <div class="freebar"><span>${left ? `Még <b>${SA.ft(left)}</b> az ingyenes kiszállításig` : "Ingyenes kiszállítás jár a rendelésedhez"}</span><div class="freebar__track"><div class="freebar__fill" style="width:${Math.min(100, (sub / C.FREE_DELIVERY_FROM) * 100)}%"></div></div></div>
      <div class="sumrow sumrow--total"><span>Fizetendő</span><span>${SA.ft(sub + f)}</span></div>`;
  }

  function renderCart() {
    setSteps(1);
    const lines = SA.cart.lines();
    if (!lines.length) {
      const picks = ["malnas-sajttorta", "gozgomboc", "valogatott-doboz"].map(SA.byId).filter(Boolean);
      body.innerHTML = `
        <div class="wempty">
          <img src="img/logo-240.png" alt="" width="72" height="72">
          <p class="wempty__t">Üres a kosarad</p>
          <p class="muted">Pedig tudjuk, hogy sütit akarsz.</p>
          <div class="wempty__picks">${picks.map((p) => `<button type="button" class="pick" data-add="${p.id}" data-v="0">${thumb(p, "pick__img")}<span>${esc(p.name)}<small>${SA.ft(p.variants[0].price)}</small></span><i>+</i></button>`).join("")}</div>
          <a class="btn btn--ghost" href="webshop.html">Teljes kínálat ${ARROW}</a>
        </div>`;
      return;
    }
    body.innerHTML = `
      <div class="wgrid">
        <ul class="lines" aria-label="Kosár tételei">${lines.map((l) => `
          <li class="line">
            ${thumb(l.p)}
            <div>
              <h3><a href="termek.html?id=${l.p.id}">${esc(l.p.name)}</a></h3>
              <p class="line__meta">${esc(l.variant)} · ${SA.ft(l.price)}</p>
              <div class="line__ctrl">
                <div class="qty qty--sm" role="group" aria-label="${esc(l.p.name)} mennyiség">
                  <button type="button" data-step="${l.id}:${l.v}:-1" aria-label="Eggyel kevesebb">−</button><output aria-live="polite">${l.qty}</output><button type="button" data-step="${l.id}:${l.v}:1" aria-label="Eggyel több">+</button>
                </div>
                <button type="button" class="line__rm" data-rm="${l.id}:${l.v}">Törlés</button>
              </div>
            </div>
            <span class="line__total">${SA.ft(l.total)}</span>
          </li>`).join("")}
        </ul>
        <aside class="wsum">
          ${summaryHTML(false)}
          <button type="button" class="btn btn--primary btn--block btn--lg" data-go="checkout">Tovább az adatokhoz ${ARROW}</button>
          <button type="button" class="btn btn--text btn--block" data-close-win>Vásárlás folytatása</button>
        </aside>
      </div>`;
  }

  // ---------- 2. ADATOK ----------
  function renderCheckout() {
    setSteps(2);
    const frozen = hasFrozen();
    if (frozen) draft.mod = "atvetel";
    const d = draft;
    const v = (k) => esc(d[k] || "");
    body.innerHTML = `
      <form class="wgrid" id="order" novalidate>
        <div class="wform">
          <fieldset class="fset">
            <legend>Átvétel</legend>
            <div class="opts">
              <label class="opt"><input type="radio" name="mod" value="atvetel"${d.mod !== "kiszallitas" ? " checked" : ""}><span><b>Személyes átvétel</b><small>Frankel Leó út 72. · ingyenes</small></span></label>
              <label class="opt"><input type="radio" name="mod" value="kiszallitas"${d.mod === "kiszallitas" ? " checked" : ""}${frozen ? " disabled" : ""}><span><b>Kiszállítás Budapesten</b><small>${frozen ? "A fagyi miatt nem elérhető" : `${SA.ft(C.DELIVERY_FEE)} · ${SA.ft(C.FREE_DELIVERY_FROM)} felett ingyen`}</small></span></label>
            </div>
            <div class="addr" id="addr"${d.mod === "kiszallitas" ? "" : " hidden"}>
              <div class="grid2">
                <label class="field"><span>Irányítószám</span><input name="irsz" inputmode="numeric" autocomplete="postal-code" maxlength="4" placeholder="1023" value="${v("irsz")}"></label>
                <label class="field"><span>Település</span><input name="varos" autocomplete="address-level2" value="${d.varos ? v("varos") : "Budapest"}"></label>
              </div>
              <label class="field"><span>Utca, házszám, emelet, ajtó</span><input name="cim" autocomplete="street-address" value="${v("cim")}"></label>
            </div>
            <div class="grid2">
              <label class="field"><span>Dátum</span><input type="date" name="datum" required value="${v("datum")}"></label>
              <label class="field"><span>Idősáv</span><select name="idosav" required></select></label>
            </div>
            <p class="hint" id="lead-hint"></p>
          </fieldset>
          <fieldset class="fset">
            <legend>Adataid</legend>
            <div class="grid2">
              <label class="field"><span>Teljes név</span><input name="nev" autocomplete="name" required value="${v("nev")}"></label>
              <label class="field"><span>Telefonszám</span><input name="telefon" type="tel" autocomplete="tel" placeholder="06 30 123 4567" required value="${v("telefon")}"></label>
            </div>
            <label class="field"><span>E-mail <small>ide küldjük a visszaigazolást</small></span><input name="email" type="email" autocomplete="email" required value="${v("email")}"></label>
            <label class="field"><span>Megjegyzés <small>nem kötelező</small></span><textarea name="megjegyzes" rows="2" placeholder="Felirat a tortára, allergia, kapukód">${v("megjegyzes")}</textarea></label>
          </fieldset>
          <fieldset class="fset">
            <legend>Fizetés</legend>
            <div class="opts">
              <label class="opt"><input type="radio" name="fizetes" value="Átvételkor" checked><span><b>Átvételkor</b><small>Bankkártya vagy készpénz</small></span></label>
              <label class="opt"><input type="radio" name="fizetes" value="Online" disabled><span><b>Online bankkártya</b><small>Hamarosan</small></span></label>
              <!-- TODO: online fizetés (pl. SimplePay / Stripe) -->
            </div>
          </fieldset>
        </div>
        <aside class="wsum">
          <div id="sum">${summaryHTML(true)}</div>
          <label class="check"><input type="checkbox" name="aszf"${d.aszf ? " checked" : ""}><span>Elfogadom az <a href="#">ÁSZF-et</a> és az <a href="#">adatkezelési tájékoztatót</a>.</span></label>
          <p class="form__err" id="err" role="alert"></p>
          <button class="btn btn--primary btn--block btn--lg" type="submit">Rendelés elküldése</button>
          <button type="button" class="btn btn--text btn--block" data-go="cart">Vissza a kosárhoz</button>
          <p class="safe">Most nem kell fizetned, átvételkor rendezed.</p>
        </aside>
      </form>`;
    const form = $("#order", body);
    form.addEventListener("input", saveDraft);
    form.addEventListener("change", (e) => {
      saveDraft();
      if (e.target.name === "mod") { $("#addr", body).hidden = draft.mod !== "kiszallitas"; syncDates(); $("#sum", body).innerHTML = summaryHTML(true); }
      if (e.target.name === "datum") syncSlots();
    });
    form.addEventListener("submit", submit);
    syncDates();
  }

  function saveDraft() {
    const form = $("#order", body);
    if (!form) return;
    const f = new FormData(form);
    for (const [k, val] of f.entries()) draft[k] = val;
    draft.aszf = form.aszf.checked;
  }

  function earliest() {
    const now = new Date();
    const d = new Date(now); d.setHours(0, 0, 0, 0);
    let lead = SA.cart.leadDays();
    if (isDelivery()) lead = Math.max(lead, 1);
    d.setDate(d.getDate() + lead);
    if (lead === 0 && now.getHours() >= C.HOURS[now.getDay()][1] - 2) d.setDate(d.getDate() + 1); // aznap csak zárás előtt 2 órával
    return d;
  }

  function syncDates() {
    const form = $("#order", body);
    const min = earliest();
    form.datum.min = SA.iso(min);
    if (!form.datum.value || form.datum.value < form.datum.min) form.datum.value = form.datum.min;
    const lead = SA.cart.leadDays();
    const who = SA.cart.lines().find((l) => l.p.lead === lead && lead > 0);
    const when = `${min.toLocaleDateString("hu-HU", { month: "long", day: "numeric" })}, ${DAY[min.getDay()]}`;
    $("#lead-hint", body).textContent = who
      ? `Legkorábban ${when}: a(z) ${who.p.name} ${lead} napos elkészítési ideje miatt.`
      : `Legkorábban ${when}. A pultos termékek akár aznapra is kérhetők.`;
    syncSlots();
    saveDraft();
  }

  function syncSlots() {
    const form = $("#order", body);
    const sel = form.idosav, prev = draft.idosav;
    let slots;
    if (isDelivery()) slots = DELIVERY_SLOTS;
    else {
      const d = new Date(form.datum.value + "T00:00");
      const [o, c] = C.HOURS[isNaN(d) ? 1 : d.getDay()];
      const isToday = form.datum.value === SA.iso(new Date());
      const nowH = new Date().getHours() + 1;
      slots = [];
      for (let h = o; h < c; h += 2) if (!isToday || h >= nowH) slots.push(`${h}:00–${Math.min(h + 2, c)}:00`);
    }
    sel.innerHTML = slots.length ? slots.map((s) => `<option${s === prev ? " selected" : ""}>${s}</option>`).join("") : `<option value="">Erre a napra már nincs szabad idősáv</option>`;
  }

  async function submit(e) {
    e.preventDefault();
    const form = e.target, err = $("#err", body);
    saveDraft();
    form.querySelectorAll(".is-invalid").forEach((x) => { x.classList.remove("is-invalid"); x.removeAttribute("aria-invalid"); });
    const bad = [];
    const delivery = isDelivery();
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
      err.textContent = delivery && bad.includes(form.irsz) ? "Budapesti irányítószámot adj meg (1xxx), és töltsd ki a jelölt mezőket." : "Töltsd ki a jelölt mezőket.";
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
    const text = [
      `Rendelésszám: ${no}`, "",
      ...lines.map((l) => `• ${l.p.name} (${l.variant}) × ${l.qty} = ${SA.ft(l.total)}`), "",
      `Részösszeg: ${SA.ft(sub)}`, `Szállítás: ${fe ? SA.ft(fe) : "0 Ft"}`, `Fizetendő: ${SA.ft(sub + fe)} (${f.fizetes})`, "",
      `${order.atvetel}: ${f.datum}, ${f.idosav}`, `Cím: ${order.cim}`, "",
      `Név: ${f.nev}`, `Telefon: ${f.telefon}`, `E-mail: ${f.email}`, `Megjegyzés: ${f.megjegyzes || "-"}`,
    ].join("\n");

    const btn = form.querySelector("[type=submit]");
    btn.disabled = true; btn.textContent = "Küldés…";
    const via = await SA.send(order, `Webshop rendelés ${no}`, text);
    view = "done";
    SA.cart.clear();
    ["nev", "telefon", "email", "megjegyzes", "irsz", "cim", "datum", "idosav", "aszf"].forEach((k) => delete draft[k]);
    renderDone(order, lines, via, text);
  }

  // ---------- 3. KÉSZ ----------
  function renderDone(order, lines, via, text) {
    setSteps(3);
    const d = new Date(order.datum + "T00:00");
    body.innerHTML = `
      <div class="wdone">
        <div class="wdone__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
        <p class="wdone__t" tabindex="-1" id="done-title">${via === "crm" ? "Megkaptuk a rendelésed" : "Már csak el kell küldened"}</p>
        <p class="muted">${via === "crm" ? `Visszaigazolást küldtünk a(z) <b>${esc(order.email)}</b> címre.` : "Megnyitottuk a rendelést az e-mail-programodban. Küldd el, és visszaigazoljuk."}</p>
        <p class="wdone__no">${esc(order.rendelesszam)}</p>
        <div class="wdone__box">
          ${lines.map((l) => `<div class="sumrow"><span>${esc(l.p.name)} · ${esc(l.variant)} × ${l.qty}</span><span>${SA.ft(l.total)}</span></div>`).join("")}
          <div class="sumrow"><span>${esc(order.atvetel)}</span><span>${d.toLocaleDateString("hu-HU", { month: "long", day: "numeric" })} · ${esc(order.idosav)}</span></div>
          <div class="sumrow sumrow--total"><span>Fizetendő átvételkor</span><span>${SA.ft(order.vegosszeg)}</span></div>
        </div>
        <div class="wdone__btns">
          ${via === "mail" ? `<a class="btn btn--ghost" href="mailto:${C.ORDER_EMAIL}?subject=${encodeURIComponent("Webshop rendelés " + order.rendelesszam)}&body=${encodeURIComponent(text)}">E-mail újbóli megnyitása</a>` : ""}
          <button type="button" class="btn btn--primary" data-close-win>Bezárás</button>
        </div>
      </div>`;
    $("#done-title", body).focus();
  }

  document.addEventListener("cart:change", () => {
    if (!win || !win.open) return;
    if (view === "cart") renderCart();
    else if (view === "checkout") {
      if (!SA.cart.count()) { show("cart"); return; }
      $("#sum", body).innerHTML = summaryHTML(true);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (location.hash === "#kosar") open();
  });
  window.addEventListener("hashchange", () => { if (location.hash === "#kosar") open(); });
})();
