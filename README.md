# Sütit akarok! – weboldal és webshop

Többoldalas, statikus weboldal és webshop a **Sütit akarok!** cukrászdának és fagyizónak
(1023 Budapest, Frankel Leó út 72.). Nincs build-lépés és függőség: HTML-oldalakból,
egy közös stíluslapból és néhány sima JavaScript-fájlból áll.

## Futtatás helyben

Bármilyen statikus szerverrel elindítható. Windows alatt a mellékelt PowerShell-szerver is jó:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 8140
```

Utána nyisd meg a böngészőben: http://localhost:8140

## Felépítés

| Fájl / mappa | Tartalom |
|---|---|
| `index.html` | Főoldal: hero, kiemelt termékek sávja, kategóriák, történet, adventi naptár, egyedi torta, sajtó, látogatás |
| `webshop.html` | Teljes kínálat kategóriaszűrővel, kereséssel és rendezéssel (a beállítás az URL-ben is megmarad, pl. `?cat=torta`) |
| `termek.html?id=…` | Termékoldal: méretválasztó, mennyiség, információs blokkok, kapcsolódó termékek, mobilon rögzített kosár-sáv |
| `egyedi-torta.html` | Egyedi torta, esküvői torta, desszertasztal, a folyamat lépései és az ajánlatkérő űrlap |
| `rolunk.html` | Gerti és Ati története, idővonal, értékek, galéria, sajtó |
| `kapcsolat.html` | Cím, útvonal, nyitvatartás, elérhetőségek, térkép |
| `kosar.html` | Csak átirányítás a régi linkekhez: a főoldalra visz, ahol a kosár ablaka magától megnyílik (`index.html#kosar`) |
| `styles.css` | Közös stílusok. A színek (a logóból) és a betűk a `:root` változókban vannak |
| `js/data.js` | **Termékek, árak, beállítások** (`SA.CONFIG`, `SA.CATS`, `SA.PRODUCTS`). Itt kell módosítani a kínálatot |
| `js/core.js` | Minden oldalra: kosár (localStorage), infósáv és fejléc (logó és név a bal sarokban, menü, kosár), lábléc, termékkártya, toast, beúszó animációk, küldés (CRM-webhook vagy mailto) |
| `js/cartwin.js` | **A kosár külön ablakban** (natív `<dialog>`): 1. Kosár → 2. Adatok → 3. Kész. Minden oldalon elérhető |
| `js/home.js`, `js/shop.js`, `js/product.js`, `js/pages.js` | Oldalankénti szkriptek |
| `img/termek/` | Négyzetes termékfotók |
| `img/foto/` | Nagy fotók (hero, csempék, rólunk, kapcsolat) |
| `KUTATAS.md` | Háttérkutatás a partnerről, valamint a fotók forrásai |
| `v1-gozgomboc-ora/` | Korábbi dizájnváltozat, archívumként megtartva |

**Navigáció:** a fejléc és a lábléc egy helyen, a `js/core.js` fájlban van megírva, és minden oldalra innen kerül be (`<div id="site-header">` és `<div id="site-footer">`). A legtetején egy vékony infósáv van (élő „Most nyitva” állapot, mai nyitvatartás, cím, telefon, Instagram). Alatta egy egyszerű fejléc: bal sarokban a logó és a név, mellette a kattintható menüpontok és a kosár gombja. A fejléc nem ragad fel, a lap tetején marad. Telefonon a menü két sorba törik, nem kell oldalra görgetni. A fülek az `SA.PAGES` tömbből jönnek, új oldalnál elég oda felvenni.

**Betűk (Google Fonts):** Unbounded (címek), Geist (szöveg), Geist Mono (címkék, árak, adatok), Courgette (a logó felirata és a kiemelt szavak). Mindegyikben van ő és ű.

## Hogyan működik a rendelés

- A kosár a böngésző localStorage-ában él (`sutitakarok_cart_v2`), ezért oldalak és fülek között is megmarad.
- A legkorábbi dátum a kosár „leglassabb” tételéhez igazodik (`lead` napok a `data.js`-ben). Kiszállításnál legalább 1 nap. Az idősávokat a nyitvatartásból számolja.
- Fagyit tartalmazó kosárnál csak személyes átvétel választható.
- Elküldés: ha a `SA.CONFIG.CRM_WEBHOOK_URL` ki van töltve, a rendelés JSON-ban oda megy (POST). Ha üres, a látogató e-mail-programja nyílik meg a kitöltött rendeléssel (`sutitakarok.abolt@gmail.com`).

## Élesítés előtt

- **Árak:** a `js/data.js` árai **mintaárak**, a valódi árlistát a partnertől kell bekérni. A kiszállítási díj és az ingyenes határ szintén mintaérték.
- **Fotók:** az `img/foto/` és részben az `img/termek/` képei a We Love Budapest, a WMN (Hámori Zsófia) és a hovamenjek.hu fotói. Ezekhez engedély kell, vagy le kell cserélni őket a bolt saját fotóira. A flódninak és az adventi naptárnak még nincs fotója. Részletek: `KUTATAS.md`.
- **Rendelés:** be kell kötni a CRM-webhookot (`CRM_WEBHOOK_URL`), az online fizetés (pl. SimplePay) jelenleg „Hamarosan” állapotban van.
- **Jogi oldalak:** ÁSZF és adatkezelési tájékoztató (most `#` linkek).
- A nyitvatartást, az átfutási időket, a kiszállítási zónákat és idősávokat, valamint az adventi naptár határidejét egyeztetni kell. Ezeket `TODO` kommentek jelölik a kódban.
