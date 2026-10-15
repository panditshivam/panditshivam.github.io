"use strict";
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#navigation");
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
  nav.classList.remove("open");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  nav.classList.toggle("open", open);
});
nav
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-wrap")) closeMenu();
});
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const workCards = [...document.querySelectorAll("[data-category]")];
filterButtons.forEach((button) =>
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    let count = 0;
    workCards.forEach((card) => {
      const show =
        button.dataset.filter === "all" ||
        card.dataset.category === button.dataset.filter;
      card.hidden = !show;
      if (show) count++;
    });
    document.querySelector("#filter-status").textContent =
      `${count} case ${count === 1 ? "study" : "studies"} shown.`;
  }),
);
const cases = {
  graphrag: {
    category: "KNOWLEDGE SYSTEMS / CODE & THEORY",
    title: "Connecting the dots. Grounding the answer.",
    body: '<h3>The challenge</h3><p>Enterprise questions often require evidence scattered across multiple documents and relationships. Semantic similarity alone can miss the connections needed for a grounded answer.</p><h3>My contribution</h3><p>I architected and benchmarked an enterprise GraphRAG system combining entity–relationship graphs, semantic traversal, and vector retrieval. The work included retrieval, traversal, and grounding refinements, alongside more rigorous internal evaluation.</p><h3>Selected outcomes</h3><ul><li>89% multi-hop fact recovery versus 53% for a leading enterprise benchmark.</li><li>2.9× faster average inference on the comparison benchmark.</li><li>Internal evaluation quality improved from 43.1% to 54.6%, with zero confirmed hallucinations in the reported evaluation.</li></ul><p class="dialog-note">Benchmark scope: 22 ground-truth questions across six categories. These are internal results reported in my professional profile, not a universal performance guarantee. The separate internal quality evaluation uses its own metric.</p>',
  },
  decisions: {
    category: "DECISION INTELLIGENCE / CODE & THEORY",
    title: "From market signals to better decisions.",
    body: '<h3>The challenge</h3><p>Commercial teams need decisions that account for market movement, customer behavior, margins, and operational constraints—not a model score in isolation.</p><h3>My contribution</h3><p>I architected a production pricing framework with transaction-level feature engineering, comparable-price logic, recency weighting, conversion adjustments, ML recommendations, and commercial guardrails. Reusable pipelines used Kedro and Argo, with lineage and regression validation.</p><ul><li>Designed an “Explain the Price” decision-support layer to surface the factors behind recommendations.</li><li>Built leakage-safe customer attrition modeling over four-quarter observation windows.</li><li>Developed a signal pipeline spanning 52 economic indicators, STL seasonal adjustment, and PPO transformations.</li><li>Evaluated controlled pricing experiments through win-rate, gross-margin, sensitivity, and break-even analysis.</li></ul><p class="dialog-note">The chart on the portfolio is a conceptual illustration, not client transaction data. Client names and proprietary implementation details are omitted.</p>',
  },
  voice: {
    category: "MULTILINGUAL AI / PULASTYA AI",
    title: "Less lost in translation. More human connection.",
    body: '<h3>The challenge</h3><p>Language can become a barrier to a phone conversation, accessing a service, or bringing a small business into digital commerce.</p><h3>My contribution</h3><p>As Co-Founder & CTO of Pulastya AI, I co-founded and engineered a mobile-to-mobile, real-time voice translation platform. I also led ONDC and Bhashini integrations and voice-assisted merchant onboarding.</p><h3>Selected outcomes</h3><ul><li>Approximately 0.45-second latency and 3,000+ bilingual calls during pilot programs.</li><li>Translation systems across Hindi, Tamil, Bengali, and Gujarati with 20% higher fluency against baseline benchmarks.</li><li>Merchant onboarding workflows supporting 500+ sellers and reducing listing time by 40%.</li><li>Winner of the ONDC-Bhashini Sprint 2024; runner-up at Bhashini Velocity 2024.</li></ul><p class="dialog-note">Reported outcomes reflect specific pilots, deployments, and baseline comparisons described in my professional profile.</p>',
  },
  health: {
    category: "HEALTHCARE AI / APPLIED RESEARCH",
    title: "Earlier signals. More informed care.",
    body: '<h3>The research question</h3><p>Can longitudinal corneal tomography help identify keratoconus progression earlier and support more informed clinical decisions?</p><h3>My contribution</h3><p>At Techsophy, I collaborated with clinicians at L. V. Prasad Eye Institute to develop CNN-based progression models using tomography data from 1,200+ subjects. The work combined medical-image modeling, longitudinal validation, demographic analysis, and explainable ML.</p><h3>Research direction</h3><p>The work supported progression prediction up to approximately 500 days in advance within the research setting. My ongoing Ph.D. focus extends this interest to explainable multimodal AI for clinically safe decision-support systems.</p><p><a href="https://pubmed.ncbi.nlm.nih.gov/35343267/" target="_blank" rel="noopener noreferrer">Read the KEDOP publication ↗</a></p><p class="dialog-note">This is a summary of research, not a clinical tool or an independently validated claim of prospective clinical performance.</p>',
  },
};
const dialog = document.querySelector("#case-dialog");
let caseTrigger;
document.querySelectorAll("[data-case]").forEach((button) =>
  button.addEventListener("click", () => {
    const study = cases[button.dataset.case];
    caseTrigger = button;
    document.querySelector("#case-category").textContent = study.category;
    document.querySelector("#case-title").textContent = study.title;
    document.querySelector("#case-body").innerHTML = study.body;
    dialog.showModal();
    dialog.scrollTop = 0;
  }),
);
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => {
  if (caseTrigger) caseTrigger.focus();
});
const copyButton = document.querySelector("#copy-email");
let copyTimer;
copyButton.addEventListener("click", async () => {
  clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText("shivampandit@icloud.com");
    copyButton.textContent = "Copied ✓";
    document.querySelector("#copy-status").textContent =
      "Email address copied to clipboard.";
  } catch {
    copyButton.textContent = "Select email to copy";
    document.querySelector("#copy-status").textContent =
      "Copy unavailable. Select shivampandit@icloud.com above to copy it.";
  }
  copyTimer = setTimeout(() => {
    copyButton.innerHTML = 'Copy email <span aria-hidden="true">⧉</span>';
  }, 3500);
});
document.querySelector("#year").textContent = new Date().getFullYear();
const wave = document.querySelector(".waveform");
[10, 17, 26, 13, 35, 47, 28, 17, 37, 50, 33, 22, 42, 29, 14, 26, 18, 9].forEach(
  (height) => {
    const bar = document.createElement("i");
    bar.style.height = `${height}px`;
    wave.append(bar);
  },
);
