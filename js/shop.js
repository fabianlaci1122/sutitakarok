/* Sütit akarok! – webshop oldal: kategória, keresés, rendezés (az URL-ben is megmarad) */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const state = {
    cat: SA.CATS.some((c) => c.id === params.get("cat")) ? params.get("cat") : "all",
    q: params.get("q") || "",
    sort: params.get("sort") || "rec",
  };
  $("#q").value = state.q;
  $("#sort").value = state.sort;

  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function sync() {
    const p = new URLSearchParams();
    if (state.cat !== "all") p.set("cat", state.cat);
    if (state.q) p.set("q", state.q);
    if (state.sort !== "rec") p.set("sort", state.sort);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
  }

  function renderChips() {
    $("#chips").innerHTML = SA.CATS.map((c) => {
      const n = c.id === "all" ? SA.PRODUCTS.length : SA.PRODUCTS.filter((p) => p.cat === c.id).length;
      const on = c.id === state.cat;
      return `<button type="button" role="tab" class="chip${on ? " is-on" : ""}" aria-selected="${on}" data-cat="${c.id}">${SA.esc(c.label)}<span>${n}</span></button>`;
    }).join("");
  }

  function renderGrid() {
    const q = norm(state.q.trim());
    let list = SA.PRODUCTS.filter((p) => (state.cat === "all" || p.cat === state.cat) && (!q || norm(p.name + " " + p.desc).includes(q)));
    if (state.sort === "asc") list = [...list].sort((a, b) => SA.minPrice(a) - SA.minPrice(b));
    if (state.sort === "desc") list = [...list].sort((a, b) => SA.minPrice(b) - SA.minPrice(a));
    if (state.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "hu"));
    $("#count").textContent = `${list.length} termék`;
    $("#grid").innerHTML = list.length
      ? list.map((p, i) => SA.card(p).replace('class="card"', `class="card reveal${i % 4 ? " d-" + (i % 4) : ""}"`)).join("")
      : `<div class="noresult"><p class="script">Ilyet most nem sütöttünk</p><p>Próbálj másik kategóriát vagy keresőszót, vagy <a href="egyedi-torta.html">kérj egyedi ajánlatot</a>.</p></div>`;
    SA.observeReveal($("#grid"));
  }

  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    state.cat = b.dataset.cat;
    renderChips(); renderGrid(); sync();
  });
  let t;
  $("#q").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; renderGrid(); sync(); }, 120); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); sync(); });

  renderChips();
  renderGrid();
});
