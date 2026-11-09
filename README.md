# Sütit akarok! – weboldal és webshop

Statikus weboldal és webshop a **Sütit akarok!** cukrászdának és fagyizónak
(1023 Budapest, Frankel Leó út 72.). Nincs build-lépés és függőség: két oldalból
(`index.html`, `kosar.html`), egy stíluslapból és néhány sima JavaScript-fájlból áll.

## Futtatás helyben

Bármilyen statikus szerverrel elindítható. Windows alatt a mellékelt PowerShell-szerver is jó:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 8140
```

Utána nyisd meg a böngészőben: http://localhost:8140

## Felépítés

| Fájl / mappa | Tartalom |
|---|---|
| `index.html` | Főoldal: hero, webshop (kategóriaszűrő, méretválasztó, kosárba rakás), adventi naptár, egyedi torta ajánlatkérő, rólunk, elérhetőség |
| `kosar.html` | Külön kosár- és pénztároldal: tételek, átvétel vagy kiszállítás, dátum és idősáv, adatok, összesítő, visszaigazolás |
| `styles.css` | Közös stílusok. A színek (a logóból) és a betűk a `:root` változókban vannak |
| `js/data.js` | **Termékek, árak, beállítások** (`SA.CONFIG`, `SA.CATS`, `SA.PRODUCTS`). Itt kell módosítani a kínálatot |
| `js/cart.js` | Közös kosár (localStorage), fejléc, toast, küldés (CRM-webhook vagy mailto) |
| `js/home.js` | Főoldali termékrács, szűrők, naptár, nyitvatartás, ajánlatkérő |
| `js/kosar.js` | Kosár oldal: mennyiségek, átvételi mód, dátumszabályok, rendelés elküldése |
| `img/termek/` | Négyzetes termékfotók |
| `img/foto/` | Nagy fotók (hero, rólunk, egyedi torta) |
| `KUTATAS.md` | Háttérkutatás a partnerről, valamint a fotók forrásai |
| `v1-gozgomboc-ora/` | Korábbi dizájnváltozat, archívumként megtartva |

**Betűk:** Courgette (a logó feliratához legközelebb álló betű, ő/ű is van benne) és Manrope, mind a Google Fonts-ról.

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
