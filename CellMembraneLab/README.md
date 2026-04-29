# Cell Membrane Lab — v2.0
**ISAMM · 2INREV · Synthèse d'images**

Simulation interactive du transport membranaire cellulaire.

---

## Structure du projet

```
CellMembraneLab/
│
├── index.html          ← Point d'entrée (HTML + ordre des scripts)
│
├── css/
│   └── style.css       ← Tous les styles (layout, composants, couleurs)
│
└── js/
    ├── config.js       ← Variables globales : W, H, mode, P{}, C{}, tableaux
    ├── molecules.js    ← Classes Mol + Protein, spawnAll(), memY(), rebuildLipids()
    ├── physics.js      ← canPass() + updateMols()  [= vertex/fragment shader]
    ├── renderer.js     ← drawBg, drawMembrane, drawMolecules, drawChart, loop(), resize()
    ├── ui.js           ← updateUI() + updateSliderLabels()
    ├── events.js       ← setMode(), triggerEvent(), addEvent(), sliders, tooltip
    └── main.js         ← ResizeObserver + resize() + spawnAll() + requestAnimationFrame
```

---

## Ordre de chargement des scripts (important)

Les fichiers JS doivent être chargés dans cet ordre car ils partagent des variables globales :

1. `config.js` — déclare toutes les variables globales
2. `molecules.js` — utilise `W`, `H`, `P`, `C`
3. `physics.js` — utilise `molecules[]`, `proteins[]`, `P`, `mode`
4. `renderer.js` — utilise toutes les fonctions précédentes
5. `ui.js` — utilise `frame`, `P`, `drawChart()`
6. `events.js` — utilise tout + `ca` du renderer
7. `main.js` — démarre la simulation

---

## Comment lancer

Ouvrir `index.html` directement dans un navigateur.
Aucun serveur, aucune dépendance externe.
