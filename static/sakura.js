// ==========================================================================
// ROADSTER 3D • RETRO ARCADE SAKURA PETAL ENGINE
// Lightweight 60 FPS Canvas Petals Simulation (Japanese Pixel Racer Aesthetic)
// ==========================================================================

(function() {
  const canvas = document.getElementById('sakuraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let petals = [];
  const PETAL_COUNT = 38;

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth || window.innerWidth;
    height = canvas.height = parent.clientHeight || 560;
  }

  function createPetal() {
    return {
      x: Math.random() * (width + 100) - 50,
      y: Math.random() * -height * 0.5,
      size: 4 + Math.random() * 6,
      vx: 0.6 + Math.random() * 1.4, // Drift toward right
      vy: 1.0 + Math.random() * 1.8, // Fall down
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.7 + Math.random() * 0.3,
      color: Math.random() > 0.3 ? '#ffb7c5' : '#ffa4b8'
    };
  }

  function init() {
    resize();
    petals = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      const p = createPetal();
      p.y = Math.random() * height; // Spread across initial screen
      petals.push(p);
    }
  }

  function update() {
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.sway += p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * 0.8;
      p.y += p.vy;
      p.rot += p.vrot;

      // Recycle if fallen below or drifted past screen
      if (p.y > height + 20 || p.x > width + 50) {
        petals[i] = createPetal();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;

      // Draw stylized pixel / smooth petal shape
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.75, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Soft highlight petal stroke
      ctx.strokeStyle = '#fff0f4';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  init();
  requestAnimationFrame(loop);
})();
