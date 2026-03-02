const STORAGE_KEY = "inventory_v1";

const el = (id) => document.getElementById(id);
const fmt = (n) => (Number(n) || 0).toLocaleString("ko-KR");

let items = load();
let editingId = null;

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function normalizeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function statusOf(it) {
  return it.stock < it.minStock ? "부족" : "정상";
}

function totalValue() {
  return items.reduce((acc, it) => acc + (it.stock * it.price), 0);
}

function render() {
  const filter = el("filter").value;
  const tbody = el("tbody");
  tbody.innerHTML = "";

  const shown = items.filter(it => filter === "low" ? it.stock < it.minStock : true);

  for (const it of shown) {
    const tr = document.createElement("tr");
    tr.className = it.stock < it.minStock ? "low" : "ok";

    tr.innerHTML = `
      <td>${escapeHtml(it.name)}</td>
      <td class="right">${fmt(it.stock)}</td>
      <td class="right">${fmt(it.minStock)}</td>
      <td class="right">${fmt(it.price)}</td>
      <td class="right">${fmt(it.stock * it.price)}</td>
      <td>${statusOf(it)}</td>
      <td class="actions">
        <button data-act="edit" data-id="${it.id}">수정</button>
        <button data-act="del" data-id="${it.id}">삭제</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  el("totalValue").textContent = fmt(totalValue());
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function clearInputs() {
  el("name").value = "";
  el("stock").value = "";
  el("minStock").value = "";
  el("price").value = "";
  editingId = null;
  el("addBtn").textContent = "추가";
}

function upsertFromInputs() {
  const name = el("name").value.trim();
  if (!name) return alert("품목명을 입력하세요.");

  const stock = normalizeNumber(el("stock").value);
  const minStock = normalizeNumber(el("minStock").value);
  const price = normalizeNumber(el("price").value);

  if (editingId) {
    const idx = items.findIndex(x => x.id === editingId);
    if (idx >= 0) items[idx] = { ...items[idx], name, stock, minStock, price };
  } else {
    items.unshift({ id: uid(), name, stock, minStock, price });
  }

  save();
  render();
  clearInputs();
}

function startEdit(id) {
  const it = items.find(x => x.id === id);
  if (!it) return;
  editingId = id;
  el("name").value = it.name;
  el("stock").value = it.stock;
  el("minStock").value = it.minStock;
  el("price").value = it.price;
  el("addBtn").textContent = "저장";
}

function delItem(id) {
  items = items.filter(x => x.id !== id);
  save();
  render();
  if (editingId === id) clearInputs();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  downloadBlob(blob, `재고_${today()}.json`);
}

function exportCsv() {
  const header = ["name","stock","minStock","price"].join(",");
  const rows = items.map(it => [
    csvEscape(it.name),
    it.stock,
    it.minStock,
    it.price
  ].join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `재고_${today()}.csv`);
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}${m}${day}`;
}

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}

async function importFile(file) {
  if (!file) return;
  const text = await file.text();
  const ext = (file.name.split(".").pop() || "").toLowerCase();

  try {
    let imported = [];
    if (ext === "json") {
      imported = JSON.parse(text);
    } else if (ext === "csv") {
      imported = parseCsv(text);
    } else {
      return alert("json 또는 csv만 지원합니다.");
    }

    imported = imported
      .filter(x => x && x.name)
      .map(x => ({
        id: x.id || uid(),
        name: String(x.name),
        stock: normalizeNumber(x.stock),
        minStock: normalizeNumber(x.minStock),
        price: normalizeNumber(x.price),
      }));

    items = imported;
    save();
    render();
    alert("가져오기 완료");
  } catch {
    alert("가져오기 실패: 파일 형식 확인");
  } finally {
    el("importFile").value = "";
  }
}

function parseCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  const out = [];
  for (let i=1;i<lines.length;i++){
    const cols = splitCsvLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => obj[h] = cols[idx] ?? "");
    out.push(obj);
  }
  return out;
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i=0;i<line.length;i++){
    const c = line[i];
    if (c === '"' ) {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      out.push(cur); cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

el("addBtn").addEventListener("click", upsertFromInputs);
el("filter").addEventListener("change", render);
el("clearBtn").addEventListener("click", () => {
  if (!confirm("전체 삭제할까요? (되돌리기 어려움)")) return;
  items = [];
  save();
  render();
  clearInputs();
});
el("tbody").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  const act = btn.dataset.act;
  if (act === "edit") startEdit(id);
  if (act === "del") {
    if (!confirm("삭제할까요?")) return;
    delItem(id);
  }
});
el("exportJsonBtn").addEventListener("click", () => exportJson());
el("exportCsvBtn").addEventListener("click", () => exportCsv());
el("importFile").addEventListener("change", (e) => importFile(e.target.files[0]));

render();