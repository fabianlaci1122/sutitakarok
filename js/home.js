/* Sütit akarok! – főoldal */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);

  // kiemelt termékek sávja
  const rail = $("#rail");
  rail.innerHTML = SA.PRODUCTS.filter((p) => p.featured).map(SA.card).join("");
  document.querySelectorAll("[data-rail]").forEach((b) => b.addEventListener("click", () => {
    const card = rail.querySelector(".card");
    const step = card ? card.getBoundingClientRect().width + 28 : 300;
    rail.scrollBy({ left: step * +b.dataset.rail, behavior: "smooth" });
  }));

  // adventi naptár (decemberben a mai ajtó kiemelve)
  const now = new Date();
  const today = now.getMonth() === 11 && now.getDate() <= 24 ? now.getDate() : 0;
  const order = [7, 18, 3, 12, 22, 1, 15, 9, 20, 5, 24, 11, 2, 17, 8, 23, 14, 4, 19, 10, 6, 21, 13, 16];
  $("#cal-grid").innerHTML = order.map((n) => `<span${n === today ? ' class="is-today"' : ""}>${n}</span>`).join("");

  // nyitvatartás és élő állapot
  $("#hours").innerHTML = SA.hoursTable();
});
