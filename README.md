# Shivam Dwivedi — personal portfolio

Live at **https://panditshivam.github.io/**.

A responsive, accessible static portfolio covering applied AI, ML architecture, professional experience, research, and writing. Built with HTML, CSS, and vanilla JavaScript; no dependencies or build step.

## Preview locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173.

## Edit

- `index.html`: portfolio content, publication links, contact information, SEO metadata, and structured data.
- `assets/portfolio/style.css`: design tokens, layouts, responsive breakpoints, reduced-motion and print styles.
- `assets/portfolio/site.js`: project filters, case-study dialogs, mobile navigation, and email copying. Full case-study text lives in the `cases` object.
- `assets/portfolio/intelligence.svg`: original vector illustration.
- `assets/portfolio/profile.jpg`: supplied profile portrait, displayed in its original colors.

Content was adapted from https://github.com/panditshivam/panditshivam. Case studies distinguish internal benchmark results from general performance claims. Visual diagrams are illustrative; they contain no client data. Update the HTML and case-study text together when changing professional outcomes.

## Deployment

GitHub Pages publishes `main` from the repository root. Push updates to `main`; check the Pages build in the repository Actions tab. The `.nojekyll` file keeps this a plain static deployment. Relative asset paths also support a project-site deployment.

Typography uses Google Fonts with local system fallbacks. No analytics, contact backend, API keys, or third-party JavaScript are required. Contact uses email and social profile links.

Historical template assets and the original license are retained. The redesigned entry point uses only `assets/portfolio/`.
