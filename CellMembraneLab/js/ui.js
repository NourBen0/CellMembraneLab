// =========================================================
// ui.js — updateUI() + updateSliderLabels()
// Extrait de cell_membrane_lab_v2.html
// =========================================================

function updateUI() {
  if (frame % 30 === 0) {
    fluxRate = Math.round(recentPassed * 2);
    fluxHistory.push(fluxRate);
    if (fluxHistory.length > 60) fluxHistory.shift();
    recentPassed = 0;

    document.getElementById('st-flux').textContent = fluxRate;
    document.getElementById('st-tot').textContent = totalPassed;
    document.getElementById('st-atp').textContent = atpUsed;

    const naT = P.nae + P.nai;
    const eq = naT > 0 ? Math.round(100 - Math.abs(P.nae - P.nai) / naT * 100) : 100;
    document.getElementById('st-eq').textContent = eq + '%';

    const naR = Math.min(100, Math.round(P.nae / (P.nae + P.nai + 1) * 100));
    document.getElementById('fill-na').style.width = naR + '%';
    document.getElementById('lbl-na').textContent = P.nae > P.nai ? 'ext › int' : 'int › ext';

    const glR = Math.min(100, Math.round(P.ge / (P.ge + P.gi + 1) * 100));
    document.getElementById('fill-gl').style.width = glR + '%';
    document.getElementById('lbl-gl').textContent = P.ge > P.gi ? 'ext › int' : 'int › ext';

    const kR = Math.min(100, Math.round(5 / (5 + P.ki + 1) * 100));
    document.getElementById('fill-k').style.width = Math.max(4, kR) + '%';

    document.getElementById('b-temp').textContent = P.tp + ' °C';
    document.getElementById('b-atp').textContent = 'ATP: ' + P.at + '%';

    drawChart();
  }
}

function updateSliderLabels() {
  P.ge  = +document.getElementById('s-ge').value;
  P.gi  = +document.getElementById('s-gi').value;
  P.nae = +document.getElementById('s-nae').value;
  P.nai = +document.getElementById('s-nai').value;
  P.cl  = +document.getElementById('s-cl').value;
  P.ki  = +document.getElementById('s-ki').value;
  P.pm  = +document.getElementById('s-pm').value;
  P.tp  = +document.getElementById('s-tp').value;
  P.at  = +document.getElementById('s-at').value;

  document.getElementById('v-ge').textContent  = P.ge;
  document.getElementById('v-gi').textContent  = P.gi;
  document.getElementById('v-nae').textContent = P.nae + ' mM';
  document.getElementById('v-nai').textContent = P.nai + ' mM';
  document.getElementById('v-cl').textContent  = P.cl  + ' mM';
  document.getElementById('v-ki').textContent  = P.ki  + ' mM';
  document.getElementById('v-pm').textContent  = P.pm  + '%';
  document.getElementById('v-tp').textContent  = P.tp  + '°C';
  document.getElementById('v-at').textContent  = P.at  + '%';
}
