gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ==========================================================================
   Hero — intro timeline on load
   ========================================================================== */

function heroIntro() {
  const els = gsap.utils.toArray("[data-hero-el]");
  if (!els.length) return;

  gsap.set(els, { autoAlpha: 0, y: 34 });

  gsap.to(els, {
    autoAlpha: 1,
    y: 0,
    duration: 1.1,
    ease: "power3.out",
    stagger: 0.12,
    delay: 0.15,
  });
}

/* ==========================================================================
   Feature cards — sequential entrance from the bottom on scroll
   ========================================================================== */

function featureCards() {
  const cards = gsap.utils.toArray("[data-feature-card]");
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 40 });

  gsap.to(cards, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.15,
    scrollTrigger: {
      trigger: ".features",
      start: "top 80%",
      once: true,
    },
  });
}

/* ==========================================================================
   Product demo — pinned for 300vh, three steps at equal scroll intervals
   ========================================================================== */

function productDemo() {
  const mockup = document.querySelector("[data-demo-mockup]");
  const ring = document.querySelector("[data-demo-ring]");
  const results = document.querySelector("[data-demo-results]");
  if (!mockup || !ring || !results) return;

  gsap.set(mockup, { opacity: 0 });
  gsap.set(ring, { opacity: 0, scale: 0.9 });
  gsap.set(results, { opacity: 0, x: 60 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".product-demo",
        start: "top top",
        end: () => "+=" + window.innerHeight * 3,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
    // Three equal-length steps (duration 1 each) across the pinned range:
    // step 1 mockup fade-in, step 2 metric ring, step 3 results card slide-in.
    .to(mockup, { opacity: 1, duration: 1, ease: "power1.out" }, 0)
    .to(ring, { opacity: 1, scale: 1, duration: 1, ease: "power1.out" }, 1)
    .to(results, { opacity: 1, x: 0, duration: 1, ease: "power1.out" }, 2);
}

/* ==========================================================================
   Horizontal scroll — product timeline pinned & scrubbed
   ========================================================================== */

function horizontalTimeline() {
  const track = document.querySelector("[data-timeline-track]");
  const pin = document.querySelector(".timeline-pin");
  const items = gsap.utils.toArray("[data-timeline-item]");
  if (!track || !pin) return;

  const getScrollDistance = () => track.scrollWidth - pin.clientWidth;
  // Stretch the pinned scroll well beyond the raw horizontal overflow so each
  // card gets real dwell time instead of flying by in a single scroll gesture.
  const getPinLength = () =>
    Math.max(getScrollDistance(), items.length * window.innerHeight * 0.85);

  const st = ScrollTrigger.create({
    trigger: ".timeline-section",
    start: "top top",
    end: () => "+=" + getPinLength(),
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    animation: gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: "none",
    }),
  });

  items.forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0.35, scale: 0.94 },
      {
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: item,
          containerAnimation: st.animation,
          start: "left 85%",
          end: "left 45%",
          scrub: true,
        },
      }
    );
  });
}

/* ==========================================================================
   Contact section — soft reveal
   ========================================================================== */

function contactReveal() {
  const target = document.querySelector(".contact-inner");
  if (!target) return;

  gsap.from(target.children, {
    opacity: 0,
    y: 40,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.08,
    scrollTrigger: {
      trigger: ".contact",
      start: "top 75%",
      once: true,
    },
  });
}

/* ==========================================================================
   Header background intensifies once past the hero
   ========================================================================== */

function headerOnScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  ScrollTrigger.create({
    trigger: ".hero",
    start: "bottom top+=80",
    onEnter: () => header.classList.add("is-scrolled"),
    onLeaveBack: () => header.classList.remove("is-scrolled"),
  });
}

/* ==========================================================================
   Contact form — lightweight submit feedback (no backend)
   ========================================================================== */

function contactForm() {
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    note.textContent = "Thanks — you're on the list. We'll be in touch soon.";
    gsap.fromTo(note, { opacity: 0.3 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    form.reset();
  });
}

/* ==========================================================================
   Init
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  heroIntro();
  contactForm();
  headerOnScroll();

  if (prefersReducedMotion) {
    gsap.set("[data-feature-card]", { opacity: 1, y: 0 });
    gsap.set("[data-demo-mockup]", { opacity: 1 });
    gsap.set("[data-demo-ring]", { opacity: 1, scale: 1 });
    gsap.set("[data-demo-results]", { opacity: 1, x: 0 });
    return;
  }

  featureCards();
  productDemo();
  horizontalTimeline();
  contactReveal();
});
