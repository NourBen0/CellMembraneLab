let W,
  H,
  mode = "diffusion",
  time = 0,
  frame = 0;
let totalPassed = 0,
  atpUsed = 0,
  recentPassed = 0,
  fluxRate = 0;
let toxinActive = false,
  feverActive = false;
let molecules = [],
  proteins = [],
  lipids = [];
let fluxHistory = Array(60).fill(0);
let eventItems = [];

const P = {
  ge: 80,
  gi: 10,
  nae: 145,
  nai: 12,
  cl: 110,
  ki: 140,
  pm: 50,
  tp: 37,
  at: 100,
};

const C = {
  glu: "#f4a261",
  na: "#e63946",
  k: "#457b9d",
  cl: "#74b9ff",
  atp: "#8ecae6",
  toxin: "rgba(230,57,70,0.45)",
  prot: "#a8dadc",
  protOpen: "#4caf8a",
  lipHead: "#ffd166",
  lipTail: "#e5b540",
  extBg: "#cce5f5",
  intBg: "#d4edda",
  memBg: "#fff9e0",
};
