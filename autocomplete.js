// Debounce – aby sa neposielali stovky requestov
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function suggestAddress(query) {
  if (query.length < 3) return [];

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=" +
    encodeURIComponent(query);

  const r = await fetch(url, {
    headers: {
      "User-Agent": "TaxiApp/1.0 (peter@example.com)",
      "Accept-Language": "sk"
    }
  });

  const j = await r.json();
  return j.map((item) => item.display_name);
}


// Pripojenie autocomplete k jednému inputu
function attachAutocomplete(input) {
  const box = document.createElement("div");
  box.className = "autocomplete-box";
  box.style.position = "absolute";
  box.style.background = "#fff";
  box.style.border = "1px solid #ccc";
  box.style.zIndex = 9999;
  box.style.display = "none";
  box.style.maxHeight = "200px";
  box.style.overflowY = "auto";
  document.body.appendChild(box);

  const update = debounce(async () => {
    const q = input.value.trim();
    const results = await suggestAddress(q);

    if (!results.length) {
      box.style.display = "none";
      return;
    }

    box.innerHTML = "";
    results.forEach((r) => {
      const item = document.createElement("div");
      item.textContent = r;
      item.style.padding = "6px 10px";
      item.style.cursor = "pointer";

      item.onclick = () => {
        input.value = r;
        box.style.display = "none";
      };

      box.appendChild(item);
    });

    const rect = input.getBoundingClientRect();
    box.style.left = rect.left + "px";
    box.style.top = rect.bottom + "px";
    box.style.width = rect.width + "px";
    box.style.display = "block";
  }, 300);

  input.addEventListener("input", update);

  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      box.style.display = "none";
    }
  });
}

// Aktivácia autocomplete pre všetky existujúce inputy
function initAutocomplete() {
  const start = document.getElementById("inputStart");
  const end = document.getElementById("inputEnd");
  const stops = document.querySelectorAll(".stop-input");

  if (start) attachAutocomplete(start);
  if (end) attachAutocomplete(end);

  stops.forEach((i) => attachAutocomplete(i));
}

// Aktivácia po načítaní stránky
window.addEventListener("DOMContentLoaded", initAutocomplete);
