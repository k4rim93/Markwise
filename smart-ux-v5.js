/* Markwise Smart UX v5 — opt-in reading views and bulk selection */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const list = $("list"), toolbar = document.querySelector(".mw-toolbar");
  if (!list || !toolbar || $("mwSmartFilter")) return;
  const view = document.createElement("select");
  view.id = "mwSmartFilter";
  view.setAttribute("aria-label", "Smart views");
  view.innerHTML = '<option value="all">All links</option><option value="pinned">Pinned</option><option value="to-read">To read</option><option value="in-progress">In progress</option><option value="done">Completed</option>';
  view.style.cssText = "width:100%;min-height:42px;margin:8px 0;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:0 10px";
  toolbar.append(view);
  const selected = new Set();
  const bar = document.createElement("div");
  bar.style.cssText = "display:none;gap:8px;align-items:center;flex-wrap:wrap;padding:10px;margin:0 0 12px;border:1px solid var(--line);border-radius:14px;background:var(--panel)";
  bar.innerHTML = '<strong id="mwBulkCount">0 selected</strong><select id="mwBulkMove" aria-label="Move selected links" style="flex:1;min-width:120px;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px"></select><button class="secondary" id="mwBulkMoveBtn" type="button">Move</button><button class="secondary" id="mwBulkDeleteBtn" type="button">Delete</button><button class="linkbtn" id="mwBulkClear" type="button">Clear</button>';
  toolbar.insertAdjacentElement("afterend", bar);
  function paint() {
    const cards = [...list.querySelectorAll(".item")];
    cards.forEach(card => {
      let box = card.querySelector(".mw-bulk-check");
      const title = card.querySelector(".title")?.textContent || "";
      const urlText = card.querySelector(".url")?.textContent || "";
      const key = card.dataset.mwBulkKey || (card.dataset.mwBulkKey = title + "|" + urlText);
      if (!box) {
        box = document.createElement("input"); box.type = "checkbox"; box.className = "mw-bulk-check";
        box.setAttribute("aria-label", "Select link"); box.style.cssText = "width:20px;height:20px;accent-color:var(--accent);margin:2px 6px 6px 0";
        card.querySelector(".src")?.before(box);
        box.addEventListener("change", () => { box.checked ? selected.add(key) : selected.delete(key); updateBar(); });
      }
      box.checked = selected.has(key);
      const filter = view.value;
      const pinned = card.classList.contains("mw-pinned");
      const status = card.querySelector(".mw-status")?.dataset.status || "saved";
      card.hidden = filter === "pinned" ? !pinned : filter === "all" ? false : status !== filter;
      if (!card.querySelector(".mw-link-preview")) {
        const d = document.createElement("details"); d.className = "mw-link-preview";
        d.style.cssText = "margin-top:8px;padding:9px;border:1px solid var(--line);border-radius:10px;font-size:12px;overflow-wrap:anywhere";
        const summary = document.createElement("summary"); summary.textContent = "Preview details";
        const copy = document.createElement("div"); copy.style.cssText = "margin-top:6px;color:var(--muted)";
        copy.textContent = card.querySelector(".note")?.textContent || "No saved note.";
        d.append(summary, copy); card.querySelector(".title")?.parentElement?.append(d);
      }
    });
    updateBar();
  }
  function updateBar() {
    bar.style.display = selected.size ? "flex" : "none";
    $("mwBulkCount").textContent = selected.size + " selected";
    const move = $("mwBulkMove");
    if (move.options.length !== (window.cats?.length || 0) + 1) {
      move.innerHTML = '<option value="">Move to collection…</option>';
      (window.cats || []).forEach(c => { const o = document.createElement("option"); o.value = c.name; o.textContent = c.name; move.append(o); });
    }
  }
  view.addEventListener("change", paint);
  $("mwBulkClear").onclick = () => { selected.clear(); paint(); };
  $("mwBulkMoveBtn").onclick = () => {
    const target = $("mwBulkMove").value;
    if (!target) return alert("Choose a collection first.");
    const cards = [...list.querySelectorAll(".item")];
    cards.forEach(card => { if (selected.has(card.dataset.mwBulkKey)) card.querySelector('[data-a="edit"]')?.click(); });
    alert("Bulk move requires a library API hook; no links were changed. Use individual Edit for now.");
  };
  $("mwBulkDeleteBtn").onclick = () => alert("Bulk delete is not enabled until the app exposes a safe library mutation hook. No links were deleted.");
  const observer = new MutationObserver(() => paint());
  observer.observe(list, {childList:true});
  paint();
})();