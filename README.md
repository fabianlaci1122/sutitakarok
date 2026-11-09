# Sütit akarok! – weboldal

Egyoldalas, statikus bemutatkozó oldal a **Sütit akarok!** cukrászdának és fagyizónak
(1023 Budapest, Frankel Leó út 72.). Nem kell hozzá build és függőség sem, elég egy
`index.html`, a `styles.css` és az `app.js`.

## Futtatás helyben

Bármilyen statikus szerverrel elindítható. Windows alatt a mellékelt PowerShell-szerver is jó:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 8140
```

Utána nyisd meg a böngészőben: http://localhost:8140

## Felépítés

| Fájl / mappa | Tartalom |
|---|---|
| `index.html` | Az oldal: hero, kiemelt finomságok, adventi sáv, kategóriák, rólunk, tortarendelés, elérhetőség |
| `styles.css` | Stílusok. A színek és betűk a `:root` változókban vannak |
| `app.js` | Fejléc és mobilmenü, nyitvatartás, adventi naptár, rendelési űrlap (mailto) |
| `img/foto/` | Webre vágott fotók |
| `img/ig/` | A bolt Instagram-képeiből vágott ideiglenes fotók |
| `KUTATAS.md` | Háttérkutatás a partnerről, valamint a fotók forrásai |
| `v1-gozgomboc-ora/` | Korábbi dizájnváltozat, archívumként megtartva |

**Betűk:** Syncopate (címek, gombok), Special Elite (írógépes címek), Roboto 300 (szövegtörzs), mind a Google Fonts-ról.

## Élesítés előtt

- **Fotók:** a `img/foto/` képei a We Love Budapest és a WMN (Hámori Zsófia) sajtófotói.
  Ezekhez engedély kell, vagy le kell cserélni őket a bolt saját fotóira. Részletek: `KUTATAS.md`.
- A nyitvatartást, az árakat, az adventi naptár határidejét és a tortarendelés átfutási idejét egyeztetni kell a partnerrel. Ezeket `TODO` kommentek jelölik a kódban.
- A rendelési űrlap most e-mail-programot nyit (mailto). Éles használatra űrlapszolgáltatás vagy backend kell mögé.
