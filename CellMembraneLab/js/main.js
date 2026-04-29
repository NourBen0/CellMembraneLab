initTextures();

setTextureParams({
  enabled: true,
  wrapS: GL_REPEAT,
  wrapT: GL_CLAMP_TO_EDGE,
  filterMin: GL_LINEAR,
  filterMag: GL_LINEAR,
  mipmap: true,
});

const ro = new ResizeObserver(() => {
  resize();
  spawnAll();
});
ro.observe(ca);

resize();
spawnAll();
updateSliderLabels();
requestAnimationFrame(loop);
