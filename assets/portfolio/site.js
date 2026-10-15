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
    body: '<h3>The challenge</h3><p>Enterprise questions often require evidence spread across documents and relationships. An answer needs both the right context and a way to trace it back to its sources.</p><h3>My contribution</h3><p>I architected an enterprise GraphRAG platform combining entity and relationship extraction, knowledge graphs, semantic traversal, and vector retrieval for grounded multi-hop reasoning with source traceability.</p><p>I built a formal evaluation framework that separates retrieval quality from answer quality, includes adversarial and out-of-scope cases, and supports iterative grounding improvements.</p><h3>Selected outcomes</h3><ul><li>89% multi-hop fact recovery versus 53% for a leading enterprise benchmark.</li><li>2.9× faster average inference on the comparison benchmark.</li><li>Internal evaluation quality improved from 43.1% to 54.6%, with zero confirmed hallucinations in the reported evaluation after tuning.</li></ul><p class="dialog-note">The comparison covered 22 ground-truth questions across six categories. Results describe this internal evaluation; they do not imply that the system cannot hallucinate outside it. The internal quality score is a separate evaluation metric.</p>',
  },
  decisions: {
    category: "DECISION INTELLIGENCE / CODE & THEORY",
    title: "From market signals to better decisions.",
    body: '<h3>The challenge</h3><p>Commercial teams need recommendations that account for customer behavior, market signals, margins, and operational constraints—and explanations they can question.</p><h3>My contribution</h3><p>I architected a production pricing engine covering approximately $1.6B in trailing-12-month revenue, built on approximately $8.8B in historical transactions. The system combines feature engineering, comparable-price logic, recency weighting, conversion adjustments, and commercial guardrails.</p><p>I designed an agentic “Explain the Price” layer using model outputs, costs, discounts, order-size adjustments, and active experiments. It supports follow-up questions on comparable deals and win likelihood.</p><h3>Selected outcomes</h3><ul><li>Controlled experiments contributed $13.5M+ in estimated annualized margin impact across eight tests.</li><li>A temporally validated, 31-feature churn model flagged approximately 2,430 at-risk customers per quarter.</li><li>A separate economic signal pipeline connected 52 external indicators to end-market analysis.</li></ul><p class="dialog-note">Revenue figures describe engine coverage and historical data scope. Margin impact is an annualized estimate from controlled experiments, not a statement of realized cash earnings. The chart is illustrative.</p>',
  },
  voice: {
    category: "MULTILINGUAL AI / PULASTYA AI",
    title: "Less lost in translation. More human connection.",
    body: '<h3>The challenge</h3><p>Language can become a barrier to a phone conversation, accessing a service, or bringing a small business into digital commerce.</p><h3>My contribution</h3><p>As Co-Founder & CTO of Pulastya AI, I co-founded and engineered a mobile-to-mobile, real-time voice translation platform. I also led ONDC and Bhashini integrations and voice-assisted merchant onboarding.</p><h3>Selected outcomes</h3><ul><li>Approximately 0.45-second latency and 3,000+ bilingual calls during pilot programs.</li><li>Translation systems across Hindi, Tamil, Bengali, and Gujarati with 20% higher fluency against baseline benchmarks.</li><li>Merchant onboarding workflows supporting 500+ sellers and reducing listing time by 40%.</li><li>Winner of the ONDC-Bhashini Sprint 2024; runner-up at Bhashini Velocity 2024.</li></ul><p class="dialog-note">Reported outcomes reflect specific pilots, deployments, and baseline comparisons described in my professional profile.</p>',
  },
  content: {
    category: "CONTENT INTELLIGENCE / CODE & THEORY",
    title: "More context. Less manual curation.",
    body: '<h3>The challenge</h3><p>Finding relevant stories across a multi-million-article corpus requires more than keyword matches. Editorial workflows need context from entities, external trends, relationships, and geography.</p><h3>My contribution</h3><p>I led the architecture of a production content-intelligence platform combining semantic retrieval, embeddings, ANN/vector search, lexical retrieval, ranking, recommendations, entity intelligence, and geospatial signals.</p><p>I designed LLM-assisted retrieval augmentation, tagging, drafting support, and distribution workflows, connecting structured and unstructured data through BigQuery, Cloud Spanner, and Vertex AI on GCP.</p><h3>Production discipline</h3><ul><li>Hybrid retrieval and recommendation workflows reduced manual curation by 50%+.</li><li>Prompt/version control, evaluation, tracing, observability, and regression checks supported reliable operations.</li></ul><p class="dialog-note">The diagram illustrates the workflow. It does not display client documents or proprietary implementation details.</p>',
  },
  vision: {
    category: "GENERATIVE VISION / CODE & THEORY",
    title: "Creative control. Production discipline.",
    body: '<h3>The challenge</h3><p>Node-based generative workflows are useful for exploration. Production services also need modular interfaces, traceable intermediate artifacts, controlled configurations, and repeatable evaluation.</p><h3>My contribution</h3><p>I re-engineered generative workflows into modular Python services using Stable Diffusion XL, LoRA, IP-Adapter, SAM-HQ, and GroundingDINO for image-conditioned generation, segmentation, and controllable multimodal workflows.</p><h3>Engineering for production</h3><ul><li>Separated generation and segmentation stages into services with explicit inputs and outputs.</li><li>Added stage-level tracing and artifact validation to inspect intermediate results.</li><li>Introduced model/config versioning, deterministic controls, and regression checks to support reproducibility and production readiness.</li></ul><p class="dialog-note">The card illustrates the processing stages rather than a generated client asset.</p>',
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
