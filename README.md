# AI Forge

An AI studio that turns a plain-language idea into a finished web page and publishes it straight to GitHub Pages.

**Live:** https://5xb4q2q68n-hub.github.io/ai-forge/

## What it does

- **Describe an app → get an app.** A free model writes one self-contained HTML file (inline CSS/JS, no build step).
- **Live preview** in a sandboxed iframe, a Code tab, and Auto/Phone/Tablet widths.
- **Refine loop.** Follow-up instructions are sent with the current document, so it revises the real page instead of starting over.
- **Feature packs.** Toggles that extend what the AI builds: moderation & blocking, accounts, feed/follow/chat, data & persistence, charts, audio, physics, 3D, game feel, AI-in-app, speech, accessibility. Selected packs are appended to the system prompt.
- **Publish.** Commits to `creations/<slug>.html`, updates `creations/index.json`, and the page goes live on GitHub Pages in about a minute.
- **Forge tools.** Hand-built utilities that ship with the repo. Currently: the Moderation Console.

## The Moderation Console

`tools/moderation-console.html` — a working moderation toolkit over a seeded directory of 48 accounts:

- Block / Unblock per account, with a status pill, toast feedback and an activity log.
- Multi-select (row checkboxes + select-all) with a bulk block / bulk unblock action bar.
- **Random block** panel: a numeric input for how many accounts to block, 1/5/10/25/All-active quick picks, a live warning of exactly what will happen, and an explicit confirmation modal before anything is blocked.
- Undo (30-step history), search, "blocked only" filter, live counters, and localStorage persistence with a re-seed control.

It is also loadable into the editor via its **Edit** button, so the AI can extend it.

## Publishing setup

Paste a GitHub token into **Settings**. It is stored in this browser's `localStorage` only and is never committed.

Recommended: a **fine-grained** token scoped to this repository only, with **Contents: Read and write**.

Shortcut: open `https://5xb4q2q68n-hub.github.io/ai-forge/#t=YOUR_TOKEN` once. The token is read, saved to the browser, and stripped from the address bar.

## AI backend

Defaults to the keyless endpoint `https://text.pollinations.ai/openai` (`openai-fast`, gpt-oss-20b). Settings also accepts any OpenAI-compatible base URL + key + model if you want a stronger model.

## Repo layout

```
index.html                      the studio
styles.css
app.js
tools/moderation-console.html   built-in tool
creations/index.json            manifest read by the gallery
creations/<slug>.html           published creations
.nojekyll                       serve files as-is on Pages
```

## Notes for a future editor session

- The workspace's `src/` mirrors the repo root: `src/index.html` → `index.html`, `src/styles.css` → `styles.css`, `src/app.js` → `app.js`, `src/tools/...` → `tools/...`.
- `index.html` in the workspace root is a **local preview harness** that mounts `src/index.html` (or whatever `localStorage["harness.page"]` points at) into the live preview page so it can be inspected with the vision tool. It is not part of the published site.
- To re-publish after editing `src/`, read the file and `PUT` it to `https://api.github.com/repos/5xb4q2q68n-hub/ai-forge/contents/<path>` with `{message, content: base64, branch: "main", sha?}` and a bearer token.
- GitHub Pages has no build step; pushes go live in about a minute.
