# 🍠 Søtpotet-baren

En liten nettside der familien krysser av for tilbehør til søtpotetmosen og ser
retten bygge seg opp live. Ren HTML/CSS/JS — ingen byggesteg, ingen avhengigheter.

## Kom i gang

```bash
cd sotpotet-bar
npm run dev
```

Åpne http://localhost:3000. (Ingen `npm install` nødvendig — dev-serveren er en
liten Node-fil uten avhengigheter. Krever Node 18+.)

## Legg inn bildene

De seks PNG-ene skal ligge i `public/images/` med disse navnene:

`base.png`, `chicken.png`, `avocado.png`, `mozzarella.png`, `tomato.png`, `cucumber.png`

Se `public/images/README.md`. Salt har ingen PNG og vises kun som tekst.

## Justere dandering

To steder styrer hvordan toppingene ligger:

- **`public/styles.css` → `.plate`** — det usynlige feltet toppingene plasseres
  innenfor, altså selve moseflaten. Havner toppingene utenfor mosen i ditt
  `base.png`, juster `left/right/top/bottom` her.
- **`public/app.js` → `INGREDIENSER[].lag`** — hvert lag har `x`/`y` (senter i
  prosent av moseflaten), `w` (bredde i prosent), `r` (rotasjon) og `z`
  (stablerekkefølge). Avokado har to lag for et fyldigere resultat; legg gjerne
  til flere.

## Innsending

Skjemaet postes som JSON til Formspree-endepunktet i `public/app.js`
(`FORMSPREE_URL`). Brukeren får en bekreftelsesmelding under knappen.

## Deploy på Vercel (gratis)

Repoet inneholder også et React Native-prosjekt i rota, så **Root Directory må
settes til `sotpotet-bar`**.

### Via nettsiden

1. Push branchen til GitHub.
2. Gå til [vercel.com/new](https://vercel.com/new) og importer repoet.
3. Under **Configure Project**:
   - **Root Directory** → klikk *Edit* og velg `sotpotet-bar`
   - **Framework Preset** → `Other`
   - Build- og output-innstillinger leses fra `vercel.json` (output = `public`,
     ingen build).
4. **Deploy**. Siden er live på `<prosjektnavn>.vercel.app` etter noen sekunder.

Hver senere push til branchen gir en ny preview-deploy automatisk.

### Via CLI

```bash
npm i -g vercel
cd sotpotet-bar
vercel          # første gang: følg spørsmålene, svar "." på root directory
vercel --prod   # legg ut i produksjon
```
