"use strict";

const GL_REPEAT = "repeat";
const GL_MIRRORED_REPEAT = "mirrored_repeat";
const GL_CLAMP_TO_EDGE = "clamp_to_edge";
const GL_CLAMP_TO_BORDER = "clamp_to_border";
const GL_LINEAR = "linear";
const GL_NEAREST = "nearest";

const TEX = {
  enabled: false,
  wrapS: GL_REPEAT,
  wrapT: GL_REPEAT,
  filterMin: GL_LINEAR,
  filterMag: GL_LINEAR,
  mipmapEnabled: true,
  currentLOD: 0,
  membraneTexture: null,
  moleculeTextures: {},
  mipmapLevels: [],
};

function wrapCoord(u, mode) {
  switch (mode) {
    case GL_REPEAT:
      return u - Math.floor(u);

    case GL_MIRRORED_REPEAT:
      const floored = Math.floor(u);
      const frac = u - floored;
      return floored % 2 === 0 ? frac : 1 - frac;

    case GL_CLAMP_TO_EDGE:
      return Math.max(0, Math.min(1, u));

    case GL_CLAMP_TO_BORDER:
      return u < 0 || u > 1 ? -1 : u;

    default:
      return u - Math.floor(u);
  }
}

function sampleTexture(imageData, u, v, filter = GL_LINEAR) {
  if (!imageData) return [255, 255, 255, 255];

  const { width, height, data } = imageData;

  const wu = wrapCoord(u, TEX.wrapS);
  const wv = wrapCoord(v, TEX.wrapT);

  if (wu === -1 || wv === -1) return [0, 0, 0, 0];

  if (filter === GL_NEAREST) {
    const px = Math.min(Math.floor(wu * width), width - 1);
    const py = Math.min(Math.floor(wv * height), height - 1);
    const i = (py * width + px) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  }

  const fx = wu * (width - 1);
  const fy = wv * (height - 1);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, width - 1);
  const y1 = Math.min(y0 + 1, height - 1);
  const dx = fx - x0;
  const dy = fy - y0;

  const getTexel = (x, y) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  const t00 = getTexel(x0, y0);
  const t10 = getTexel(x1, y0);
  const t01 = getTexel(x0, y1);
  const t11 = getTexel(x1, y1);

  return t00.map((_, c) =>
    Math.round(
      t00[c] * (1 - dx) * (1 - dy) +
        t10[c] * dx * (1 - dy) +
        t01[c] * (1 - dx) * dy +
        t11[c] * dx * dy,
    ),
  );
}

function generateMembraneTexture(w = 128, h = 32) {
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const octx = offscreen.getContext("2d");

  const grad = octx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.0, "#f0c040");
  grad.addColorStop(0.25, "#ffd166");
  grad.addColorStop(0.5, "#fff0b0");
  grad.addColorStop(0.75, "#ffd166");
  grad.addColorStop(1.0, "#f0c040");
  octx.fillStyle = grad;
  octx.fillRect(0, 0, w, h);

  for (let x = 4; x < w; x += 8) {
    octx.fillStyle = "rgba(200,120,20,0.35)";
    octx.beginPath();
    octx.arc(x, 4, 3, 0, Math.PI * 2);
    octx.fill();
    octx.beginPath();
    octx.arc(x, h - 4, 3, 0, Math.PI * 2);
    octx.fill();
  }

  return octx.getImageData(0, 0, w, h);
}

function generateMipmaps(imageData) {
  const levels = [imageData];
  let current = imageData;

  while (current.width > 8 && current.height > 2) {
    const nw = Math.floor(current.width / 2);
    const nh = Math.floor(current.height / 2);
    const next = new ImageData(nw, nh);

    for (let y = 0; y < nh; y++) {
      for (let x = 0; x < nw; x++) {
        const srcIdx = (y * 2 * current.width + x * 2) * 4;
        const i = (y * nw + x) * 4;
        for (let c = 0; c < 4; c++) {
          next.data[i + c] = Math.round(
            (current.data[srcIdx + c] +
              current.data[srcIdx + 4 + c] +
              current.data[srcIdx + current.width * 4 + c] +
              current.data[srcIdx + current.width * 4 + 4 + c]) /
              4,
          );
        }
      }
    }
    levels.push(next);
    current = next;
  }
  return levels;
}

function selectMipmapLevel(dist) {
  if (!TEX.mipmapEnabled) return 0;
  const maxDist = H / 2;
  const lod = Math.floor((dist / maxDist) * (TEX.mipmapLevels.length - 1));
  return Math.min(lod, TEX.mipmapLevels.length - 1);
}

function getMoleculeUV(mol) {
  const my = memY();
  const u = mol.x / W;
  let v;

  if (mol.side === "ext") {
    v = mol.y / my;
  } else {
    v = (mol.y - my) / (H - my);
  }
  return { u, v: Math.max(0, Math.min(1, v)) };
}

function applyTextureToMolecule(ctx, mol) {
  if (!TEX.enabled || !TEX.membraneTexture) return;

  const { u, v } = getMoleculeUV(mol);
  const distToMem = Math.abs(mol.y - memY());
  const lod = selectMipmapLevel(distToMem);
  const texData = TEX.mipmapLevels[lod] || TEX.membraneTexture;

  const [r, g, b, a] = sampleTexture(texData, u, v, TEX.filterMag);

  const alpha = (a / 255) * 0.18;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.beginPath();
  ctx.arc(mol.x, mol.y, mol.r + 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawMembraneTextured(ctx) {
  if (!TEX.enabled || !TEX.membraneTexture) return;

  const my = memY();
  const th = 32;
  const y0 = my - th / 2;

  const STEP = 4;

  for (let x = 0; x < W; x += STEP) {
    const u = x / W;

    for (let y = y0; y < y0 + th; y += STEP) {
      const v = (y - y0) / th;

      const wu = wrapCoord(u * 3, TEX.wrapS);
      const wv = wrapCoord(v, TEX.wrapT);

      if (wu === -1 || wv === -1) continue;

      const distCenter = Math.abs(y - my);
      const lod = selectMipmapLevel(distCenter * 3);
      const texData = TEX.mipmapLevels[lod] || TEX.membraneTexture;

      const [r, g, b, a] = sampleTexture(texData, wu, wv, TEX.filterMin);

      ctx.fillStyle = `rgba(${r},${g},${b},${(a / 255) * 0.55})`;
      ctx.fillRect(x, y, STEP, STEP);
    }
  }
}

function initTextures() {
  TEX.membraneTexture = generateMembraneTexture(128, 32);

  TEX.mipmapLevels = generateMipmaps(TEX.membraneTexture);

  console.log(
    `[texture.js] Textures initialisees : ${TEX.mipmapLevels.length} niveaux mipmap`,
    TEX.mipmapLevels.map((m) => `${m.width}x${m.height}`),
  );
}

function setTextureParams(params = {}) {
  if (params.wrapS !== undefined) TEX.wrapS = params.wrapS;
  if (params.wrapT !== undefined) TEX.wrapT = params.wrapT;
  if (params.filterMin !== undefined) TEX.filterMin = params.filterMin;
  if (params.filterMag !== undefined) TEX.filterMag = params.filterMag;
  if (params.mipmap !== undefined) TEX.mipmapEnabled = params.mipmap;
  if (params.enabled !== undefined) TEX.enabled = params.enabled;
}
