/* Sütit akarok! – termékadatok és bolti beállítások.
   FIGYELEM: az árak MINTAÁRAK, a partnertől kell bekérni a valódi árlistát. */
window.SA = window.SA || {};

SA.CONFIG = {
  // Ha az AImpress CRM elkészül, ide jön a webhook URL. Üresen hagyva a rendelés e-mailben (mailto) megy.
  CRM_WEBHOOK_URL: "", // TODO: [[HIÁNYZIK: CRM_WEBHOOK_URL]]
  ORDER_EMAIL: "sutitakarok.abolt@gmail.com",
  PHONE: "+36309792948",
  PHONE_LABEL: "06 30 979 2948",
  DELIVERY_FEE: 2490,          // TODO: kiszállítás díja és zónái a partnertől (mintaár)
  FREE_DELIVERY_FROM: 25000,   // TODO: ingyenes kiszállítás határa (mintaérték)
  HOURS: { 0: [9, 19], 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [9, 19] }, // TODO: egyeztetni
};

SA.CATS = [
  { id: "all", label: "Összes" },
  { id: "torta", label: "Egész torták" },
  { id: "szelet", label: "Szeletek és dobozok" },
  { id: "gozgomboc", label: "Gőzgombóc" },
  { id: "fagyi", label: "Fagyi" },
  { id: "ajandek", label: "Ajándék" },
];

// lead = hány nappal előre kell rendelni (0 = aznap, ha van a pultban)
SA.PRODUCTS = [
  {
    id: "malnas-sajttorta", cat: "torta", name: "Málnás sajttorta", img: "img/termek/malnas-sajttorta.jpg",
    desc: "Krémes sajttorta vastag málnaréteggel, omlós kekszalapon.",
    badge: "Kedvenc", lead: 3,
    variants: [{ label: "8 szelet", price: 12900 }, { label: "12 szelet", price: 18900 }, { label: "16 szelet", price: 24900 }],
  },
  {
    id: "red-velvet-cheesecake", cat: "torta", name: "Red velvet cheesecake", img: "img/termek/red-velvet-cheesecake.jpg",
    desc: "Bársonyos red velvet és krémsajt rétegesen, gyümölcszselé-tetővel.",
    lead: 3,
    variants: [{ label: "8 szelet", price: 13900 }, { label: "12 szelet", price: 19900 }, { label: "16 szelet", price: 25900 }],
  },
  {
    id: "csokis-sajttorta", cat: "torta", name: "Csokoládés sajttorta", img: "img/termek/csokis-sajttorta.jpg",
    desc: "Vaníliás sajttorta étcsokoládé-öntettel és ropogós karamellás morzsával.",
    lead: 3,
    variants: [{ label: "8 szelet", price: 12900 }, { label: "12 szelet", price: 18900 }, { label: "16 szelet", price: 24900 }],
  },
  {
    id: "tejszines-csokitorta", cat: "torta", name: "Tejszínes csokitorta", img: "img/termek/tejszines-csokitorta.jpg",
    desc: "Csokoládékrémes torta tejszínrózsákkal és csokikorongokkal, szeletenként díszítve.",
    lead: 3,
    variants: [{ label: "12 szelet", price: 17900 }, { label: "16 szelet", price: 23900 }],
  },
  {
    id: "reteges-szelet", cat: "szelet", name: "Nagyis réteges szelet", img: "img/termek/reteges-szelet.jpg",
    desc: "Vékony lapok, házi lekvár és krém, csokimázzal. Pont olyan, mint a nagyié.",
    lead: 0,
    variants: [{ label: "1 szelet", price: 1490 }, { label: "4 szelet", price: 5590 }],
  },
  {
    id: "sajttorta-szelet", cat: "szelet", name: "Gesztenyés sajttorta-szelet", img: "img/termek/sajttorta-szelet.jpg",
    desc: "Krémsajt, gesztenyepüré és tejszínhab, piskótaalapon.",
    lead: 0,
    variants: [{ label: "1 szelet", price: 1590 }, { label: "4 szelet", price: 5990 }],
  },
  {
    id: "valogatott-doboz", cat: "szelet", name: "Válogatott sütisdoboz", img: "img/termek/valogatott-doboz.jpg",
    desc: "A napi pult legjobbjai egy dobozban, vendégvárónak vagy irodába.",
    badge: "Ajándéknak is", lead: 1,
    variants: [{ label: "6 szelet", price: 8990 }, { label: "12 szelet", price: 16990 }],
  },
  {
    id: "flodni", cat: "szelet", name: "Flódni", img: "",
    desc: "Mák, alma, dió és szilvalekvár rétegesen. Szerintünk Budapest legjobb flódnija.",
    badge: "Híres", lead: 0,
    variants: [{ label: "1 szelet", price: 1590 }, { label: "Egész tálca (12 szelet)", price: 17900 }],
  },
  {
    id: "indianer", cat: "szelet", name: "Indiáner", img: "img/termek/profiterol.jpg",
    desc: "Csokoládéba mártott, tejszínhabbal töltött klasszikus.",
    lead: 1,
    variants: [{ label: "4 db", price: 3990 }, { label: "8 db", price: 7590 }],
  },
  {
    id: "malnas-eclair", cat: "szelet", name: "Málnás éclair", img: "img/termek/malnas-eclair.jpg",
    desc: "Vaníliakrémes égetett tészta málnás mázzal és bogyós díszítéssel.",
    lead: 1,
    variants: [{ label: "4 db", price: 4390 }, { label: "8 db", price: 8390 }],
  },
  {
    id: "mini-sajttortak", cat: "szelet", name: "Mini sajttorták", img: "img/termek/mini-sajttortak.jpg",
    desc: "Négy kis sajttorta vegyes ízekben, szezonális díszítéssel.",
    lead: 2,
    variants: [{ label: "4 db", price: 5990 }, { label: "8 db", price: 11490 }],
  },
  {
    id: "tiramisu-tal", cat: "szelet", name: "Tiramisu tál", img: "img/termek/tiramisu-pohar.jpg",
    desc: "Kávés babapiskóta, mascarpone-krém és kakaó, közös tálban kanalazva.",
    lead: 2,
    variants: [{ label: "6 főre", price: 9490 }, { label: "12 főre", price: 17990 }],
  },
  {
    id: "gozgomboc", cat: "gozgomboc", name: "Gőzgombóc", img: "img/termek/gozgomboc.jpg",
    desc: "Szilvalekváros, vaníliasodóval és mákkal. Kb. 25 perc, mire elkészül, ezért rendeld elő.",
    badge: "Minden nap", lead: 0,
    variants: [{ label: "Klasszikus", price: 1890 }, { label: "Nutellás", price: 2190 }, { label: "Pisztáciás", price: 2390 }],
  },
  {
    id: "fagyi-doboz", cat: "fagyi", name: "Házi fagyi dobozban", img: "img/termek/fagyi-doboz.jpg",
    desc: "Két kedvenc ízed elvitelre. Festék nélkül, természetes alapanyagokból.",
    lead: 0,
    variants: [{ label: "500 ml", price: 3990 }, { label: "1000 ml", price: 7490 }],
  },
  {
    id: "jegkrem", cat: "fagyi", name: "Gyümölcsös jégkrém", img: "img/termek/jegkrem.jpg",
    desc: "Pálcikás jégkrém valódi gyümölcsből. Van vegán és mindenmentes is.",
    lead: 0,
    variants: [{ label: "1 db", price: 990 }, { label: "4 db", price: 3690 }],
  },
  {
    id: "adventi-naptar", cat: "ajandek", name: "Adventi naptár", img: "",
    desc: "24 meglepicsomag és 2 cukiság, minden decemberi napra egy.",
    badge: "Limitált", lead: 3,
    variants: [{ label: "1 db", price: 11990 }],
  },
];

SA.byId = (id) => SA.PRODUCTS.find((p) => p.id === id);
SA.ft = (n) => new Intl.NumberFormat("hu-HU").format(n) + " Ft";
