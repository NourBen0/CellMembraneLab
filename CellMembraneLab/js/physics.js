function canPass(mol) {
  const tempF = P.tp / 37;
  const perm = P.pm / 100;
  if (mol.type === "toxin") return Math.random() < 0.03 * perm;
  if (mode === "diffusion") {
    if (mol.type === "cl" || mol.type === "o2")
      return Math.random() < 0.06 * perm * tempF;
    return false;
  }
  if (mode === "facilitated" || mode === "active") {
    for (const p of proteins) {
      if (Math.abs(mol.x - p.x) < 22 && p.open) {
        if (mode === "active" && P.at < 5) return false;
        return true;
      }
    }
    return false;
  }
  if (mode === "osmosis") {
    if (mol.type === "cl") return Math.random() < 0.09 * perm * tempF;
    return false;
  }
  return false;
}

function updateMols() {
  const my = memY();
  const tempF = P.tp / 37;
  let passed = 0;

  for (const p of proteins) {
    p.timer--;
    if (p.timer <= 0) {
      const atpFactor = mode === "active" ? P.at / 100 : 1;
      p.open = Math.random() < 0.35 * atpFactor * (toxinActive ? 0.3 : 1);
      p.timer = 15 + Math.random() * 35;
      p.phase += 0.04;
    }
  }

  for (let i = molecules.length - 1; i >= 0; i--) {
    const m = molecules[i];
    m.age++;
    m.wobble += 0.08;
    const sp =
      1.1 *
      tempF *
      (m.type === "glucose" ? 0.55 : m.type === "toxin" ? 1.3 : 0.9);
    m.vx += (Math.random() - 0.5) * 0.45 * sp;
    m.vy += (Math.random() - 0.5) * 0.45 * sp;
    m.vx = Math.max(-2.8, Math.min(2.8, m.vx * 0.94));
    m.vy = Math.max(-2.8, Math.min(2.8, m.vy * 0.94));
    m.x += m.vx;
    m.y += m.vy;

    if (m.x < m.r) {
      m.x = m.r;
      m.vx = Math.abs(m.vx);
    }
    if (m.x > W - m.r) {
      m.x = W - m.r;
      m.vx = -Math.abs(m.vx);
    }

    const near = Math.abs(m.y - my) < 20;
    if (near) {
      if (canPass(m)) {
        m.side = m.side === "ext" ? "int" : "ext";
        m.vy = m.side === "int" ? Math.abs(m.vy) + 0.4 : -Math.abs(m.vy) - 0.4;
        passed++;
        totalPassed++;
        if (mode === "active" && m.type !== "atp") {
          atpUsed++;
        }
      } else {
        m.vy = (m.side === "ext" ? -1 : 1) * (Math.abs(m.vy) + 0.5);
        m.y = m.side === "ext" ? my - 20 - m.r : my + 20 + m.r;
      }
    }
    if (m.side === "ext" && m.y > my - m.r) m.vy = -Math.abs(m.vy) - 0.3;
    if (m.side === "int" && m.y < my + m.r) m.vy = Math.abs(m.vy) + 0.3;
    if (m.y < m.r) {
      m.y = m.r;
      m.vy = Math.abs(m.vy);
    }
    if (m.y > H - m.r) {
      m.y = H - m.r;
      m.vy = -Math.abs(m.vy);
    }
  }
  recentPassed += passed;
}
