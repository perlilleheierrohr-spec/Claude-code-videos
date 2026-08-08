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

## Bildene

De seks PNG-ene ligger i `public/images/`. Alle har ekte gjennomsiktig
bakgrunn (RGBA). Salt har ingen PNG og vises kun som tekst i lista.

## Justere dandering

Moseflaten er målt direkte ut av `base.png`: en ellipse med sentrum i
(50.2 %, 50.1 %) og radius 41.8 % × 37.3 % av bildet. To steder styrer
hvordan toppingene ligger:

- **`public/styles.css` → `.plate`** — moseflaten, altså ikke hele skåla.
  Insettene er satt til den målte ellipsen. Bytter du ut `base.png` med et
  annet bilde, er det disse som må justeres (og `aspect-ratio` på
  `.forhandsvisning`, som følger bildets sideforhold).
- **`public/app.js` → `INGREDIENSER[].lag`** — hvert lag har:
  - `x`, `y` — punktet der haugen **hviler** på mosen, i prosent av
    moseflaten. Bildet ankres på nedre midtpunkt, så haugen ser ut til å stå
    på flaten. Et punkt ligger på mosen når
    `((x-50)/50)² + ((y-50)/50)² < 1`.
  - `w` — bredde i prosent av moseflatens bredde.
  - `r` — rotasjon, `z` — stablerekkefølge (følger `y`, så det som ligger
    lengst fram havner øverst).

Størrelsene er kalibrert mot skåla: moseflaten er ca. 941 px bred i bildet og
tilsvarer ca. 22 cm, altså rundt 43 px/cm. Kylling- og avokadobildet viser
bare fire biter hver, så begge brukes to ganger for å se ut som en hel porsjon.

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
