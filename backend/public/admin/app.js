/* The Creator Creations — Admin Dashboard (vanilla JS SPA, no build step required) */

const API = "/api";
const root = document.getElementById("root");
let TOKEN = localStorage.getItem("ax_token") || null;
let CURRENT_USER = null;

/* ---------------- API helper ---------------- */
async function api(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;
  if (!isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

function logout() {
  TOKEN = null;
  localStorage.removeItem("ax_token");
  CURRENT_USER = null;
  render();
}

/* ---------------- Toast ---------------- */
function toast(message, isError = false) {
  const el = document.createElement("div");
  el.className = "toast" + (isError ? " error" : "");
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ---------------- Resource configs ---------------- */
const RESOURCES = {
  projects: {
    title: "Projects", desc: "Manage the portfolio pieces shown in Selected Works.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "category", label: "Category", type: "text", required: true },
      { key: "year", label: "Year", type: "text", required: true },
      { key: "color", label: "Accent color (CSS)", type: "text", placeholder: "hsl(45, 100%, 55%)" },
      { key: "image", label: "Image", type: "image" },
      { key: "liveUrl", label: "Live site / demo URL (optional)", type: "text", placeholder: "https://yourdemo.com — leave blank to show the full-image preview instead" },
      { key: "order", label: "Order", type: "number" },
    ],
    columns: [
      { key: "image", label: "", isImage: true },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "year", label: "Year" },
      { key: "order", label: "Order" },
    ],
  },
  services: {
    title: "Services", desc: "Manage the offerings shown in the Services grid.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "icon", label: "Icon (lucide-react name)", type: "text", placeholder: "Palette" },
      { key: "order", label: "Order", type: "number" },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      { key: "icon", label: "Icon" },
      { key: "order", label: "Order" },
    ],
  },
  skills: {
    title: "Skills", desc: "Manage the skill bars shown on the designer profile.",
    fields: [
      { key: "name", label: "Skill name", type: "text", required: true },
      { key: "level", label: "Level (0-100)", type: "number", required: true },
      { key: "order", label: "Order", type: "number" },
    ],
    columns: [
      { key: "name", label: "Name" },
      { key: "level", label: "Level" },
      { key: "order", label: "Order" },
    ],
  },
  tools: {
    title: "Tools & Languages", desc: "Manage the icon lists shown under the designer's photo (\"Tools I Use\" and \"Languages I Code With\").",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "Figma" },
      { key: "logoUrl", label: "Logo URL", type: "text", required: true, placeholder: "https://.../logo.svg" },
      { key: "type", label: "Section", type: "select", options: ["tool", "language"], required: true },
      { key: "order", label: "Order", type: "number" },
    ],
    columns: [
      { key: "logoUrl", label: "", isImage: true },
      { key: "name", label: "Name" },
      { key: "type", label: "Section" },
      { key: "order", label: "Order" },
    ],
  },
  "featured-slides": {
    title: "Featured Slider", desc: "Manage the big cinematic fullscreen slider shown right after Selected Works.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "subtitle", label: "Subtitle", type: "text", required: true },
      { key: "tag", label: "Category tag", type: "text", required: true, placeholder: "Brand Identity" },
      { key: "image", label: "Background image", type: "image" },
      { key: "liveUrl", label: "Live site / demo URL (optional)", type: "text", placeholder: "https://yourdemo.com — leave blank to link to the category page instead" },
      { key: "order", label: "Order", type: "number" },
    ],
    columns: [
      { key: "image", label: "", isImage: true },
      { key: "title", label: "Title" },
      { key: "tag", label: "Tag" },
      { key: "order", label: "Order" },
    ],
  },
  milestones: {
    title: "Journey / Milestones", desc: "Manage the career-timeline slider in the designer profile.",
    fields: [
      { key: "year", label: "Year", type: "text", required: true },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "image", label: "Background image", type: "image" },
      { key: "order", label: "Order", type: "number" },
    ],
    columns: [
      { key: "image", label: "", isImage: true },
      { key: "year", label: "Year" },
      { key: "title", label: "Title" },
      { key: "order", label: "Order" },
    ],
  },
  stats: {
    title: "About Stats", desc: "Manage the stat counters in the About section (150+ Projects, etc).",
    fields: [
      { key: "value", label: "Value", type: "text", required: true, placeholder: "150+" },
      { key: "label", label: "Label", type: "text", required: true, placeholder: "Projects Completed" },
      { key: "order", label: "Order", type: "number" },
    ],
    columns: [
      { key: "value", label: "Value" },
      { key: "label", label: "Label" },
      { key: "order", label: "Order" },
    ],
  },
};

/* ---------------- Router ---------------- */
function currentRoute() {
  return (location.hash || "#/dashboard").replace("#/", "");
}

window.addEventListener("hashchange", render);

async function render() {
  if (!TOKEN) return renderLogin();
  try {
    if (!CURRENT_USER) CURRENT_USER = await api("/auth/me");
  } catch (e) {
    return renderLogin();
  }
  renderShell();
}

/* ---------------- Login screen ---------------- */
function renderLogin() {
  root.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="brand" style="display:flex;align-items:center;gap:10px">
          <img src="assets/logo.png" alt="" style="height:34px;width:34px;object-fit:contain" />
          <span>THE CREATOR CREATIONS</span>
        </div>
        <div class="brand-sub">Admin Dashboard</div>
        <form id="login-form">
          <label>Username</label>
          <input name="username" value="admin" autocomplete="username" />
          <label>Password</label>
          <input name="password" type="password" placeholder="admin123" autocomplete="current-password" />
          <div id="login-error" class="error-text" style="display:none"></div>
          <button class="btn btn-block" type="submit">Sign In</button>
        </form>
        <p class="hint-text" style="margin-top:16px">Default credentials: <strong>admin / admin123</strong> — change this after first login.</p>
      </div>
    </div>
  `;

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const errorEl = document.getElementById("login-error");
    errorEl.style.display = "none";
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { username: fd.get("username"), password: fd.get("password") },
      });
      TOKEN = data.token;
      localStorage.setItem("ax_token", TOKEN);
      CURRENT_USER = data.user;
      location.hash = "#/dashboard";
      render();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = "block";
    }
  });
}

/* ---------------- App shell ---------------- */
const NAV = [
  { route: "dashboard", label: "Overview" },
  { route: "projects", label: "Projects" },
  { route: "services", label: "Services" },
  { route: "skills", label: "Skills" },
  { route: "tools", label: "Tools & Languages" },
  { route: "featured-slides", label: "Featured Slider" },
  { route: "milestones", label: "Journey" },
  { route: "stats", label: "About Stats" },
  { route: "messages", label: "Messages" },
  { route: "subscribers", label: "Subscribers" },
  { route: "settings", label: "Site Settings" },
  { route: "account", label: "Account" },
];

function renderShell() {
  const route = currentRoute();
  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand" style="display:flex;align-items:center;gap:8px;font-size:15px;line-height:1.15">
          <img src="assets/logo.png" alt="" style="height:28px;width:28px;object-fit:contain;flex-shrink:0" />
          <span>THE CREATOR<br/>CREATIONS</span>
        </div>
        <nav>
          ${NAV.map(n => `<button class="nav-item ${route === n.route ? "active" : ""}" data-route="${n.route}">${n.label}</button>`).join("")}
        </nav>
        <div class="sidebar-footer">
          <div style="font-size:13px;color:var(--muted);margin-bottom:10px">Signed in as <strong style="color:var(--text)">${CURRENT_USER?.username || ""}</strong></div>
          <button class="btn btn-outline btn-block btn-sm" id="logout-btn">Log Out</button>
        </div>
      </aside>
      <main class="main" id="main"></main>
    </div>
  `;

  root.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => { location.hash = `#/${btn.dataset.route}`; });
  });
  document.getElementById("logout-btn").addEventListener("click", logout);

  const main = document.getElementById("main");

  if (route === "dashboard") return renderDashboard(main);
  if (route === "messages") return renderMessages(main);
  if (route === "subscribers") return renderSubscribers(main);
  if (route === "settings") return renderSettings(main);
  if (route === "account") return renderAccount(main);
  if (RESOURCES[route]) return renderResource(main, route);

  main.innerHTML = `<div class="empty-state">Page not found.</div>`;
}

/* ---------------- Dashboard ---------------- */
async function renderDashboard(main) {
  main.innerHTML = `<div class="page-header"><h1 class="page-title">Overview</h1></div><div id="dash-content">Loading…</div>`;
  try {
    const data = await api("/dashboard");
    const c = data.counts;
    document.getElementById("dash-content").innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-value">${c.projects}</div><div class="stat-label">Projects</div></div>
        <div class="stat-card"><div class="stat-value">${c.services}</div><div class="stat-label">Services</div></div>
        <div class="stat-card"><div class="stat-value">${c.messages}</div><div class="stat-label">Messages (${c.unreadMessages} unread)</div></div>
        <div class="stat-card"><div class="stat-value">${c.subscribers}</div><div class="stat-label">Newsletter Subscribers</div></div>
      </div>
      <div class="card">
        <h3 style="margin-top:0">Recent Messages</h3>
        ${data.recentMessages.length ? `
          <table><thead><tr><th>Name</th><th>Subject</th><th>Received</th></tr></thead>
          <tbody>${data.recentMessages.map(m => `<tr><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.subject)}</td><td>${new Date(m.createdAt).toLocaleString()}</td></tr>`).join("")}</tbody></table>
        ` : `<div class="empty-state">No messages yet.</div>`}
      </div>
      <div class="card">
        <h3 style="margin-top:0">Recent Subscribers</h3>
        ${data.recentSubscribers.length ? `
          <table><thead><tr><th>Email</th><th>Subscribed</th></tr></thead>
          <tbody>${data.recentSubscribers.map(s => `<tr><td>${escapeHtml(s.email)}</td><td>${new Date(s.createdAt).toLocaleString()}</td></tr>`).join("")}</tbody></table>
        ` : `<div class="empty-state">No subscribers yet.</div>`}
      </div>
    `;
  } catch (e) {
    document.getElementById("dash-content").innerHTML = `<div class="empty-state">${e.message}</div>`;
  }
}

/* ---------------- Generic resource CRUD ---------------- */
async function renderResource(main, resourceKey) {
  const config = RESOURCES[resourceKey];
  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${config.title}</h1>
        <div class="page-sub">${config.desc}</div>
      </div>
      <button class="btn" id="add-btn">+ Add ${singularize(config.title)}</button>
    </div>
    <div class="card"><div id="table-wrap">Loading…</div></div>
  `;

  document.getElementById("add-btn").addEventListener("click", () => openResourceModal(resourceKey, null));

  await loadResourceTable(resourceKey);
}

async function loadResourceTable(resourceKey) {
  const config = RESOURCES[resourceKey];
  const wrap = document.getElementById("table-wrap");
  try {
    const items = await api(`/${resourceKey}`);
    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state">Nothing here yet. Click "Add" to create the first entry.</div>`;
      return;
    }
    wrap.innerHTML = `
      <table>
        <thead><tr>${config.columns.map(c => `<th>${c.label}</th>`).join("")}<th></th></tr></thead>
        <tbody>
          ${items.map(item => `
            <tr>
              ${config.columns.map(c => c.isImage
                ? `<td>${item[c.key] ? `<img class="thumb" src="${item[c.key]}" />` : `<div class="thumb"></div>`}</td>`
                : `<td>${escapeHtml(String(item[c.key] ?? ""))}</td>`
              ).join("")}
              <td class="actions">
                <button class="btn btn-outline btn-sm" data-edit="${item.id}">Edit</button>
                <button class="btn btn-danger btn-sm" data-delete="${item.id}">Delete</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = items.find(i => i.id === Number(btn.dataset.edit));
        openResourceModal(resourceKey, item);
      });
    });
    wrap.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this item? This cannot be undone.")) return;
        try {
          await api(`/${resourceKey}/${btn.dataset.delete}`, { method: "DELETE" });
          toast("Deleted");
          loadResourceTable(resourceKey);
        } catch (e) {
          toast(e.message, true);
        }
      });
    });
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state">${e.message}</div>`;
  }
}

/** Wires up every image-type field's file input inside a given container (modal or form). */
function wireImageFields(container, fields) {
  fields.filter(f => f.type === "image").forEach(f => {
    const fileInput = container.querySelector(`[data-file-for="${f.key}"]`);
    const hiddenInput = container.querySelector(`[name="${f.key}"]`);
    const preview = container.querySelector(`[data-preview-for="${f.key}"]`);
    if (!fileInput) return;
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("image", file);
      try {
        const res = await api("/upload", { method: "POST", body: fd, isForm: true });
        hiddenInput.value = res.url;
        preview.src = res.url;
        preview.style.display = "block";
        toast("Image uploaded — don't forget to save");
      } catch (e) {
        toast(e.message, true);
      }
    });
  });
}

function openResourceModal(resourceKey, item) {
  const config = RESOURCES[resourceKey];
  const isEdit = !!item;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h3>${isEdit ? "Edit" : "Add"} ${singularize(config.title)}</h3>
      <form id="resource-form">
        ${config.fields.map(f => renderField(f, item)).join("")}
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="cancel-btn">Cancel</button>
          <button type="submit" class="btn">${isEdit ? "Save Changes" : "Create"}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector("#cancel-btn").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

  wireImageFields(overlay, config.fields);

  overlay.querySelector("#resource-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {};
    config.fields.forEach(f => {
      let val = fd.get(f.key);
      if (f.type === "number") val = val === "" ? 0 : Number(val);
      payload[f.key] = val;
    });

    try {
      if (isEdit) {
        await api(`/${resourceKey}/${item.id}`, { method: "PUT", body: payload });
        toast("Saved");
      } else {
        await api(`/${resourceKey}`, { method: "POST", body: payload });
        toast("Created");
      }
      overlay.remove();
      loadResourceTable(resourceKey);
    } catch (e) {
      toast(e.message, true);
    }
  });
}

function renderField(f, item) {
  const value = item ? (item[f.key] ?? "") : (f.type === "number" ? 0 : "");
  if (f.type === "textarea") {
    return `<label>${f.label}</label><textarea name="${f.key}" rows="3" placeholder="${f.placeholder || ""}">${escapeHtml(String(value))}</textarea>`;
  }
  if (f.type === "image") {
    return `
      <label>${f.label}</label>
      <input type="file" accept="image/*" data-file-for="${f.key}" style="margin-bottom:8px" />
      <input type="hidden" name="${f.key}" value="${escapeHtml(String(value))}" />
      <img data-preview-for="${f.key}" class="thumb" style="width:100%;height:120px;object-fit:cover;display:${value ? "block" : "none"};margin-bottom:16px" src="${value}" />
    `;
  }
  if (f.type === "color") {
    const hex = /^#[0-9a-fA-F]{6}$/.test(String(value)) ? value : "#000000";
    return `
      <label>${f.label}</label>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <input type="color" name="${f.key}" value="${hex}" style="width:48px;height:40px;padding:2px;border-radius:8px;cursor:pointer;flex-shrink:0" />
        <span style="color:var(--muted);font-size:12px;font-family:monospace">${hex}</span>
      </div>
    `;
  }
  if (f.type === "select") {
    const options = f.options || [];
    return `
      <label>${f.label}</label>
      <select name="${f.key}">
        ${options.map(opt => `<option value="${opt}" ${String(value) === opt ? "selected" : ""}>${opt}</option>`).join("")}
      </select>
    `;
  }
  return `<label>${f.label}${f.required ? " *" : ""}</label><input name="${f.key}" type="${f.type === "number" ? "number" : "text"}" value="${escapeHtml(String(value))}" placeholder="${f.placeholder || ""}" ${f.required ? "required" : ""} />`;
}

/* ---------------- Messages ---------------- */
async function renderMessages(main) {
  main.innerHTML = `
    <div class="page-header"><h1 class="page-title">Contact Messages</h1></div>
    <div class="card"><div id="msg-wrap">Loading…</div></div>
  `;
  await loadMessages();
}

async function loadMessages() {
  const wrap = document.getElementById("msg-wrap");
  try {
    const items = await api("/messages");
    if (!items.length) { wrap.innerHTML = `<div class="empty-state">No messages yet.</div>`; return; }
    wrap.innerHTML = `
      <table>
        <thead><tr><th></th><th>From</th><th>Subject</th><th>Message</th><th>Received</th><th></th></tr></thead>
        <tbody>
          ${items.map(m => `
            <tr>
              <td>${m.read ? `<span class="badge badge-muted">Read</span>` : `<span class="badge badge-primary">New</span>`}</td>
              <td>${escapeHtml(m.name)}<br/><span style="color:var(--muted);font-size:12px">${escapeHtml(m.email)}</span></td>
              <td>${escapeHtml(m.subject)}</td>
              <td style="max-width:280px">${escapeHtml(m.message)}</td>
              <td>${new Date(m.createdAt).toLocaleString()}</td>
              <td class="actions">
                <button class="btn btn-outline btn-sm" data-toggle="${m.id}" data-read="${m.read}">${m.read ? "Mark unread" : "Mark read"}</button>
                <button class="btn btn-danger btn-sm" data-del="${m.id}">Delete</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    wrap.querySelectorAll("[data-toggle]").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api(`/messages/${btn.dataset.toggle}`, { method: "PUT", body: { read: btn.dataset.read !== "true" } });
        loadMessages();
      });
    });
    wrap.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this message?")) return;
        await api(`/messages/${btn.dataset.del}`, { method: "DELETE" });
        toast("Deleted");
        loadMessages();
      });
    });
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state">${e.message}</div>`;
  }
}

/* ---------------- Subscribers ---------------- */
async function renderSubscribers(main) {
  main.innerHTML = `
    <div class="page-header"><h1 class="page-title">Newsletter Subscribers</h1></div>
    <div class="card"><div id="sub-wrap">Loading…</div></div>
  `;
  const wrap = document.getElementById("sub-wrap");
  try {
    const items = await api("/subscribers");
    if (!items.length) { wrap.innerHTML = `<div class="empty-state">No subscribers yet.</div>`; return; }
    wrap.innerHTML = `
      <table>
        <thead><tr><th>Email</th><th>Subscribed</th><th></th></tr></thead>
        <tbody>
          ${items.map(s => `
            <tr>
              <td>${escapeHtml(s.email)}</td>
              <td>${new Date(s.createdAt).toLocaleString()}</td>
              <td class="actions"><button class="btn btn-danger btn-sm" data-del="${s.id}">Delete</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    wrap.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Remove this subscriber?")) return;
        await api(`/subscribers/${btn.dataset.del}`, { method: "DELETE" });
        toast("Removed");
        renderSubscribers(document.getElementById("main"));
      });
    });
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state">${e.message}</div>`;
  }
}

/* ---------------- Settings ---------------- */
const FONT_OPTIONS = [
  "Syne", "Space Grotesk", "Poppins", "Playfair Display", "Montserrat",
  "Inter", "Sora", "Outfit", "DM Sans", "Manrope", "Work Sans", "Bebas Neue",
];

const SETTINGS_FIELDS = [
  { key: "siteName", label: "Site Name" },
  { key: "tagline", label: "Tagline" },
  { key: "logoImage", label: "Logo", type: "image" },
];

const THEME_FIELDS = [
  { key: "primaryColor", label: "Primary color", type: "color" },
  { key: "accentColor", label: "Accent color", type: "color" },
  { key: "headingFont", label: "Heading font", type: "select", options: FONT_OPTIONS },
  { key: "bodyFont", label: "Body font", type: "select", options: FONT_OPTIONS },
];

const HERO_FIELDS = [
  { key: "heroImage", label: "Hero background image", type: "image" },
  { key: "heroTitleLine1", label: "Hero — line 1" },
  { key: "heroTitleHighlight", label: "Hero — highlighted word" },
  { key: "heroTitleLine2", label: "Hero — line 2" },
  { key: "heroSubtitle", label: "Hero subtitle", type: "textarea" },
];

const ABOUT_FIELDS = [
  { key: "aboutHeading", label: "About heading" },
  { key: "aboutParagraph1", label: "About paragraph 1", type: "textarea" },
  { key: "aboutParagraph2", label: "About paragraph 2", type: "textarea" },
];

const DESIGNER_FIELDS = [
  { key: "designerName", label: "Designer name" },
  { key: "designerTitle", label: "Designer title" },
  { key: "designerImage", label: "Designer photo", type: "image" },
  { key: "designerBio1", label: "Designer bio 1", type: "textarea" },
  { key: "designerBio2", label: "Designer bio 2", type: "textarea" },
  { key: "yearsExperience", label: "Years experience", type: "number" },
];

const CONTACT_FIELDS = [
  { key: "contactEmail", label: "Contact email" },
  { key: "contactPhone", label: "Contact phone" },
  { key: "contactLocation", label: "Contact location" },
];

const ALL_FLAT_FIELDS = [
  ...SETTINGS_FIELDS, ...THEME_FIELDS, ...HERO_FIELDS,
  ...ABOUT_FIELDS, ...DESIGNER_FIELDS, ...CONTACT_FIELDS,
];

function settingsSection(title, desc, fields, settings) {
  return `
    <h3 style="margin:32px 0 4px">${title}</h3>
    ${desc ? `<p class="section-desc">${desc}</p>` : ""}
    ${fields.map(f => renderField(f, settings)).join("")}
  `;
}

async function renderSettings(main) {
  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Site Settings</h1>
        <div class="page-sub">Every picture, color, font, and headline on the site lives here or in Projects / Journey.</div>
      </div>
    </div>
    <div class="card"><div id="settings-wrap">Loading…</div></div>
  `;
  const wrap = document.getElementById("settings-wrap");
  try {
    const settings = await api("/settings");
    let socialLinks = Array.isArray(settings.socialLinks) ? [...settings.socialLinks] : [];

    wrap.innerHTML = `
      <form id="settings-form">
        <h3 style="margin-top:0">Branding</h3>
        ${SETTINGS_FIELDS.map(f => renderField(f, settings)).join("")}

        ${settingsSection("Theme", "Changes the color palette and typography across the whole site.", THEME_FIELDS, settings)}
        ${settingsSection("Hero Section", null, HERO_FIELDS, settings)}
        ${settingsSection("About Section", null, ABOUT_FIELDS, settings)}
        ${settingsSection("Designer Profile", null, DESIGNER_FIELDS, settings)}
        ${settingsSection("Contact Info", null, CONTACT_FIELDS, settings)}

        <h3 style="margin:32px 0 4px">Social Links</h3>
        <p class="section-desc">Shown in the footer. Add as many as you like.</p>
        <div id="social-links-wrap"></div>
        <button type="button" class="btn btn-outline btn-sm" id="add-social-btn" style="margin-bottom:24px">+ Add Social Link</button>

        <button class="btn" type="submit">Save Settings</button>
      </form>
    `;
    wireImageFields(wrap, ALL_FLAT_FIELDS);

    const socialWrap = document.getElementById("social-links-wrap");
    function renderSocialRows() {
      socialWrap.innerHTML = socialLinks.map((s, i) => {
        const hasUrl = s.url && s.url.trim() && s.url.trim() !== "#";
        return `
        <div class="form-row" style="margin-bottom:10px;align-items:center;grid-template-columns:1fr 1fr auto auto">
          <input data-social-label="${i}" value="${escapeHtml(s.label || "")}" placeholder="Platform (e.g. Instagram)" />
          <input data-social-url="${i}" value="${escapeHtml(s.url || "")}" placeholder="https://instagram.com/yourhandle" />
          <button type="button" class="btn btn-outline btn-sm" data-social-visit="${i}" ${hasUrl ? "" : "disabled"} title="${hasUrl ? "Open this link in a new tab" : "Enter a URL first"}">Visit ↗</button>
          <button type="button" class="btn btn-danger btn-sm" data-social-remove="${i}">Remove</button>
        </div>
      `;
      }).join("") || `<p class="section-desc">No social links yet.</p>`;

      socialWrap.querySelectorAll("[data-social-label]").forEach(input => {
        input.addEventListener("input", () => { socialLinks[Number(input.dataset.socialLabel)].label = input.value; });
      });
      socialWrap.querySelectorAll("[data-social-url]").forEach(input => {
        input.addEventListener("input", () => {
          socialLinks[Number(input.dataset.socialUrl)].url = input.value;
          const visitBtn = socialWrap.querySelector(`[data-social-visit="${input.dataset.socialUrl}"]`);
          const hasUrl = input.value && input.value.trim() && input.value.trim() !== "#";
          visitBtn.disabled = !hasUrl;
          visitBtn.title = hasUrl ? "Open this link in a new tab" : "Enter a URL first";
        });
      });
      socialWrap.querySelectorAll("[data-social-visit]").forEach(btn => {
        btn.addEventListener("click", () => {
          const url = socialLinks[Number(btn.dataset.socialVisit)].url;
          window.open(url, "_blank", "noopener,noreferrer");
        });
      });
      socialWrap.querySelectorAll("[data-social-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
          socialLinks.splice(Number(btn.dataset.socialRemove), 1);
          renderSocialRows();
        });
      });
    }
    renderSocialRows();

    document.getElementById("add-social-btn").addEventListener("click", () => {
      socialLinks.push({ label: "", url: "" });
      renderSocialRows();
    });

    document.getElementById("settings-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = {};
      ALL_FLAT_FIELDS.forEach(f => {
        let v = fd.get(f.key);
        if (f.type === "number") v = Number(v);
        payload[f.key] = v;
      });
      payload.socialLinks = socialLinks.filter(s => s.label.trim() || s.url.trim());
      try {
        await api("/settings", { method: "PUT", body: payload });
        toast("Settings saved");
      } catch (e) {
        toast(e.message, true);
      }
    });
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state">${e.message}</div>`;
  }
}

/* ---------------- Account ---------------- */
async function renderAccount(main) {
  main.innerHTML = `
    <div class="page-header"><h1 class="page-title">Account</h1></div>
    <div class="card" style="max-width:420px">
      <h3 style="margin-top:0">Change Password</h3>
      <form id="pw-form">
        <label>Current Password</label>
        <input name="currentPassword" type="password" required />
        <label>New Password</label>
        <input name="newPassword" type="password" required minlength="6" />
        <div id="pw-error" class="error-text" style="display:none"></div>
        <button class="btn" type="submit">Update Password</button>
      </form>
    </div>
  `;
  document.getElementById("pw-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const errorEl = document.getElementById("pw-error");
    errorEl.style.display = "none";
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: { currentPassword: fd.get("currentPassword"), newPassword: fd.get("newPassword") },
      });
      toast("Password updated");
      e.target.reset();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = "block";
    }
  });
}

/* ---------------- Utils ---------------- */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function singularize(word) {
  return word.endsWith("s") ? word.slice(0, -1) : word;
}

render();
