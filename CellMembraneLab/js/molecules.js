class Mol {
  constructor(x, y, type, side) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.side = side;
    this.vx = (Math.random() - 0.5) * 1.8;
    this.vy = (Math.random() - 0.5) * 1.8;
    this.r = type === "glucose" ? 6 : type === "atp" ? 5 : 4;
    this.age = 0;
    this.trail = [];
    this.wobble = Math.random() * Math.PI * 2;
  }
  color() {
    if (this.type === "toxin") return C.toxin;
    return C[this.type] || "#aaa";
  }
}

class Protein {
  constructor(x, type) {
    this.x = x;
    this.type = type;
    this.open = false;
    this.timer = 0;
    this.phase = Math.random() * Math.PI * 2;
    this.openCount = 0;
  }
}

function memY() {
  return Math.floor(H / 2);
}

function rebuildLipids() {
  lipids = [];
  const step = 16;
  for (let x = 8; x < W; x += step) lipids.push(x);
}

function spawnAll() {
  molecules = [];
  proteins = [];
  const my = memY();
  const sc = 0.28;

  const addM = (type, n, side) => {
    for (let i = 0; i < n; i++) {
      const y =
        side === "ext"
          ? Math.random() * (my - 24) + 10
          : Math.random() * (H - my - 24) + my + 14;
      molecules.push(new Mol(Math.random() * (W - 30) + 15, y, type, side));
    }
  };

  addM("glucose", Math.round(P.ge * sc), "ext");
  addM("glucose", Math.round(P.gi * sc), "int");
  addM("na", Math.round(P.nae * sc * 0.4), "ext");
  addM("na", Math.round(P.nai * sc * 0.4), "int");
  addM("k", Math.round(P.ki * sc * 0.4), "int");
  addM("cl", Math.round(P.cl * sc * 0.4), "ext");

  const nProts = mode === "diffusion" ? 0 : mode === "active" ? 5 : 7;
  for (let i = 0; i < nProts; i++) {
    const x = ((i + 1) * W) / (nProts + 1);
    proteins.push(new Protein(x, mode === "active" ? "pump" : "channel"));
  }

  if (mode === "active") {
    for (let i = 0; i < 10; i++) {
      const y = my + 20 + Math.random() * (H - my - 40);
      molecules.push(new Mol(Math.random() * (W - 30) + 15, y, "atp", "int"));
    }
  }
}
