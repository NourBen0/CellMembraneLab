function setMode(m) {
  mode = m;
  toxinActive = false;
  feverActive = false;
  totalPassed = 0;
  atpUsed = 0;
  ["ds", "df", "ac", "os"].forEach((id) =>
    document.getElementById("btn-" + id).classList.remove("active"),
  );
  const map = {
    diffusion: "ds",
    facilitated: "df",
    active: "ac",
    osmosis: "os",
  };
  document.getElementById("btn-" + map[m]).classList.add("active");
  document.getElementById("b-mode").textContent = "mode: " + m;
  document.getElementById("b-status").textContent = "état: normal";
  document.getElementById("b-status").className = "badge good";
  addEvent("mode → " + m, "good");
  spawnAll();
}

function triggerEvent(e) {
  const my = memY();
  if (e === "toxin") {
    toxinActive = true;
    for (let i = 0; i < 18; i++) {
      const y = Math.random() * (my - 24) + 10;
      molecules.push(new Mol(Math.random() * (W - 30) + 15, y, "toxin", "ext"));
    }
    document.getElementById("b-status").textContent = "état: toxine";
    document.getElementById("b-status").className = "badge warn";
    addEvent("toxine injectée", "warn");
  }
  if (e === "fever") {
    feverActive = !feverActive;
    document.getElementById("btn-fev").classList.toggle("active", feverActive);
    const t = feverActive ? 41 : 37;
    document.getElementById("s-tp").value = t;
    P.tp = t;
    updateSliderLabels();
    document.getElementById("b-status").textContent = feverActive
      ? "état: fièvre 41°C"
      : "état: normal";
    document.getElementById("b-status").className = feverActive
      ? "badge warn"
      : "badge good";
    addEvent(
      feverActive ? "fièvre 41°C activée" : "fièvre désactivée",
      feverActive ? "warn" : "good",
    );
  }
  if (e === "reset") {
    toxinActive = false;
    feverActive = false;
    document.getElementById("s-tp").value = 37;
    P.tp = 37;
    document.getElementById("b-status").textContent = "état: normal";
    document.getElementById("b-status").className = "badge good";
    document.getElementById("btn-fev").classList.remove("active");
    updateSliderLabels();
    totalPassed = 0;
    atpUsed = 0;
    addEvent("cellule réinitialisée", "good");
    spawnAll();
  }
}

function addEvent(text, type = "") {
  const el = document.createElement("span");
  el.className = "ev-item" + (type ? " " + type : "");
  el.textContent = text;
  const log = document.getElementById("evlog");
  log.appendChild(el);
  eventItems.push(el);
  if (eventItems.length > 5) {
    eventItems[0].remove();
    eventItems.shift();
  }
}

[
  "s-ge",
  "s-gi",
  "s-nae",
  "s-nai",
  "s-cl",
  "s-ki",
  "s-pm",
  "s-tp",
  "s-at",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    updateSliderLabels();
    if (
      id === "s-ge" ||
      id === "s-gi" ||
      id === "s-nae" ||
      id === "s-nai" ||
      id === "s-ki" ||
      id === "s-cl"
    ) {
      spawnAll();
    }
  });
});

const tooltip = document.getElementById("tooltip");

ca.addEventListener("mousemove", (e) => {
  const rect = ca.getBoundingClientRect();
  const mx = e.clientX - rect.left,
    my2 = e.clientY - rect.top;
  const my = memY();
  let hit = null;

  for (const p of proteins) {
    if (Math.abs(mx - p.x) < 18 && Math.abs(my2 - my) < 22) {
      hit = {
        text:
          p.type === "pump"
            ? "Pompe Na⁺/K⁺\nConsomme ATP\nTransport actif"
            : "Protéine canal\n" + (p.open ? "OUVERTE" : "FERMÉE"),
      };
      break;
    }
  }
  for (const m of molecules) {
    if (Math.hypot(mx - m.x, my2 - m.y) < m.r + 4) {
      const labels = {
        glucose: "Glucose (C₆H₁₂O₆)\nSource d'énergie",
        na: "Ion Na⁺\nSodium — extracellulaire",
        k: "Ion K⁺\nPotassium — intracellulaire",
        cl: "Ion Cl⁻\nChlore — osmose",
        atp: "Molécule ATP\nÉnergie cellulaire",
        toxin: "TOXINE\nBloque les canaux !",
      };
      hit = { text: labels[m.type] || m.type };
      break;
    }
  }

  if (hit) {
    tooltip.style.display = "block";
    tooltip.style.left = Math.min(mx + 12, W - 200) + "px";
    tooltip.style.top = Math.max(my2 - 60, 4) + "px";
    const lines = hit.text.split("\n");
    tooltip.innerHTML = "<b>" + lines[0] + "</b>" + lines.slice(1).join("<br>");
  } else {
    tooltip.style.display = "none";
  }
});

ca.addEventListener("mouseleave", () => {
  tooltip.style.display = "none";
});
