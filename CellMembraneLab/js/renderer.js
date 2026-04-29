const ca = document.getElementById("ca");
const cv = document.getElementById("cv");
const ctx = cv.getContext("2d");
const chartCv = document.getElementById("chart-cv");
const chartCtx = chartCv.getContext("2d");

function resize() {
  const r = ca.getBoundingClientRect();
  W = Math.floor(r.width);
  H = Math.floor(r.height) || 520;
  cv.width = W;
  cv.height = H;
  chartCv.width = chartCv.parentElement.clientWidth || 180;
  chartCv.height = 52;
  rebuildLipids();
}

function drawBg() {
  const my = memY();
  ctx.fillStyle = feverActive ? "#ffe4d0" : "#cce5f5";
  ctx.fillRect(0, 0, W, my - 16);
  ctx.fillStyle = "#d4edda";
  ctx.fillRect(0, my + 16, W, H - my - 16);
  ctx.fillStyle = "#fff9e0";
  ctx.fillRect(0, my - 16, W, 32);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.font = "11px Syne";
  ctx.textAlign = "left";
  ctx.fillText("milieu extracellulaire", 10, 18);
  ctx.fillText("milieu intracellulaire (cytoplasme)", 10, H - 8);
}

function drawMembrane() {
  const my = memY();

  drawMembraneTextured(ctx);

  for (const lx of lipids) {
    const nearProt = proteins.some((p) => Math.abs(lx - p.x) < 14);
    if (nearProt) continue;
    ctx.fillStyle = C.lipHead;
    ctx.strokeStyle = C.lipTail;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(lx, my - 10, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx, my - 5.5);
    ctx.lineTo(lx, my);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(lx, my + 10, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx, my);
    ctx.lineTo(lx, my + 5.5);
    ctx.stroke();
  }

  for (const p of proteins) {
    const pw = p.type === "pump" ? 30 : 24;
    const ph = 38;
    const pulse = p.open ? Math.sin(p.phase) * 2.5 : 0;
    ctx.fillStyle = p.open ? C.protOpen : C.prot;
    ctx.strokeStyle = p.open ? "#1a6a4f" : "#6ab7bb";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(p.x - pw / 2, my - ph / 2, pw + pulse, ph, 5);
    ctx.fill();
    ctx.stroke();

    if (p.open) {
      ctx.strokeStyle = "rgba(30,110,80,.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(p.x + pulse / 2, my - 8);
      ctx.lineTo(p.x + pulse / 2, my + 8);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (p.type === "pump") {
      ctx.fillStyle = "#457b9d";
      ctx.font = "bold 7px IBM Plex Mono";
      ctx.textAlign = "center";
      ctx.fillText("ATP", p.x + pulse / 2, my + ph / 2 + 9);
    }
  }
}

function drawMolecules() {
  for (const m of molecules) {
    // ── TP4 : appliquer la teinte texturée selon UV de la molécule ──
    // Équivalent : FragColor = texture(ourTexture, TexCoord) * baseColor
    applyTextureToMolecule(ctx, m);

    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fillStyle = m.color();
    ctx.fill();
    if (m.type === "na") {
      ctx.fillStyle = "white";
      ctx.font = "bold 6px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", m.x, m.y);
    } else if (m.type === "k") {
      ctx.fillStyle = "white";
      ctx.font = "bold 6px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("K", m.x, m.y);
    } else if (m.type === "atp") {
      ctx.strokeStyle = "rgba(30,80,120,.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (m.type === "toxin") {
      ctx.strokeStyle = "rgba(180,20,30,.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(m.x - 2, m.y - 2);
      ctx.lineTo(m.x + 2, m.y + 2);
      ctx.moveTo(m.x + 2, m.y - 2);
      ctx.lineTo(m.x - 2, m.y + 2);
      ctx.strokeStyle = "rgba(180,20,30,.9)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function drawChart() {
  const cw = chartCv.width,
    ch = chartCv.height;
  chartCtx.clearRect(0, 0, cw, ch);
  chartCtx.fillStyle = "#f7f5f0";
  chartCtx.fillRect(0, 0, cw, ch);
  const max = Math.max(...fluxHistory, 1);
  const bw = cw / fluxHistory.length;
  for (let i = 0; i < fluxHistory.length; i++) {
    const bh = Math.round((fluxHistory[i] / max) * (ch - 6));
    chartCtx.fillStyle = i === fluxHistory.length - 1 ? "#2d6a4f" : "#a8d5bb";
    chartCtx.fillRect(
      Math.round(i * bw),
      ch - bh,
      Math.max(1, Math.round(bw) - 1),
      bh,
    );
  }
}

function loop() {
  time++;
  frame++;
  if (!W || !H) {
    requestAnimationFrame(loop);
    return;
  }
  ctx.clearRect(0, 0, W, H);
  drawBg();
  drawMembrane();
  drawMolecules();
  updateMols();
  updateUI();
  requestAnimationFrame(loop);
}
