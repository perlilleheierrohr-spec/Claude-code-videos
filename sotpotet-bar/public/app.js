/* Søtpotet-baren — live forhåndsvisning + innsending til Formspree */

const FORMSPREE_URL = "https://formspree.io/f/xqpzeloo";

/*
  Ingrediensene. `lag` beskriver hvor bildet legges oppå mosen:

    x, y  Punktet der haugen HVILER på mosen, i prosent av moseflaten.
          Moseflaten er en ellipse med sentrum i (50, 50) og radius 50
          begge veier, så et punkt ligger på mosen når
          ((x-50)/50)² + ((y-50)/50)² < 1. Alle punktene under ligger
          godt innenfor, slik at ingenting havner oppå skålkanten.
    w     Bredde i prosent av moseflatens bredde.
    r     Rotasjon.
    z     Stablerekkefølge. Følger y: det som hviler lengst fram
          (høy y) ligger øverst, slik perspektivet i bildet tilsier.

  Både avokado- og kyllingbildet viser bare fire biter hver. De brukes
  derfor to ganger, i litt ulik størrelse og rotasjon, så porsjonene
  ser ut som 227 g kylling og en halv avokado — ikke fire biter.
*/
const INGREDIENSER = [
  {
    id: "kylling",
    navn: "Kyllingfilet",
    mengde: "227 g",
    bilde: "images/chicken.png",
    lag: [
      { x: 70, y: 46, w: 46, r: 4, z: 4 },
      { x: 48, y: 72, w: 43, r: -5, z: 7 },
    ],
  },
  {
    id: "avokado",
    navn: "Avokado",
    mengde: "1/2",
    bilde: "images/avocado.png",
    lag: [
      { x: 72, y: 66, w: 44, r: -6, z: 6 },
      { x: 38, y: 84, w: 44, r: 7, z: 9 },
    ],
  },
  {
    id: "mozzarella",
    navn: "Mozzarella",
    mengde: "35 g",
    bilde: "images/mozzarella.png",
    lag: [{ x: 32, y: 38, w: 40, r: -3, z: 3 }],
  },
  {
    id: "tomat",
    navn: "Tomat",
    mengde: "40 g",
    bilde: "images/tomato.png",
    lag: [{ x: 27, y: 60, w: 44, r: 3, z: 5 }],
  },
  {
    id: "agurk",
    navn: "Agurk",
    mengde: "20 g",
    bilde: "images/cucumber.png",
    lag: [{ x: 73, y: 78, w: 34, r: -4, z: 8 }],
  },
  {
    id: "salt",
    navn: "Salt",
    mengde: "1 ts",
    bilde: null, // ikke noe bilde — vises kun i lista
    lag: [],
  },
];

const listeEl    = document.getElementById("ingredienser");
const plateEl    = document.getElementById("plate");
const tekstEl    = document.getElementById("forhandsvisningTekst");
const skjemaEl   = document.getElementById("skjema");
const navnEl     = document.getElementById("navn");
const navnFeilEl = document.getElementById("navnFeil");
const knappEl    = document.getElementById("sendKnapp");
const statusEl   = document.getElementById("status");

/* ── Bygg avkrysningsboksene ──────────────────────────────────────── */
for (const ing of INGREDIENSER) {
  const li = document.createElement("li");
  li.className = "ingrediens";
  li.innerHTML = `
    <label>
      <input type="checkbox" id="ing-${ing.id}" value="${ing.id}" />
      <span class="boks" aria-hidden="true"></span>
      <span class="navn">${ing.navn}</span>
      <span class="mengde">${ing.mengde}</span>
    </label>`;
  li.querySelector("input").addEventListener("change", tegnForhandsvisning);
  listeEl.appendChild(li);
}

/* ── Live forhåndsvisning ─────────────────────────────────────────── */
function valgte() {
  return INGREDIENSER.filter((ing) => {
    const boks = document.getElementById(`ing-${ing.id}`);
    return boks && boks.checked;
  });
}

/* Etter en vellykket innsending står knappen på «Sendt ✓».
   Endrer man valget sitt, skal man kunne sende på nytt. */
function nullstillSendeknapp() {
  if (knappEl.disabled && knappEl.textContent === "Sendt ✓") {
    knappEl.disabled = false;
    knappEl.textContent = "Send inn bestillingen";
    statusEl.className = "status";
    statusEl.textContent = "";
  }
}

function tegnForhandsvisning() {
  nullstillSendeknapp();
  const valg = valgte();

  plateEl.replaceChildren();

  for (const ing of valg) {
    for (const lag of ing.lag) {
      const img = document.createElement("img");
      img.className = "topping";
      img.src = ing.bilde;
      img.alt = "";
      img.style.setProperty("--x", `${lag.x}%`);
      img.style.setProperty("--y", `${lag.y}%`);
      img.style.setProperty("--w", `${lag.w}%`);
      img.style.setProperty("--r", `${lag.r}deg`);
      img.style.setProperty("--z", String(lag.z));
      // Mangler bildet, skal ikke et ødelagt ikon vises oppå mosen
      img.addEventListener("error", () => img.remove());
      plateEl.appendChild(img);
    }
  }

  const navn = valg.map((ing) => ing.navn.toLowerCase());
  tekstEl.textContent = navn.length
    ? `Søtpotetmos med ${listeTekst(navn)}`
    : "Søtpotetmos — kryss av for tilbehør nedenfor";
}

function listeTekst(ord) {
  if (ord.length === 1) return ord[0];
  return `${ord.slice(0, -1).join(", ")} og ${ord[ord.length - 1]}`;
}

/* ── Innsending ───────────────────────────────────────────────────── */
navnEl.addEventListener("input", () => {
  navnEl.classList.remove("har-feil");
  navnFeilEl.hidden = true;
  nullstillSendeknapp();
});

skjemaEl.addEventListener("submit", async (e) => {
  e.preventDefault();

  const navn = navnEl.value.trim();
  if (!navn) {
    navnEl.classList.add("har-feil");
    navnFeilEl.hidden = false;
    navnEl.focus();
    return;
  }

  const valg = valgte();
  const ingredienser = valg.map((ing) => `${ing.navn} (${ing.mengde})`);

  knappEl.disabled = true;
  knappEl.textContent = "Sender …";
  statusEl.className = "status";
  statusEl.textContent = "";

  try {
    const svar = await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        navn,
        ingredienser,
        oppsummering: ingredienser.length
          ? `Søtpotetmos + ${ingredienser.join(", ")}`
          : "Søtpotetmos uten tilbehør",
        _subject: `Søtpotet-baren: bestilling fra ${navn}`,
      }),
    });

    if (!svar.ok) throw new Error(`Formspree svarte ${svar.status}`);

    statusEl.className = "status ok";
    statusEl.textContent = `Takk, ${navn}! Bestillingen er sendt til kjøkkenet 🍠`;
    knappEl.textContent = "Sendt ✓";
  } catch (feil) {
    console.error(feil);
    statusEl.className = "status feil";
    statusEl.textContent = "Oi — det gikk ikke å sende. Sjekk nettet og prøv igjen.";
    knappEl.disabled = false;
    knappEl.textContent = "Send inn bestillingen";
  }
});

tegnForhandsvisning();
