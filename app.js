(function () {
  "use strict";

  var OWNER_DEFAULT = "5xb4q2q68n-hub";
  var REPO_DEFAULT = "ai-forge";
  var BRANCH_DEFAULT = "main";
  var LS = "aiforge.v1";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var BASE_SYSTEM = [
    "You are the build engine inside AI Forge, a studio that turns plain-language ideas into finished, self-contained web pages.",
    "",
    "The user gives you an idea, and sometimes the current page to modify. You reply with exactly ONE complete HTML document that implements it.",
    "",
    "OUTPUT CONTRACT - follow exactly:",
    "- Reply with raw HTML only. No markdown fences, no commentary before or after, no 'here is your file'.",
    "- Start with <!DOCTYPE html>. Everything must be inline: CSS in <style>, JavaScript in <script>, data inline or generated procedurally.",
    "- Third-party libraries are allowed only from a CDN, loaded with <script src=\"https://esm.sh/...\"> or https://cdn.jsdelivr.net. Never depend on a build step.",
    "- The page must work when opened as a plain file and when served from GitHub Pages. Use relative paths only.",
    "- Never include API keys, tokens, passwords or any secret.",
    "- Never use alert(), prompt() or confirm(): build in-page dialogs and toasts instead.",
    "- When modifying an existing page, return the COMPLETE updated document, never a diff or a fragment.",
    "",
    "QUALITY BAR:",
    "- Responsive and touch friendly: usable from a 360px phone to a wide desktop. Use flexible layouts and pointer/touch handling.",
    "- Cohesive visual design: a deliberate palette, a consistent spacing scale, real typographic hierarchy, rounded corners, subtle depth. Never ship default-browser-looking output.",
    "- Motion with purpose: eased transitions and tasteful animation, and honour prefers-reduced-motion.",
    "- Immediate feedback on every interaction. No dead clicks.",
    "- Where the idea implies physical or generative behaviour, simulate it properly (real integration, real state, real constraints) rather than faking it with a looping animation.",
    "- Accessibility: strong contrast, visible focus, keyboard operation for anything clickable, aria-labels on icon-only buttons.",
    "- Include an in-page title and, where useful, one short line telling the user how to interact.",
    "- One clear idea, executed beautifully. Do not sprawl into a menu of half-features.",
    "- Prefer real, working behaviour over placeholders. If you show data, seed it with believable content."
  ].join("\n");

  var PACKS = [
    { id: "moderation", label: "Moderation & blocking", on: true, text: [
      "Moderation and blocking pack:",
      "- Build a believable user directory: avatars from initials, handles, join dates, status pills and last-seen times, seeded with realistic sample accounts.",
      "- Per-row actions to Block and Unblock, with the row updating immediately and a toast confirming what happened.",
      "- Multi-select with checkboxes, a select-all control, and a bulk action bar that blocks or unblocks everyone selected.",
      "- A 'Random block' panel with a numeric input for how many accounts to block at random, a plain-language summary of what will happen, and a prominent warning that it is a bulk, hard-to-reverse action.",
      "- The random block action must require an explicit confirmation in an in-page modal showing the exact count, and must choose distinct random accounts from the currently unblocked set.",
      "- Include undo (a history stack reversing the most recent block or unblock), a running activity log of who changed and when, and live counters for total, active and blocked.",
      "- Support search by handle plus a toggle to show only blocked accounts.",
      "- Persist all state in localStorage so the directory survives a reload, with a reset-to-seed control."
    ].join("\n") },
    { id: "accounts", label: "Accounts & profiles", text: [
      "Accounts and profiles pack:",
      "- Local sign-up and sign-in with profiles stored in localStorage: avatar initial, editable display name and bio.",
      "- A settings screen to change the handle and theme and to clear local data."
    ].join("\n") },
    { id: "social", label: "Feed, follow & chat", text: [
      "Social pack:",
      "- Posts with author, timestamp, reactions, replies and threading.",
      "- Follow and unfollow, a following-only feed filter, and a direct-message view with seeded conversations.",
      "- Client side only, with all state persisted to localStorage."
    ].join("\n") },
    { id: "data", label: "Data & persistence", text: [
      "Data pack:",
      "- Persist everything in localStorage or IndexedDB with a versioned schema and a safe migration path.",
      "- Provide import and export as a JSON download plus a paste-in import box, and a seed/reset control."
    ].join("\n") },
    { id: "charts", label: "Charts & dashboards", text: [
      "Dashboard pack:",
      "- Draw charts by hand on canvas or SVG (line, bar, donut, sparkline) with axes, ticks, hover tooltips and a legend.",
      "- Include a KPI strip, a filterable data table and CSV export. Do not pull in a charting library unless it genuinely helps."
    ].join("\n") },
    { id: "audio", label: "Sound & music", text: [
      "Audio pack:",
      "- Use the Web Audio API with a master gain and a mute toggle, gentle envelopes so nothing clicks, and no sound before the first user gesture.",
      "- For a musical UI include a scale-constrained sequencer and react to tempo and note events visually."
    ].join("\n") },
    { id: "physics", label: "Physics & particles", text: [
      "Simulation pack:",
      "- Integrate with a fixed timestep and interpolate for smooth rendering; conserve momentum and resolve collisions properly.",
      "- Add a pooled particle system so it stays fast, with live controls for gravity, damping and restitution."
    ].join("\n") },
    { id: "3d", label: "3D / WebGL", text: [
      "3D pack:",
      "- Use three.js from esm.sh with an orbit-style camera, real lighting, shadows and a visible ground plane.",
      "- Scale the renderer pixel ratio to the device and drop quality automatically to hold a smooth frame rate."
    ].join("\n") },
    { id: "game", label: "Game feel", text: [
      "Game pack:",
      "- Game loop with delta time, pause and resume, score, a high score in localStorage, and a clear game-over and restart flow.",
      "- Keyboard (WASD plus arrows) AND touch controls. Never bind a control the browser or OS already owns.",
      "- Screen-relative juice: easing, squash and stretch, screen shake that can be disabled, and a difficulty ramp."
    ].join("\n") },
    { id: "ai", label: "AI inside the app", text: [
      "AI pack:",
      "- The generated app may call the same free text endpoint this studio uses: POST https://text.pollinations.ai/openai with a JSON body of {model:'openai-fast', messages:[...]}.",
      "- Always show a moving loading indicator while a request is in flight, surface errors visibly, and never hardcode a secret."
    ].join("\n") },
    { id: "speech", label: "Voice & speech", text: [
      "Speech pack:",
      "- Use the Web Speech API for recognition and synthesis where it fits, with a graceful fallback and clear permission prompts."
    ].join("\n") },
    { id: "a11y", label: "Accessibility & i18n", text: [
      "Accessibility pack:",
      "- Full keyboard operation, roving focus for composite widgets, aria-live regions for async updates, and a visible high-contrast focus ring.",
      "- A light and dark theme toggle that respects prefers-color-scheme."
    ].join("\n") }
  ];

  var EXAMPLES = [
    "a moderation console for a social app with block, bulk block and a random block tool",
    "a bouncing-ball physics playground with gravity, friction and bounce sliders",
    "a tiny synth you play with the keyboard, with reverb and a step sequencer",
    "a generative art canvas that paints with flowing particles",
    "a snake game with screen shake and a locally saved high score",
    "a pomodoro timer that grows a little garden every session",
    "a CSV dashboard with hand-drawn charts and a filterable table"
  ];

  var TOOLS = [
    {
      slug: "moderation-console",
      title: "Moderation Console",
      icon: "\u26D4",
      blurb: "Block, bulk block and randomly block accounts from a seeded directory.",
      file: "tools/moderation-console.html"
    }
  ];

  var state = {
    settings: null,
    html: "",
    originPrompt: "",
    title: "",
    slug: "",
    model: "openai-fast",
    packs: {},
    busy: false,
    controller: null,
    gallery: []
  };

  /* ---------------- helpers ---------------- */

  function toast(msg, kind, ms) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(function () { el.remove(); }, ms || 3800);
  }

  function slugify(s) {
    return String(s || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "").slice(0, 48) || ("page-" + Date.now().toString(36));
  }

  function b64encode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "", chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  function b64decode(str) {
    var bin = atob(String(str || "").replace(/\s/g, ""));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function setStatus(el, text, kind, spinning) {
    el.hidden = false;
    el.className = "status" + (kind ? " " + kind : "");
    el.innerHTML = "";
    if (spinning) {
      var sp = document.createElement("span");
      sp.className = "spin";
      el.appendChild(sp);
    }
    var t = document.createElement("span");
    t.textContent = text;
    el.appendChild(t);
  }

  function humanBytes(n) { return n < 1024 ? n + " B" : (n / 1024).toFixed(1) + " KB"; }

  function shortDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  /* ---------------- settings ---------------- */

  function tokenFromHash() {
    var m = /[#&]t=([^&]+)/.exec(location.hash || "");
    if (!m) return "";
    try { return decodeURIComponent(m[1]).trim(); } catch (e) { return ""; }
  }

  function detectRepo() {
    var host = location.hostname || "";
    if (!/\.github\.io$/i.test(host)) return null;
    var owner = host.split(".")[0];
    var seg = (location.pathname || "/").split("/").filter(Boolean);
    var repo = seg.length ? seg[0] : owner + ".github.io";
    return { owner: owner, repo: repo };
  }

  function loadSettings() {
    var s = {
      owner: OWNER_DEFAULT, repo: REPO_DEFAULT, branch: BRANCH_DEFAULT,
      token: "", baseUrl: "", apiKey: "", model: "", temperature: "0.7"
    };
    try {
      var raw = localStorage.getItem(LS);
      if (raw) {
        var p = JSON.parse(raw);
        if (p.settings) {
          Object.keys(p.settings).forEach(function (k) {
            if (p.settings[k] != null && p.settings[k] !== "") s[k] = p.settings[k];
          });
        }
        if (p.packs) state.packs = p.packs;
      }
    } catch (e) {}
    var d = detectRepo();
    if (d) { s.owner = d.owner; s.repo = d.repo; }
    state.settings = s;
    PACKS.forEach(function (p) { if (state.packs[p.id] === undefined && p.on) state.packs[p.id] = true; });

    var hashToken = tokenFromHash();
    if (hashToken) {
      s.token = hashToken;
      try { localStorage.setItem(LS, JSON.stringify({ settings: s, packs: state.packs })); } catch (e) {}
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      setTimeout(function () { toast("GitHub token loaded from the URL and saved to this browser", "ok"); }, 400);
    }
    return s;
  }

  function saveSettings() {
    try { localStorage.setItem(LS, JSON.stringify({ settings: state.settings, packs: state.packs })); } catch (e) {}
  }

  function persist() {
    try {
      localStorage.setItem(LS, JSON.stringify({
        settings: state.settings, packs: state.packs, html: state.html,
        originPrompt: state.originPrompt, title: state.title, slug: state.slug
      }));
    } catch (e) {}
  }

  function restore() {
    try {
      var raw = localStorage.getItem(LS);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p.html) {
        state.html = p.html;
        state.originPrompt = p.originPrompt || "";
        state.title = p.title || "";
        state.slug = p.slug || "";
      }
    } catch (e) {}
  }

  function pagesBase() {
    var s = state.settings;
    if (s.repo === s.owner + ".github.io") return "https://" + s.owner + ".github.io/";
    return "https://" + s.owner + ".github.io/" + s.repo + "/";
  }

  function updateRepoLinks() {
    var s = state.settings;
    var repoUrl = "https://github.com/" + s.owner + "/" + s.repo;
    $("#repoLink").href = repoUrl;
    $("#footRepo").href = repoUrl;
    $("#footOwner").textContent = s.owner + "/" + s.repo;
  }

  /* ---------------- AI ---------------- */

  function activeModel() {
    var s = state.settings;
    if (s.baseUrl) return s.model || "gpt-4o-mini";
    return state.model || "openai-fast";
  }

  function buildMessages(instruction) {
    var on = PACKS.filter(function (p) { return !!state.packs[p.id]; });
    var sys = BASE_SYSTEM;
    if (on.length) {
      sys += "\n\nCAPABILITY PACKS the user enabled. Build these into the page:\n\n" +
        on.map(function (p) { return "## " + p.label + "\n" + p.text; }).join("\n\n");
    } else {
      sys += "\n\nThe user enabled no extra capability packs: keep the page focused on the core idea.";
    }
    var msgs = [{ role: "system", content: sys }];
    if (state.originPrompt) msgs.push({ role: "user", content: state.originPrompt });
    if (state.html) msgs.push({ role: "assistant", content: state.html });
    msgs.push({ role: "user", content: instruction });
    return msgs;
  }

  function cleanHtml(raw) {
    var t = String(raw || "").replace(/\r/g, "").trim();
    t = t.replace(/^```[a-zA-Z]*[ \t]*\n?/, "").replace(/\n?```[ \t]*$/, "");
    var low = t.toLowerCase();
    var i = low.indexOf("<!doctype");
    if (i === -1) i = low.indexOf("<html");
    if (i === -1) i = t.indexOf("<");
    if (i > 0) t = t.slice(i);
    return t.trim();
  }

  function extractTitle(html) {
    var m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html || "");
    if (!m) return "";
    return m[1].replace(/\s+/g, " ").replace(/[<>]/g, "").trim().slice(0, 80);
  }

  function streamChat(messages, signal, handlers) {
    var s = state.settings;
    var url, headers = { "Content-Type": "application/json" }, body;
    if (s.baseUrl) {
      url = s.baseUrl.replace(/\/+$/, "") + "/chat/completions";
      if (s.apiKey) headers.Authorization = "Bearer " + s.apiKey;
      body = { model: s.model || "gpt-4o-mini", messages: messages, stream: true, temperature: parseFloat(s.temperature) || 0.7 };
    } else {
      url = "https://text.pollinations.ai/openai";
      body = {
        model: state.model || "openai-fast",
        messages: messages,
        stream: true,
        referrer: pagesBase()
      };
    }
    return fetch(url, { method: "POST", headers: headers, body: JSON.stringify(body), signal: signal })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) {
            throw new Error("AI endpoint returned " + res.status + (t ? " - " + t.slice(0, 200) : ""));
          }, function () { throw new Error("AI endpoint returned " + res.status); });
        }
        var ct = res.headers.get("content-type") || "";
        if (ct.indexOf("event-stream") === -1 || !res.body) {
          return res.json().then(function (j) {
            if (j && j.error) throw new Error(j.error.message || "AI error");
            var full = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
            handlers.onContent(full);
            return full;
          });
        }
        var reader = res.body.getReader();
        var dec = new TextDecoder();
        var buf = "", acc = "";
        function pump() {
          return reader.read().then(function (chunk) {
            if (chunk.done) return acc;
            buf += dec.decode(chunk.value, { stream: true });
            var lines = buf.split("\n");
            buf = lines.pop();
            for (var i = 0; i < lines.length; i++) {
              var line = lines[i].trim();
              if (!line || line.indexOf("data:") !== 0) continue;
              var payload = line.slice(5).trim();
              if (payload === "[DONE]") continue;
              var obj;
              try { obj = JSON.parse(payload); } catch (e) { continue; }
              if (obj.error) throw new Error(obj.error.message || "AI error");
              var d = obj.choices && obj.choices[0] && obj.choices[0].delta;
              if (!d) continue;
              if (d.reasoning && handlers.onReasoning) handlers.onReasoning(d.reasoning);
              if (d.content) { acc += d.content; handlers.onContent(acc); }
            }
            return pump();
          });
        }
        return pump();
      });
  }

  function runBuild(instruction, isRefine) {
    if (state.busy) { if (state.controller) state.controller.abort(); return; }
    if (!isRefine && !instruction.trim()) { toast("Describe what you want built first.", "err"); return; }

    state.busy = true;
    state.controller = new AbortController();
    var t0 = Date.now();
    var genBtn = $("#generateBtn"), refBtn = $("#refineBtn"), pubBtn = $("#publishBtn");
    genBtn.textContent = "Stop";
    refBtn.disabled = true;
    pubBtn.disabled = true;
    $("#progWrap").hidden = false;
    $("#thinkFold").hidden = true;
    $("#thinkEl").textContent = "";
    var think = "";
    var statusEl = $("#statusEl");
    setStatus(statusEl, "Forging " + (isRefine ? "(refining)" : "") + "…", null, true);
    var tick = setInterval(function () {
      var el = (Date.now() - t0) / 1000;
      setStatus(statusEl, "Forging… " + el.toFixed(1) + "s · " + humanBytes(state.html.length) + " so far", null, true);
    }, 250);

    var messages = buildMessages(instruction);
    var lastLen = 0;
    var pending = null;

    streamChat(messages, state.controller.signal, {
      onReasoning: function (chunk) {
        think += chunk;
        if (think.length > 4000) think = think.slice(-4000);
        $("#thinkFold").hidden = false;
        $("#thinkEl").textContent = think;
      },
      onContent: function (acc) {
        var html = cleanHtml(acc);
        if (html.length - lastLen > 400 || html.length > 200) {
          lastLen = html.length;
          if (pending) return;
          pending = setTimeout(function () {
            pending = null;
            if (html.indexOf("<") === 0) {
              $("#previewFrame").hidden = false;
              $("#emptyState").hidden = true;
              $("#previewFrame").srcdoc = buildPreviewDoc(html);
            }
          }, 600);
        }
      }
    }).then(function (raw) {
      clearInterval(tick);
      var html = cleanHtml(raw);
      state.busy = false;
      state.controller = null;
      genBtn.textContent = "Generate";
      refBtn.disabled = false;
      pubBtn.disabled = false;
      $("#progWrap").hidden = true;
      if (!html || html.length < 40) {
        setStatus(statusEl, "The model returned nothing usable. Try again, or rephrase.", "err");
        return;
      }
      if (!isRefine) { state.originPrompt = instruction; state.slug = ""; }
      setArtifact(html, extractTitle(html));
      var secs = ((Date.now() - t0) / 1000).toFixed(1);
      setStatus(statusEl, "Built in " + secs + "s · " + html.length.toLocaleString() + " chars. Preview is on the right.", "ok");
      toast(isRefine ? "Refined" : "Built", "ok");
    }).catch(function (err) {
      clearInterval(tick);
      state.busy = false;
      state.controller = null;
      genBtn.textContent = "Generate";
      refBtn.disabled = !state.html ? true : false;
      pubBtn.disabled = !state.html;
      $("#progWrap").hidden = true;
      if (err && err.name === "AbortError") { setStatus(statusEl, "Stopped.", null); return; }
      setStatus(statusEl, (err && err.message) || "Generation failed.", "err");
      toast("Generation failed", "err");
    });
  }

  /* ---------------- preview ---------------- */

  function buildPreviewDoc(html) {
    var shim = "<script>(function(){var ok=true;try{window.localStorage.getItem(\"__probe__\");}catch(e){ok=false;}if(ok)return;" +
      "function mkWrap(){var mem={};var api={getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null;}," +
      "setItem:function(k,v){mem[String(k)]=String(v);},removeItem:function(k){delete mem[String(k)];},clear:function(){mem={};}," +
      "key:function(i){var ks=Object.keys(mem);return i<ks.length?ks[i]:null;}};" +
      "Object.defineProperty(api,\"length\",{get:function(){return Object.keys(mem).length;}});return api;}" +
      "var a=mkWrap(),b=mkWrap();try{Object.defineProperty(window,\"localStorage\",{value:a,configurable:true});}catch(e){}" +
      "try{Object.defineProperty(window,\"sessionStorage\",{value:b,configurable:true});}catch(e){}})();<\/script>";
    var m = /<head[^>]*>/i.exec(html);
    if (m) return html.slice(0, m.index + m[0].length) + shim + html.slice(m.index + m[0].length);
    var h = /<html[^>]*>/i.exec(html);
    if (h) return html.slice(0, h.index + h[0].length) + shim + html.slice(h.index + h[0].length);
    return shim + html;
  }

  function renderPreview() {
    var frame = $("#previewFrame");
    if (!state.html) {
      frame.hidden = true;
      $("#emptyState").hidden = false;
      return;
    }
    frame.hidden = false;
    $("#emptyState").hidden = true;
    frame.srcdoc = buildPreviewDoc(state.html);
  }

  function updateMeta() {
    var bar = $("#metaBar");
    bar.innerHTML = "";
    function add(k, v) {
      var s = document.createElement("span");
      s.innerHTML = "";
      var b = document.createElement("b");
      b.textContent = v;
      s.textContent = k + " ";
      s.appendChild(b);
      bar.appendChild(s);
    }
    if (!state.html) { add("", "Ready"); return; }
    add("Size", humanBytes(state.html.length));
    add("Lines", String(state.html.split("\n").length));
    add("Model", activeModel());
    if (state.originPrompt) add("Idea", state.originPrompt.slice(0, 46) + (state.originPrompt.length > 46 ? "…" : ""));
  }

  function setArtifact(html, title) {
    state.html = html;
    if (title) state.title = title;
    if (!state.title) state.title = extractTitle(html) || "Untitled";
    $("#titleInput").value = state.title;
    if (!state.slug) state.slug = slugify(state.title || state.originPrompt);
    $("#slugInput").value = state.slug;
    $("#codeEl").textContent = html;
    $("#publishBtn").disabled = false;
    $("#refineBtn").disabled = false;
    renderPreview();
    updateMeta();
    updatePublishUi();
    persist();
  }

  function loadIntoEditor(path, title) {
    fetch(path).then(function (r) {
      if (!r.ok) throw new Error("Could not load " + path);
      return r.text();
    }).then(function (t) {
      state.originPrompt = "Here is an existing page. Improve and extend it: " + (title || path);
      state.slug = slugify(title || path);
      state.title = title || extractTitle(t) || "Untitled";
      state.html = t;
      setArtifact(t, state.title);
      toast("Loaded " + (title || path) + " into the editor", "ok");
      var stage = $(".stage");
      if (stage && stage.scrollIntoView) stage.scrollIntoView({ behavior: "smooth", block: "start" });
    }).catch(function (e) { toast(e.message, "err"); });
  }

  /* ---------------- github ---------------- */

  function gh(method, path, body) {
    var s = state.settings;
    return fetch("https://api.github.com/repos/" + s.owner + "/" + s.repo + path, {
      method: method,
      headers: {
        Authorization: "Bearer " + s.token,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null;
        try { j = JSON.parse(t); } catch (e) {}
        if (r.status === 404) return null;
        if (!r.ok) throw new Error((j && j.message) || (r.status + " " + t.slice(0, 160)));
        return j;
      });
    });
  }

  function readManifest() {
    return fetch("./creations/index.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("no local manifest"); return r.json(); })
      .then(function (j) { if (Array.isArray(j)) return j; throw new Error("bad manifest"); })
      .catch(function () {
        if (!state.settings.token) return [];
        return gh("GET", "/contents/creations/index.json?ref=" + encodeURIComponent(state.settings.branch))
          .then(function (f) {
            if (!f || !f.content) return [];
            var j = JSON.parse(b64decode(f.content));
            return Array.isArray(j) ? j : [];
          })
          .catch(function () { return []; });
      });
  }

  function writeManifest(entries) {
    return gh("GET", "/contents/creations/index.json?ref=" + encodeURIComponent(state.settings.branch))
      .then(function (existing) {
        var payload = {
          message: "Forge: update creations index",
          content: b64encode(JSON.stringify(entries, null, 2) + "\n"),
          branch: state.settings.branch
        };
        if (existing && existing.sha) payload.sha = existing.sha;
        return gh("PUT", "/contents/creations/index.json", payload);
      });
  }

  function publish() {
    var s = state.settings;
    var pubStatus = $("#publishStatus");
    if (!state.html) { toast("Nothing to publish yet.", "err"); return; }
    if (!s.token) {
      setStatus(pubStatus, "Add your GitHub token in Settings to publish.", "err");
      openSettings();
      return;
    }
    var title = ($("#titleInput").value || "").trim() || "Untitled";
    var slug = slugify($("#slugInput").value || state.slug || title);
    state.title = title;
    state.slug = slug;
    $("#slugInput").value = slug;
    persist();

    var btn = $("#publishBtn");
    btn.disabled = true;
    setStatus(pubStatus, "Publishing " + slug + "…", null, true);

    var filePath = "creations/" + slug + ".html";
    gh("GET", "/contents/" + filePath + "?ref=" + encodeURIComponent(s.branch))
      .then(function (existing) {
        var payload = {
          message: "Forge: " + title,
          content: b64encode(state.html),
          branch: s.branch
        };
        if (existing && existing.sha) payload.sha = existing.sha;
        return gh("PUT", "/contents/" + filePath, payload);
      })
      .then(function () {
        return readManifest();
      })
      .then(function (entries) {
        var fresh = { slug: slug, title: title, prompt: (state.originPrompt || "").slice(0, 240), createdAt: new Date().toISOString(), model: activeModel(), chars: state.html.length };
        var next = entries.filter(function (e) { return e && e.slug !== slug; });
        next.unshift(fresh);
        return writeManifest(next);
      })
      .then(function () {
        var url = pagesBase() + "creations/" + slug + ".html";
        setStatus(pubStatus, "Published. GitHub Pages redeploys in about a minute. Live at " + url, "ok");
        toast("Published " + title, "ok");
        loadGallery();
      })
      .catch(function (e) {
        setStatus(pubStatus, "Publish failed: " + e.message, "err");
        toast("Publish failed", "err");
      })
      .then(function () { btn.disabled = false; updatePublishUi(); });
  }

  function updatePublishUi() {
    $("#publishBtn").disabled = !state.html || state.busy;
    var s = state.settings;
    $("#pubHint").textContent = s.token
      ? ("creations/ in " + s.owner + "/" + s.repo)
      : "token needed in Settings";
  }

  /* ---------------- gallery ---------------- */

  function card(parts) {
    var el = document.createElement("article");
    el.className = "card";

    var thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.textContent = parts.icon || "\u2726";
    el.appendChild(thumb);

    var body = document.createElement("div");
    body.className = "body";

    var t = document.createElement("div");
    t.className = "t";
    t.textContent = parts.title;
    if (parts.builtin) {
      var b = document.createElement("span");
      b.className = "badge";
      b.textContent = "built-in";
      t.appendChild(b);
    }
    body.appendChild(t);

    if (parts.meta) {
      var d = document.createElement("div");
      d.className = "d";
      d.textContent = parts.meta;
      body.appendChild(d);
    }
    if (parts.prompt) {
      var p = document.createElement("div");
      p.className = "p";
      p.textContent = parts.prompt;
      body.appendChild(p);
    }

    var acts = document.createElement("div");
    acts.className = "acts";
    var open = document.createElement("a");
    open.className = "mini-btn";
    open.href = parts.href;
    open.target = "_blank";
    open.rel = "noopener";
    open.textContent = "Open";
    acts.appendChild(open);
    if (parts.onEdit) {
      var edit = document.createElement("button");
      edit.className = "mini-btn";
      edit.type = "button";
      edit.textContent = "Edit";
      edit.onclick = parts.onEdit;
      acts.appendChild(edit);
    }
    body.appendChild(acts);
    el.appendChild(body);
    return el;
  }

  function renderTools() {
    var grid = $("#toolsGrid");
    grid.innerHTML = "";
    TOOLS.forEach(function (tool) {
      grid.appendChild(card({
        icon: tool.icon,
        title: tool.title,
        builtin: true,
        prompt: tool.blurb,
        href: tool.file,
        onEdit: function () { loadIntoEditor(tool.file, tool.title); }
      }));
    });
  }

  function loadGallery() {
    var grid = $("#galleryGrid");
    grid.innerHTML = "";
    var note = document.createElement("div");
    note.className = "empty-note";
    note.textContent = "Loading…";
    grid.appendChild(note);

    readManifest().then(function (entries) {
      grid.innerHTML = "";
      if (!entries.length) {
        var n = document.createElement("div");
        n.className = "empty-note";
        n.textContent = "Nothing published yet. Forge something and hit Publish — it lands in creations/ and goes live on GitHub Pages.";
        grid.appendChild(n);
        return;
      }
      entries
        .slice()
        .sort(function (a, b) { return String(b.createdAt || "").localeCompare(String(a.createdAt || "")); })
        .forEach(function (e) {
          if (!e || !e.slug) return;
          grid.appendChild(card({
            icon: "\u2726",
            title: e.title || e.slug,
            meta: [shortDate(e.createdAt), e.model, e.chars ? humanBytes(e.chars) : ""].filter(Boolean).join(" · "),
            prompt: e.prompt || "",
            href: e.href || ("creations/" + e.slug + ".html"),
            onEdit: (function (entry) {
              return function () {
                loadIntoEditor(entry.href || ("creations/" + entry.slug + ".html"), entry.title || entry.slug);
              };
            })(e)
          }));
        });
      $("#gallerySub").textContent = entries.length + " creation" + (entries.length === 1 ? "" : "s") + " published.";
    });
  }

  /* ---------------- settings dialog ---------------- */

  function openSettings() {
    var s = state.settings;
    $("#setToken").value = s.token || "";
    $("#setOwner").value = s.owner;
    $("#setRepo").value = s.repo;
    $("#setBranch").value = s.branch;
    $("#setTemp").value = s.temperature || "0.7";
    $("#setBaseUrl").value = s.baseUrl || "";
    $("#setModel").value = s.model || "";
    $("#setApiKey").value = s.apiKey || "";
    var dlg = $("#settingsDlg");
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }

  function applySettings() {
    var s = state.settings;
    s.token = $("#setToken").value.trim();
    s.owner = $("#setOwner").value.trim() || OWNER_DEFAULT;
    s.repo = $("#setRepo").value.trim() || REPO_DEFAULT;
    s.branch = $("#setBranch").value.trim() || BRANCH_DEFAULT;
    s.temperature = $("#setTemp").value;
    s.baseUrl = $("#setBaseUrl").value.trim();
    s.model = $("#setModel").value.trim();
    s.apiKey = $("#setApiKey").value.trim();
    saveSettings();
    updateRepoLinks();
    updatePublishUi();
    fillModels();
    updateMeta();
    toast("Settings saved", "ok");
  }

  function fillModels() {
    var sel = $("#modelSelect");
    sel.innerHTML = "";
    var s = state.settings;
    if (s.baseUrl) {
      var o = document.createElement("option");
      o.value = "__custom__";
      o.textContent = "Custom · " + (s.model || "model");
      sel.appendChild(o);
      sel.value = "__custom__";
      return;
    }
    [["openai-fast", "gpt-oss-20b · free"], ["openai", "openai · free"]].forEach(function (p) {
      var opt = document.createElement("option");
      opt.value = p[0];
      opt.textContent = p[1];
      sel.appendChild(opt);
    });
    sel.value = state.model || "openai-fast";
  }

  /* ---------------- wiring ---------------- */

  function renderChips() {
    var box = $("#chips");
    box.innerHTML = "";
    EXAMPLES.forEach(function (ex) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = ex.length > 42 ? ex.slice(0, 40) + "…" : ex;
      b.title = ex;
      b.onclick = function () { $("#promptInput").value = ex; $("#promptInput").focus(); };
      box.appendChild(b);
    });
  }

  function renderPacks() {
    var list = $("#packList");
    list.innerHTML = "";
    PACKS.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pack" + (state.packs[p.id] ? " on" : "");
      b.textContent = p.label;
      b.setAttribute("aria-pressed", state.packs[p.id] ? "true" : "false");
      b.onclick = function () {
        state.packs[p.id] = !state.packs[p.id];
        renderPacks();
        saveSettings();
      };
      list.appendChild(b);
    });
    var n = PACKS.filter(function (p) { return state.packs[p.id]; }).length;
    $("#packsCount").textContent = n + " of " + PACKS.length + " on";
  }

  function wire() {
    $("#generateBtn").onclick = function () {
      if (state.busy) { if (state.controller) state.controller.abort(); return; }
      runBuild($("#promptInput").value, false);
    };
    $("#refineBtn").onclick = function () {
      var v = $("#refineInput").value;
      if (!v.trim()) { toast("Describe the change first.", "err"); return; }
      runBuild(v, true);
    };
    $("#publishBtn").onclick = publish;
    $("#settingsBtn").onclick = openSettings;
    $("#refreshGalleryBtn").onclick = loadGallery;
    $("#saveSettingsBtn").onclick = function () { applySettings(); };

    $("#reloadBtn").onclick = function () { renderPreview(); };
    $("#copyBtn").onclick = function () {
      if (!state.html) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(state.html).then(function () { toast("HTML copied", "ok"); }, function () { toast("Copy failed", "err"); });
      } else { toast("Clipboard unavailable", "err"); }
    };
    $("#openBtn").onclick = function () {
      if (!state.html) return;
      var url = URL.createObjectURL(new Blob([state.html], { type: "text/html" }));
      window.open(url, "_blank", "noopener");
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    };

    $("#tabPreview").onclick = function () {
      $("#tabPreview").classList.add("active");
      $("#tabCode").classList.remove("active");
      $("#codeView").hidden = true;
      if (state.html) $("#previewFrame").hidden = false;
    };
    $("#tabCode").onclick = function () {
      $("#tabCode").classList.add("active");
      $("#tabPreview").classList.remove("active");
      $("#previewFrame").hidden = true;
      $("#codeView").hidden = false;
    };

    $$(".device-btn").forEach(function (b) {
      b.onclick = function () {
        $$(".device-btn").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        $("#previewFrame").style.width = b.getAttribute("data-w");
      };
    });

    $("#titleInput").oninput = function () {
      state.title = this.value;
      if (!this.value) return;
      if (!$("#slugInput").value || $("#slugInput").dataset.auto !== "off") {
        $("#slugInput").value = slugify(this.value);
        $("#slugInput").dataset.auto = "on";
        state.slug = $("#slugInput").value;
      }
      persist();
    };
    $("#slugInput").oninput = function () {
      this.dataset.auto = "off";
      state.slug = slugify(this.value);
      this.value = state.slug;
      persist();
    };

    var ta = $("#promptInput");
    ta.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); runBuild(ta.value, false); }
    });
    $("#refineInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); $("#refineBtn").click(); }
    });

    $("#settingsForm").addEventListener("submit", function (e) {
      var v = e.submitter && e.submitter.value;
      if (v === "save") applySettings();
    });

    window.addEventListener("beforeunload", persist);
  }

  function init() {
    loadSettings();
    restore();
    fillModels();
    renderChips();
    renderPacks();
    renderTools();
    wire();
    updateRepoLinks();
    updatePublishUi();
    if (state.html) {
      $("#codeEl").textContent = state.html;
      $("#titleInput").value = state.title || "";
      $("#slugInput").value = state.slug || "";
      $("#publishBtn").disabled = false;
      $("#refineBtn").disabled = false;
      renderPreview();
      updateMeta();
    }
    loadGallery();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.AIForge = { state: state, runBuild: runBuild, publish: publish };
})();
