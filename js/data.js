/* Sütit akarok! – termékadatok és bolti beállítások.
   FIGYELEM: az árak MINTAÁRAK, a termékleírások javaslatok. A valódi kínálatot és árlistát a partnertől kell bekérni. */
window.SA = window.SA || {};

SA.CONFIG = {
  CRM_WEBHOOK_URL: "", // TODO: [[HIÁNYZIK: CRM_WEBHOOK_URL]] – üresen a rendelés e-mailben (mailto) megy
  ORDER_EMAIL: "sutitakarok.abolt@gmail.com",
  PHONE: "+36309792948",
  PHONE_LABEL: "06 30 979 2948",
  ADDRESS: "1023 Budapest, Frankel Leó út 72.",
  MAPS_URL: "https://www.google.com/maps/dir/?api=1&destination=Budapest%2C%20Frankel%20Le%C3%B3%20%C3%BAt%2072",
  INSTAGRAM: "https://www.instagram.com/sutitakarok/",
  FACEBOOK: "https://www.facebook.com/sutitakarokblog/",
  DELIVERY_FEE: 2490,          // TODO: kiszállítás díja és zónái (mintaérték)
  FREE_DELIVERY_FROM: 25000,   // TODO: ingyenes kiszállítás határa (mintaérték)
  HOURS: { 0: [9, 19], 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [9, 19] }, // TODO: egyeztetni
};

SA.CATS = [
  { id: "all", label: "Összes" },
  { id: "torta", label: "Egész torták" },
  { id: "szelet", label: "Sütik és dobozok" },
  { id: "gozgomboc", label: "Gőzgombóc" },
  { id: "fagyi", label: "Fagyi" },
  { id: "ajandek", label: "Ajándék" },
];

// lead = hány nappal előre kell rendelni (0 = aznap, ha van a pultban); rank = ajánlott sorrend
SA.PRODUCTS = [
  { id: "malnas-sajttorta", cat: "torta", name: "Málnás sajttorta", img: "img/termek/malnas-sajttorta.jpg", badge: "Kedvenc", lead: 3, featured: true,
    desc: "Krémes sajttorta vastag málnaréteggel, omlós kekszalapon.",
    long: "Selymes, vaníliás krémsajtos töltelék vajas kekszalapon, a tetején sűrű, savanykás málnaréteggel. Ünnepi asztalra, születésnapra, vagy csak mert sütit akarsz.",
    variants: [{ label: "8 szelet", price: 12900 }, { label: "12 szelet", price: 18900 }, { label: "16 szelet", price: 24900 }] },
  { id: "red-velvet-cheesecake", cat: "torta", name: "Red velvet cheesecake", img: "img/termek/red-velvet-cheesecake.jpg", lead: 3,
    desc: "Bársonyos red velvet és krémsajt rétegesen, gyümölcszselé-tetővel.",
    long: "A red velvet kakaós, bársonyos piskótája találkozik a sajttorta krémes rétegével. A tetejére gyümölcszselé kerül, így egyszerre gazdag és friss.",
    variants: [{ label: "8 szelet", price: 13900 }, { label: "12 szelet", price: 19900 }, { label: "16 szelet", price: 25900 }] },
  { id: "csokis-sajttorta", cat: "torta", name: "Csokoládés sajttorta", img: "img/termek/csokis-sajttorta.jpg", lead: 3, featured: true,
    desc: "Vaníliás sajttorta étcsokoládé-öntettel és karamellás morzsával.",
    long: "Klasszikus, sűrű sajttorta, a tetején étcsokoládé-öntet és ropogós, karamellás morzsa. Annak, aki a csokit és a sajttortát egyszerre akarja.",
    variants: [{ label: "8 szelet", price: 12900 }, { label: "12 szelet", price: 18900 }, { label: "16 szelet", price: 24900 }] },
  { id: "tejszines-csokitorta", cat: "torta", name: "Tejszínes csokitorta", img: "img/termek/tejszines-csokitorta.jpg", lead: 3,
    desc: "Csokoládékrémes torta tejszínrózsákkal, szeletenként díszítve.",
    long: "Csokoládékrémes torta, amelynek minden szeletére tejszínrózsa és csokikorong kerül. Szépen szeletelhető, ezért nagyobb társaságnak is ideális.",
    variants: [{ label: "12 szelet", price: 17900 }, { label: "16 szelet", price: 23900 }] },
  { id: "flodni", cat: "szelet", name: "Flódni", img: "", badge: "Híres", lead: 0, featured: true,
    desc: "Mák, alma, dió és szilvalekvár rétegesen.",
    long: "A klasszikus magyar-zsidó sütemény négy töltelékkel: mák, alma, dió és szilvalekvár, omlós tésztalapok között. Szerintünk Budapest legjobb flódnija, és fagyiként is megkóstolhatod nálunk.",
    variants: [{ label: "1 szelet", price: 1590 }, { label: "Egész tálca (12 szelet)", price: 17900 }] },
  { id: "valogatott-doboz", cat: "szelet", name: "Válogatott sütisdoboz", img: "img/termek/valogatott-doboz.jpg", badge: "Ajándéknak is", lead: 1, featured: true,
    desc: "A napi pult legjobbjai egy dobozban.",
    long: "Mi válogatjuk össze a napi pult legjobbjait: krémeseket, réteseseket, gyümölcsöseket. Vendégvárónak, irodába vagy ajándéknak.",
    variants: [{ label: "6 szelet", price: 8990 }, { label: "12 szelet", price: 16990 }] },
  { id: "reteges-szelet", cat: "szelet", name: "Nagyis réteges szelet", img: "img/termek/reteges-szelet.jpg", lead: 0,
    desc: "Vékony lapok, házi lekvár és krém, csokimázzal.",
    long: "Vékony tésztalapok, házi lekvár és puha krém, a tetején fényes csokimázzal. Pont olyan, mint amit a nagyi sütött vasárnapra.",
    variants: [{ label: "1 szelet", price: 1490 }, { label: "4 szelet", price: 5590 }] },
  { id: "sajttorta-szelet", cat: "szelet", name: "Gesztenyés sajttorta-szelet", img: "img/termek/sajttorta-szelet.jpg", lead: 0,
    desc: "Krémsajt, gesztenyepüré és tejszínhab.",
    long: "Krémsajtos alap, gesztenyepüré-réteg és könnyű tejszínhab, piskótán. Az őszi gesztenyés napok kedvence.",
    variants: [{ label: "1 szelet", price: 1590 }, { label: "4 szelet", price: 5990 }] },
  { id: "indianer", cat: "szelet", name: "Indiáner", img: "img/termek/profiterol.jpg", lead: 1,
    desc: "Csokoládéba mártott, tejszínhabbal töltött klasszikus.",
    long: "Könnyű tészta, bőséges tejszínhab-töltelék és csokoládébevonat. Egy klasszikus cukrászdai kedvenc, ahogy mi szeretjük.",
    variants: [{ label: "4 db", price: 3990 }, { label: "8 db", price: 7590 }] },
  { id: "malnas-eclair", cat: "szelet", name: "Málnás éclair", img: "img/termek/malnas-eclair.jpg", lead: 1,
    desc: "Vaníliakrémes égetett tészta málnás mázzal.",
    long: "Ropogós égetett tészta, vaníliakrém-töltelék és élénk málnás máz, bogyós díszítéssel. Szép a desszertasztalon és ajándékdobozban is.",
    variants: [{ label: "4 db", price: 4390 }, { label: "8 db", price: 8390 }] },
  { id: "mini-sajttortak", cat: "szelet", name: "Mini sajttorták", img: "img/termek/mini-sajttortak.jpg", lead: 2,
    desc: "Kis sajttorták vegyes ízekben, szezonális díszítéssel.",
    long: "Egyszemélyes sajttorták vegyes gyümölcsös és csokis ízekben. A díszítés évszakonként változik.",
    variants: [{ label: "4 db", price: 5990 }, { label: "8 db", price: 11490 }] },
  { id: "tiramisu-tal", cat: "szelet", name: "Tiramisu tál", img: "img/termek/tiramisu-pohar.jpg", lead: 2,
    desc: "Kávés babapiskóta, mascarpone-krém és kakaó.",
    long: "Kávéba mártott babapiskóta, könnyű mascarpone-krém és kakaó egy nagy tálban, közös kanalazáshoz. Családi ebéd után tökéletes.",
    variants: [{ label: "6 főre", price: 9490 }, { label: "12 főre", price: 17990 }] },
  { id: "gozgomboc", cat: "gozgomboc", name: "Gőzgombóc", img: "img/termek/gozgomboc.jpg", badge: "Minden nap", lead: 0, featured: true,
    desc: "Szilvalekváros, vaníliasodóval és mákkal.",
    long: "Puha, gőzölt kelt tészta szilvalekvárral töltve, meleg vaníliasodóval és mákszórással. Hétvégén nutellás és pisztáciás is van. Kb. 25 perc, mire elkészül, ezért érdemes előre rendelni.",
    variants: [{ label: "Klasszikus", price: 1890 }, { label: "Nutellás", price: 2190 }, { label: "Pisztáciás", price: 2390 }] },
  { id: "fagyi-doboz", cat: "fagyi", name: "Házi fagyi dobozban", img: "img/termek/fagyi-doboz.jpg", lead: 0, featured: true,
    desc: "Két kedvenc ízed elvitelre, festék nélkül.",
    long: "Természetes alapanyagokból, festék nélkül készülő fagyi, sűrűbb állaggal és valódi ízekkel. Válassz két ízt a pultból, és vidd haza.",
    variants: [{ label: "500 ml", price: 3990 }, { label: "1000 ml", price: 7490 }] },
  { id: "jegkrem", cat: "fagyi", name: "Gyümölcsös jégkrém", img: "img/termek/jegkrem.jpg", lead: 0,
    desc: "Pálcikás jégkrém valódi gyümölcsből.",
    long: "Pálcikás jégkrém valódi gyümölcsből. Van vegán és mindenmentes változat is.",
    variants: [{ label: "1 db", price: 990 }, { label: "4 db", price: 3690 }] },
  { id: "adventi-naptar", cat: "ajandek", name: "Adventi naptár", img: "", badge: "Limitált", lead: 3,
    desc: "24 meglepicsomag és 2 cukiság.",
    long: "Minden decemberi napra jut egy meglepicsomag, a végére pedig még 2 cukiság. Ajándéknak is tökéletes annak, aki nagyon sütit akar. Átvétel a boltban.",
    variants: [{ label: "1 db", price: 11990 }] },
];

SA.byId = (id) => SA.PRODUCTS.find((p) => p.id === id);
SA.ft = (n) => new Intl.NumberFormat("hu-HU").format(n) + " Ft";
SA.minPrice = (p) => Math.min(...p.variants.map((v) => v.price));
SA.leadText = (p) => (p.lead >= 2 ? `${p.lead} nappal előre rendeld` : p.lead === 1 ? "Előző napig rendeld" : "Akár aznapra");
