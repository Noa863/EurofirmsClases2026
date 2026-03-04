const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const navEl = $("#nav");
const sections = $$(".section");
const toast = $("#toast");

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> toast.classList.remove("show"), 1400);
}

function buildNav(){
  navEl.innerHTML = "";
  sections.forEach(sec => {
    const a = document.createElement("a");
    a.href = `#${sec.id}`;
    a.textContent = sec.dataset.title || sec.querySelector("h2")?.textContent || sec.id;
    navEl.appendChild(a);
  });
}

function setActiveLink(){
  const fromTop = window.scrollY + 110;
  let current = sections[0]?.id;
  sections.forEach(sec => {
    if (sec.offsetTop <= fromTop) current = sec.id;
  });

  $$("#nav a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("Copiado ✅");
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("Copiado ✅");
  }
}

function wireCopyButtons(){
  $$(".copyBtn").forEach(btn => {
    btn.addEventListener("click", () => copyText(btn.dataset.copy || ""));
  });
}

function wireSearch(){
  const input = $("#searchInput");
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();

    sections.forEach(sec => {
      const text = sec.innerText.toLowerCase();
      const match = q.length === 0 || text.includes(q);
      sec.style.display = match ? "" : "none";
    });

    // Rebuild nav to include visible sections only
    navEl.innerHTML = "";
    sections
      .filter(sec => sec.style.display !== "none")
      .forEach(sec => {
        const a = document.createElement("a");
        a.href = `#${sec.id}`;
        a.textContent = sec.dataset.title || sec.querySelector("h2")?.textContent || sec.id;
        navEl.appendChild(a);
      });

    setActiveLink();
  });
}

function wireTheme(){
  const btn = $("#themeBtn");
  const stored = localStorage.getItem("theme");
  if(stored === "light") document.body.classList.add("light");

  btn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
  });
}

function wireCollapse(){
  const btn = $("#collapseBtn");
  const sidebar = document.querySelector(".sidebar");
  const layout = document.querySelector(".layout");

  btn.addEventListener("click", () => {
    const collapsed = sidebar.classList.toggle("collapsed");
    if(collapsed){
      layout.style.gridTemplateColumns = "84px 1fr";
      $$(".nav a").forEach(a => a.textContent = "•");
    } else {
      layout.style.gridTemplateColumns = "";
      buildNav();
      setActiveLink();
    }
  });
}

buildNav();
wireCopyButtons();
wireSearch();
wireTheme();
wireCollapse();

window.addEventListener("scroll", setActiveLink, { passive: true });
window.addEventListener("hashchange", setActiveLink);
setActiveLink();