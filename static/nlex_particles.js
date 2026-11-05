// ==========================================================================
// ROADSTER 3D • NLEX CYBER SPEEDWAY PARTICLE ENGINE
// Authentic Philippine Expressway Night Atmosphere:
// Luminous amber highway streetlamp flares, asphalt road-stud reflections,
// and high-speed cold-gas thruster aerodynamic sparks.
// ==========================================================================

(function() {
  const canvas = document.getElementById('nlexParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let particles = [];
  const PARTICLE_COUNT = 45;

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth || window.innerWidth;
    height = canvas.height = parent.clientHeight || 560;
  }

  // Particle types: 
  // 1: Highway light streak (fast horizontal/diagonal amber/cyan dash)
  // 2: Golden road-stud / cat's-eye sparkle
  // 3: Thruster plasma dust spark
  function createParticle() {
    const type = Math.random() < 0.45 ? 'streak' : (Math.random() < 0.75 ? 'amber_flare' : 'cyan_spark');
    const isStreak = type === 'streak';

    return {
      type: type,
      x: Math.random() * width,
      y: isStreak ? (height * 0.45 + Math.random() * (height * 0.55)) : (Math.random() * height),
      length: isStreak ? (18 + Math.random() * 42) : (2 + Math.random() * 4),
      speedX: isStreak ? -(4.0 + Math.random() * 7.0) : -(0.8 + Math.random() * 2.0),
      speedY: isStreak ? (0.2 - Math.random() * 0.4) : -(0.3 + Math.random() * 0.9),
      opacity: 0.25 + Math.random() * 0.65,
      fadeSpeed: 0.008 + Math.random() * 0.015,
      color: type === 'amber_flare' 
        ? '#ffb703' 
        : (type === 'streak' ? (Math.random() < 0.6 ? '#fb8500' : '#00f0ff') : '#00f0ff')
    };
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function update() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      // Pulse opacity
      p.opacity += Math.sin(Date.now() * 0.003 + i) * 0.01;

      // Reset when off-screen
      if (p.x < -60 || p.y < -10 || p.y > height + 20) {
        particles[i] = createParticle();
        particles[i].x = width + Math.random() * 40;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, p.opacity));

      if (p.type === 'streak') {
        // High speed highway streak
        const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.length, p.y);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length, p.y);
        ctx.stroke();

        // Extra glow head
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x, p.y - 1, 2, 2);
      } else {
        // Glowing highway amber or cyan ember flare
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.length, 0, Math.PI * 2);
        ctx.fill();
      }

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
