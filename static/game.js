/**
 * NLEX EXPRESSWAY RACER 3D: Cyber City Skyway
 * Fully 3D Pixelated Low-Poly Retro Arcade Driving Game
 * Built with Three.js, HTML5 WebGL, and Web Audio API
 */

(function () {
  'use strict';

  // --- RETRO ARCADE VECTOR SVG ICONS ---
  const ICONS = {
    soundOn: `<svg class="game-icon neon-cyan sm" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/></svg>`,
    soundOff: `<svg class="game-icon sm" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/></svg>`,
    crt: `<svg class="game-icon sm" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="currentColor"/></svg>`,
    pixel: `<svg class="game-icon sm" viewBox="0 0 24 24"><path d="M4 8h4V4h8v4h4v8h-4v4H8v-4H4V8zm6 6h4v-4h-4v4z" fill="currentColor"/></svg>`,
    wind: `<svg class="game-icon sm neon-cyan" viewBox="0 0 24 24"><path d="M12.5 4a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5h6a2 2 0 1 0 0-4h-6zm-4 7a2 2 0 0 0-2 2 2 2 0 0 0 2 2h11a2.5 2.5 0 1 0 0-5h-11zm-2 7a2 2 0 0 0-2 2 2 2 0 0 0 2 2h7a2 2 0 1 0 0-4h-7z" fill="currentColor"/></svg>`,
    lightning: `<svg class="game-icon sm gold" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/></svg>`
  };

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.engineOsc = null;
      this.engineGain = null;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.initialized = true;
        this.initEngineSound();
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
      }
    }

    initEngineSound() {
      if (!this.ctx) return;
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'triangle';
      this.engineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    }

    updateEngine(speedRatio, isBoosting) {
      if (!this.ctx || this.muted || !this.engineGain) return;
      const targetFreq = 65 + speedRatio * 160 + (isBoosting ? 85 : 0);
      const targetVol = 0.04 + speedRatio * 0.08 + (isBoosting ? 0.05 : 0);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
    }

    stopEngine() {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
    }

    playBoostSound() {
      if (!this.ctx || this.muted) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    }

    playJumpSound() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      // 1. Tonal rising rocket launch spring
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(840, t + 0.36);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.39);

      // 2. High-pressure air burst whoosh
      try {
        const bufLen = Math.floor(this.ctx.sampleRate * 0.22);
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.exponentialRampToValueAtTime(350, t + 0.22);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.18, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.ctx.destination);
        noise.start(t);
      } catch (e) {}
    }

    playLandingSound() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.2);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    }

    playWindCatchSound() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(1180, t + 0.22);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.23);
      } catch (e) {}
    }

    playNoWindSputterSound() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.linearRampToValueAtTime(70, t + 0.16);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.17);
      } catch (e) {}
    }

    playBatteryPickup() {
      if (!this.ctx || this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.19);
      });
    }

    playCrashSound() {
      if (!this.ctx || this.muted) return;
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    }

    playMetalImpact() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      [130, 220, 310].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.36);
      });
    }

    playCheckpointFanfare() {
      if (!this.ctx || this.muted) return;
      const fanfare = [392, 523.25, 659.25, 783.99];
      fanfare.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.09;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.23);
      });
    }

    playGameOverSound() {
      if (!this.ctx || this.muted) return;
      const notes = [440, 392, 349.23, 293.66, 220];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.14;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) this.stopEngine();
      return this.muted;
    }
  }

  // --- 3D CHECKPOINTS & LOCAL BIOMES (NLEX TO CYBER CITY) ---
  const CHECKPOINTS = [
    {
      id: 1,
      name: 'BALINTAWAK TOLL PLAZA',
      sub: 'Metro Manila Gateway & Urban Highway',
      distKm: 0.0,
      skyColor: 0x3a506b,
      fogColor: 0x5c7a9c,
      fogDensity: 0.011,
      lightColor: 0xffffff,
      grassColor: 0x2e3d30,
      roadColor: 0x22262e,
      stripeColor: 0xffffff
    },
    {
      id: 2,
      name: 'BOCAUE & MARILAO EXPRESS',
      sub: 'High-Speed 4-Lane NLEX Corridor',
      distKm: 1.5,
      skyColor: 0x2b5876,
      fogColor: 0x4e4376,
      fogDensity: 0.010,
      lightColor: 0xfff0d0,
      grassColor: 0x263238,
      roadColor: 0x1f232b,
      stripeColor: 0xf1c40f
    },
    {
      id: 3,
      name: 'CANDABA VIADUCT SKYWAY',
      sub: 'Elevated 5-KM Highway Horizon',
      distKm: 3.5,
      skyColor: 0x1a237e,
      fogColor: 0x283593,
      fogDensity: 0.009,
      lightColor: 0xe8eaf6,
      grassColor: 0x004d40, // Wetlands beneath viaduct
      roadColor: 0x21252f,
      stripeColor: 0x00f0ff
    },
    {
      id: 4,
      name: 'CLARK CYBER METROPOLIS',
      sub: 'Neon High-Tech Skyway & Megacity Towers',
      distKm: 6.0,
      skyColor: 0x0d0d1a,
      fogColor: 0x241838,
      fogDensity: 0.012,
      lightColor: 0xff007f,
      grassColor: 0x12141d,
      roadColor: 0x161822,
      stripeColor: 0xff007f
    }
  ];

  // 3D Roadster Color Themes
  const CAR_COLORS = {
    silver: {
      body: 0xdce3eb,
      accent: 0x8898a8,
      dark: 0x404a54,
      lightbar: 0x00f0ff,
      glow: 0x00f0ff,
      name: 'Cyber Silver'
    },
    red: {
      body: 0xe51c35,
      accent: 0x96091b,
      dark: 0x4d050e,
      lightbar: 0xffffff,
      glow: 0xff0044,
      name: 'Electric Red'
    },
    blue: {
      body: 0x00b0ff,
      accent: 0x006db3,
      dark: 0x003e66,
      lightbar: 0xffffff,
      glow: 0x00f0ff,
      name: 'Neon Azure'
    },
    gold: {
      body: 0xf8b800,
      accent: 0xba8500,
      dark: 0x5e4300,
      lightbar: 0x00f0ff,
      glow: 0xf8b800,
      name: 'Solar Gold'
    }
  };

  // --- ROAD CONFIGURATION ---
  const ROAD_WIDTH = 15;
  const CHUNK_LENGTH = 45;
  const TOTAL_CHUNKS = 12;

  // --- MAIN 3D GAME CLASS ---
  class PangasinanRoadster3D {
    constructor() {
      // DOM Elements
      this.canvas = document.getElementById('gameCanvas');
      this.previewCanvas = document.getElementById('carPreviewCanvas');
      this.titleModal = document.getElementById('titleModal');
      this.gameOverModal = document.getElementById('gameOverModal');
      this.pauseModal = document.getElementById('pauseModal');
      this.crtOverlay = document.getElementById('crtOverlay');

      // HUD Elements
      this.hudScore = document.getElementById('hudScore');
      this.hudHighScore = document.getElementById('hudHighScore');
      this.hudDistance = document.getElementById('hudDistance');
      this.hudSpeed = document.getElementById('hudSpeed');
      this.hudBoostPercent = document.getElementById('hudBoostPercent');
      this.speedBarFill = document.getElementById('speedBarFill');
      this.boostBarFill = document.getElementById('boostBarFill');
      this.checkpointBanner = document.getElementById('checkpointBanner');
      this.toastMessage = document.getElementById('toastMessage');
      this.hudWindBox = document.getElementById('hudWindBox');
      this.hudWindStatus = document.getElementById('hudWindStatus');
      this.hudWindText = document.getElementById('hudWindText');
      this.btnJumpAction = document.getElementById('btnJumpAction');

      this.healthCells = [
        document.getElementById('cell1'),
        document.getElementById('cell2'),
        document.getElementById('cell3')
      ];

      // Game state
      this.state = 'TITLE'; // 'TITLE', 'PLAYING', 'PAUSED', 'GAMEOVER'
      this.sound = new SoundEngine();

      // Pixel Resolution Setting (16:9 Cinematic Widescreen: Default 640x360 for Butter-Smooth 60 FPS)
      this.pixelMode = 'LO';
      this.internalRes = { w: 640, h: 360 };

      // Selected Roadster Color
      this.selectedColor = 'silver';

      // Player State
      this.player = {
        x: 0,
        z: 0,
        jumpY: 0,
        jumpVelocity: 0,
        isJumping: false,
        isBoosting: false,
        wasBoosting: false,
        spinAngle: 0,
        spinVelocity: 0,
        spinDirection: 'RIGHT',
        lastSpinDir: -1,
        inWindDraft: false,
        windDraftTimer: 0,
        jumpCooldown: 0,
        windSource: null,
        suspensionSquash: 0,
        vx: 0,
        maxSteerSpeed: 10.5,
        steerAngle: 0,
        speedKph: 80,
        baseSpeedKph: 80,
        maxSpeedKph: 170,
        boostSpeedKph: 240,
        boostEnergy: 100, // Boost & jump battery
        lives: 3,
        invulnerableTimer: 0,
        topSpeedKph: 80
      };

      // Environmental World Stats
      this.distanceMeters = 0;
      this.score = 0;
      this.highScore = parseInt(localStorage.getItem('nlex_racer_highscore') || localStorage.getItem('pangasinan_highscore') || '0', 10);
      this.currentCheckpointIdx = 0;

      // 3D Scene Lists
      this.roadChunks = [];
      this.obstacles = [];
      this.collectibles = [];
      this.particles = [];
      this.speedLines = [];

      // Spawners
      this.obstacleSpawnDist = 0;
      this.collectibleSpawnDist = 0;
      this.shakeIntensity = 0;

      // Input keys
      this.keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        boost: false, // SHIFT key
        jump: false   // SPACEBAR key
      };

      // Setup Three.js Systems
      this.initThree();
      this.initEvents();
      this.initCarPreview();
      this.fetchServerHighScore();
      this.updateHud();

      // Main Loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.gameLoop(t));
    }

    // --- THREE.JS INITIALIZATION ---
    initThree() {
      // 1. Scene
      this.scene = new THREE.Scene();
      const cp = CHECKPOINTS[0];
      this.scene.background = new THREE.Color(cp.skyColor);
      this.scene.fog = new THREE.FogExp2(cp.fogColor, cp.fogDensity);

      // 2. Camera (Third-person theater widescreen chase camera)
      this.camera = new THREE.PerspectiveCamera(56, this.internalRes.w / this.internalRes.h, 0.1, 400);
      this.camera.position.set(0, 3.6, 8.2);

      // 3. Crisp High-Performance Retro Arcade WebGL Renderer (No MSAA cost, silky 60 FPS)
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.internalRes.w, this.internalRes.h, false);

      // 4. Lighting
      this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(this.ambientLight);

      this.sunLight = new THREE.DirectionalLight(0xfffaed, 0.9);
      this.sunLight.position.set(20, 40, 20);
      this.scene.add(this.sunLight);

      // 5. Materials Cache (Flat Shading for Retro 3D Arcade Visuals)
      this.materials = this.createMaterials();

      // 5b. High-Performance Shared Particle Pool (Zero GC pauses & Zero WebGL buffer thrashing)
      this.sharedGeo = {
        tiny: new THREE.BoxGeometry(0.12, 0.12, 0.12),
        small: new THREE.BoxGeometry(0.18, 0.18, 0.18),
        med: new THREE.BoxGeometry(0.24, 0.24, 0.24),
        large: new THREE.BoxGeometry(0.32, 0.32, 0.32),
        streak: new THREE.BoxGeometry(0.08, 0.08, 1.2)
      };

      this.sharedMat = {
        cyan: new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
        white: new THREE.MeshBasicMaterial({ color: 0xffffff }),
        gold: new THREE.MeshBasicMaterial({ color: 0xffd600 }),
        yellow: new THREE.MeshBasicMaterial({ color: 0xffeb3b }),
        orange: new THREE.MeshBasicMaterial({ color: 0xff6d00 }),
        red: new THREE.MeshBasicMaterial({ color: 0xff1744 }),
        smoke: new THREE.MeshBasicMaterial({ color: 0x37474f, transparent: true, opacity: 0.65 }),
        dust: new THREE.MeshBasicMaterial({ color: 0x546e7a }),
        grey: new THREE.MeshBasicMaterial({ color: 0x90a4ae }),
        wind: new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 })
      };

      // 6. Build Player Roadster 3D Model
      this.playerCar = this.createRoadsterModel(this.selectedColor);
      this.scene.add(this.playerCar);

      // 7. Distant 3D Cyber City Skyline
      this.createCitySkylineBackdrop();

      // 8. Build Initial Endless Road System
      this.buildRoadNetwork();
    }

    createMaterials() {
      // Procedural pixel textures using NearestFilter
      const makePixelTexture = (w, h, drawFn) => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const ctx = offCanvas.getContext('2d');
        drawFn(ctx, w, h);
        const tex = new THREE.CanvasTexture(offCanvas);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        return tex;
      };

      // Asphalt texture with road edge and dash line
      const asphaltTex = makePixelTexture(32, 64, (ctx, w, h) => {
        ctx.fillStyle = '#2e323b';
        ctx.fillRect(0, 0, w, h);
        // Subtle pixel asphalt noise
        ctx.fillStyle = '#373c47';
        for (let i = 0; i < 40; i++) {
          ctx.fillRect(Math.floor(Math.random() * w), Math.floor(Math.random() * h), 1, 1);
        }
      });
      asphaltTex.wrapS = THREE.RepeatWrapping;
      asphaltTex.wrapT = THREE.RepeatWrapping;
      asphaltTex.repeat.set(1, 4);

      // Grass texture
      const grassTex = makePixelTexture(16, 16, (ctx, w, h) => {
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#388e3c';
        ctx.fillRect(0, 0, 8, 8);
        ctx.fillRect(8, 8, 8, 8);
      });
      grassTex.wrapS = THREE.RepeatWrapping;
      grassTex.wrapT = THREE.RepeatWrapping;
      grassTex.repeat.set(8, 20);

      return {
        asphalt: new THREE.MeshLambertMaterial({ map: asphaltTex, flatShading: true }),
        grass: new THREE.MeshLambertMaterial({ map: grassTex, flatShading: true }),
        dirt: new THREE.MeshLambertMaterial({ color: 0x6d4c41, flatShading: true }),
        curbRed: new THREE.MeshBasicMaterial({ color: 0xd32f2f }),
        curbWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
        stripeYellow: new THREE.MeshBasicMaterial({ color: 0xf1c40f }),
        stripeWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
        water: new THREE.MeshLambertMaterial({ color: 0x0288d1, flatShading: true })
      };
    }

    // --- ROADSTER 3D MODEL GENERATION (Ultra-Polished Aerodynamic Hypercar) ---
    createRoadsterModel(colorKey) {
      const theme = CAR_COLORS[colorKey] || CAR_COLORS.silver;
      const group = new THREE.Group();

      // Premium High-Grade Materials
      const bodyMat = new THREE.MeshLambertMaterial({ color: theme.body, flatShading: true });
      const accentMat = new THREE.MeshLambertMaterial({ color: theme.accent, flatShading: true });
      const darkMat = new THREE.MeshLambertMaterial({ color: 0x141820, flatShading: true });
      const carbonMat = new THREE.MeshLambertMaterial({ color: 0x1c232c, flatShading: true });
      const glassMat = new THREE.MeshLambertMaterial({ color: 0x091420, flatShading: true });
      const lightbarMat = new THREE.MeshBasicMaterial({ color: theme.lightbar });
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x181818, flatShading: true });
      const rimMat = new THREE.MeshBasicMaterial({ color: 0xcfd8dc });

      // 1. Lower Aerodynamic Splitter & Carbon Fiber Undertray
      const splitterMesh = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.12, 4.3), carbonMat);
      splitterMesh.position.set(0, 0.20, 0.0);
      group.add(splitterMesh);

      // Front splitter lip extension
      const frontLip = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.08, 0.4), carbonMat);
      frontLip.position.set(0, 0.16, -2.15);
      group.add(frontLip);

      // Rear Diffuser with 3 aerodynamic vertical strakes
      const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.14, 0.55), carbonMat);
      rearDiffuser.position.set(0, 0.22, 1.95);
      group.add(rearDiffuser);

      for (let s of [-0.55, 0, 0.55]) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.5), darkMat);
        fin.position.set(s, 0.16, 1.95);
        group.add(fin);
      }

      // 2. Sculpted Central Roadster Fuselage (Clean continuous unibody)
      const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.36, 3.8), bodyMat);
      mainChassis.position.set(0, 0.42, 0.0);
      group.add(mainChassis);

      // 3. Sleek Aerodynamic Sloping Hood (Smooth raked hood, NO awkward rotated cones!)
      const hoodWedge = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.22, 1.4), bodyMat);
      hoodWedge.position.set(0, 0.40, -1.55);
      hoodWedge.rotation.x = -0.06;
      group.add(hoodWedge);

      const noseCone = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.14, 0.5), accentMat);
      noseCone.position.set(0, 0.35, -2.15);
      group.add(noseCone);

      // Recessed hood aero extractor scoop
      const hoodScoop = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.55), darkMat);
      hoodScoop.position.set(0, 0.52, -1.35);
      group.add(hoodScoop);

      // 4. SIGNATURE CONTINUOUS FRONT CYBER LED LIGHT BAR
      const lightbar = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.06, 0.08), lightbarMat);
      lightbar.position.set(0, 0.40, -2.40);
      group.add(lightbar);

      // Sleek wraparound lightbar edge accents
      for (let side of [-1, 1]) {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.22), lightbarMat);
        edge.position.set(side * 0.77, 0.40, -2.31);
        group.add(edge);
      }

      // 5. Teardrop Panoramic Fastback Glass Canopy (Raked windshield + fastback rear glass)
      const centerRoof = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.36, 1.6), glassMat);
      centerRoof.position.set(0, 0.74, 0.08);
      group.add(centerRoof);

      // Aerodynamic Raked Windshield
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.34, 0.45), glassMat);
      windshield.position.set(0, 0.68, -0.92);
      windshield.rotation.x = -0.42;
      group.add(windshield);

      // Aerodynamic Fastback Rear Window sloping into trunk
      const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.32, 0.65), glassMat);
      rearGlass.position.set(0, 0.66, 1.05);
      rearGlass.rotation.x = 0.35;
      group.add(rearGlass);

      // Sleek Side Mirrors
      for (let side of [-1, 1]) {
        const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.12), darkMat);
        mirror.position.set(side * 0.98, 0.65, -0.65);
        mirror.rotation.y = side * 0.15;
        group.add(mirror);
      }

      // 6. Seamless Ducktail Aero Spoiler & Glowing Full-Width Red LED Taillight Blade
      const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.12, 0.35), bodyMat);
      spoiler.position.set(0, 0.58, 1.85);
      spoiler.rotation.x = 0.12;
      group.add(spoiler);

      const taillightBlade = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.06, 0.06), tailMat);
      taillightBlade.position.set(0, 0.54, 2.02);
      group.add(taillightBlade);

      // 7. Muscular Flared Wheel Arches & High-Precision 16-Segment Wheels
      const wheels = [];
      const wheelPositions = [
        { x: -0.95, y: 0.35, z: -1.2, isFront: true },
        { x: 0.95, y: 0.35, z: -1.2, isFront: true },
        { x: -0.96, y: 0.36, z: 1.25, isFront: false },
        { x: 0.96, y: 0.36, z: 1.25, isFront: false }
      ];

      wheelPositions.forEach((pos) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(pos.x, pos.y, pos.z);

        // Smooth 16-segment radial tire cylinder (clean circular wheels)
        const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16);
        tireGeo.rotateZ(Math.PI / 2);
        const tireMesh = new THREE.Mesh(tireGeo, wheelMat);
        wGroup.add(tireMesh);

        // Turbine Metallic Multi-Spoke Rim
        const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.23, 12);
        rimGeo.rotateZ(Math.PI / 2);
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        wGroup.add(rimMesh);

        // Center hub emblem
        const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.24, 8);
        hubGeo.rotateZ(Math.PI / 2);
        const hubMesh = new THREE.Mesh(hubGeo, darkMat);
        wGroup.add(hubMesh);

        group.add(wGroup);
        wheels.push({ group: wGroup, isFront: pos.isFront });
      });
      group.userData.wheels = wheels;

      // 8. Rear Boost Plasma Jets (Recessed cleanly into diffuser)
      const boostFlameGeo = new THREE.ConeGeometry(0.16, 1.2, 8);
      boostFlameGeo.rotateX(-Math.PI / 2);
      const boostMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

      const flameLeft = new THREE.Mesh(boostFlameGeo, boostMat);
      flameLeft.position.set(-0.45, 0.32, 2.7);
      flameLeft.visible = false;
      group.add(flameLeft);

      const flameRight = new THREE.Mesh(boostFlameGeo, boostMat);
      flameRight.position.set(0.45, 0.32, 2.7);
      flameRight.visible = false;
      group.add(flameRight);

      group.userData.flames = [flameLeft, flameRight];

      // 8B. UNDERBODY COLD-GAS HOVER THRUSTERS (Seamlessly flush with undertray)
      const downwardJets = [];
      const downNozzleMat = new THREE.MeshLambertMaterial({ color: 0x263238, flatShading: true });
      const downPlasmaMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const downCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const nozzlePositions = [
        { x: -0.65, z: -1.2 }, // Front Left
        { x: 0.65, z: -1.2 },  // Front Right
        { x: -0.65, z: 1.2 },   // Rear Left
        { x: 0.65, z: 1.2 }    // Rear Right
      ];

      nozzlePositions.forEach((nPos) => {
        // Recessed circular nozzle port (flush with splitter, no clipping)
        const nozMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.06, 8), downNozzleMat);
        nozMesh.position.set(nPos.x, 0.16, nPos.z);
        group.add(nozMesh);

        // Downward intense plasma cone
        const jetGroup = new THREE.Group();
        jetGroup.position.set(nPos.x, 0.14, nPos.z);

        const jetConeGeo = new THREE.ConeGeometry(0.24, 1.4, 8);
        jetConeGeo.rotateX(Math.PI);
        const jetCone = new THREE.Mesh(jetConeGeo, downPlasmaMat);
        jetCone.position.y = -0.7;
        jetGroup.add(jetCone);

        // White plasma core
        const coreConeGeo = new THREE.ConeGeometry(0.12, 0.9, 6);
        coreConeGeo.rotateX(Math.PI);
        const coreCone = new THREE.Mesh(coreConeGeo, downCoreMat);
        coreCone.position.y = -0.45;
        jetGroup.add(coreCone);

        jetGroup.visible = false;
        group.add(jetGroup);
        downwardJets.push(jetGroup);
      });
      group.userData.downwardJets = downwardJets;

      // 9. Neon Underglow & Ground Blast Reflection Plane
      const underglowGeo = new THREE.PlaneGeometry(2.6, 4.4);
      underglowGeo.rotateX(-Math.PI / 2);
      const underglowMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.45
      });
      const underglowMesh = new THREE.Mesh(underglowGeo, underglowMat);
      underglowMesh.position.y = 0.04;
      group.add(underglowMesh);
      group.userData.underglow = underglowMesh;

      return group;
    }

    // --- PROCEDURAL 3D ENDLESS ROAD NETWORK ---
    buildRoadNetwork() {
      // Clear existing
      this.roadChunks.forEach((chunk) => this.scene.remove(chunk.group));
      this.roadChunks = [];

      // Create chunks stretching into negative Z
      for (let i = 0; i < TOTAL_CHUNKS; i++) {
        const zPos = -i * CHUNK_LENGTH;
        const chunk = this.createRoadChunk(zPos, i);
        this.roadChunks.push(chunk);
        this.scene.add(chunk.group);
      }
    }

    createRoadChunk(zPos, index) {
      const group = new THREE.Group();
      group.position.z = zPos;

      // 1. Asphalt Roadway Surface
      const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, CHUNK_LENGTH);
      roadGeo.rotateX(-Math.PI / 2);
      const roadMesh = new THREE.Mesh(roadGeo, this.materials.asphalt);
      roadMesh.position.set(0, 0, -CHUNK_LENGTH / 2);
      group.add(roadMesh);

      // 2. Road Verge Curb Stones (Red & White alternating)
      const curbGeo = new THREE.BoxGeometry(0.5, 0.18, CHUNK_LENGTH);
      const curbLeft = new THREE.Mesh(curbGeo, index % 2 === 0 ? this.materials.curbRed : this.materials.curbWhite);
      curbLeft.position.set(-ROAD_WIDTH / 2 - 0.25, 0.09, -CHUNK_LENGTH / 2);
      group.add(curbLeft);

      const curbRight = new THREE.Mesh(curbGeo, index % 2 === 0 ? this.materials.curbRed : this.materials.curbWhite);
      curbRight.position.set(ROAD_WIDTH / 2 + 0.25, 0.09, -CHUNK_LENGTH / 2);
      group.add(curbRight);

      // 3. Lane Marking Strips (Dotted yellow/white center dividers)
      const dashLen = 4;
      const gapLen = 4;
      const numDashes = Math.floor(CHUNK_LENGTH / (dashLen + gapLen));
      const laneOffset = ROAD_WIDTH / 6; // 3 lanes: left, center, right

      for (let d = 0; d < numDashes; d++) {
        const dZ = -d * (dashLen + gapLen) - dashLen / 2;
        // Lane 1 divider
        const dash1 = new THREE.Mesh(new THREE.PlaneGeometry(0.24, dashLen), this.materials.stripeYellow);
        dash1.rotateX(-Math.PI / 2);
        dash1.position.set(-laneOffset, 0.01, dZ);
        group.add(dash1);

        // Lane 2 divider
        const dash2 = new THREE.Mesh(new THREE.PlaneGeometry(0.24, dashLen), this.materials.stripeYellow);
        dash2.rotateX(-Math.PI / 2);
        dash2.position.set(laneOffset, 0.01, dZ);
        group.add(dash2);
      }

      // 4. Solid White Outer Edge Lines
      const edgeGeo = new THREE.PlaneGeometry(0.25, CHUNK_LENGTH);
      edgeGeo.rotateX(-Math.PI / 2);
      const edgeLeft = new THREE.Mesh(edgeGeo, this.materials.stripeWhite);
      edgeLeft.position.set(-ROAD_WIDTH / 2 + 0.5, 0.01, -CHUNK_LENGTH / 2);
      group.add(edgeLeft);

      const edgeRight = new THREE.Mesh(edgeGeo, this.materials.stripeWhite);
      edgeRight.position.set(ROAD_WIDTH / 2 - 0.5, 0.01, -CHUNK_LENGTH / 2);
      group.add(edgeRight);

      // 5. Left & Right Terrain (Rice Fields / Coastline)
      const terrainWidth = 140;
      const terrainGeo = new THREE.PlaneGeometry(terrainWidth, CHUNK_LENGTH);
      terrainGeo.rotateX(-Math.PI / 2);

      const terrainLeft = new THREE.Mesh(terrainGeo, this.materials.grass);
      terrainLeft.position.set(-ROAD_WIDTH / 2 - terrainWidth / 2 - 0.5, -0.02, -CHUNK_LENGTH / 2);
      group.add(terrainLeft);

      const terrainRight = new THREE.Mesh(terrainGeo, this.materials.grass);
      terrainRight.position.set(ROAD_WIDTH / 2 + terrainWidth / 2 + 0.5, -0.02, -CHUNK_LENGTH / 2);
      group.add(terrainRight);

      // 6. Populate Roadside 3D Scenery on this chunk
      this.populateChunkScenery(group);

      return {
        group,
        zPos,
        index
      };
    }

    populateChunkScenery(chunkGroup) {
      // 1. Modern Highway Streetlights on road shoulders
      const poleLeft = this.createHighwayLight(-1);
      poleLeft.position.set(-ROAD_WIDTH / 2 - 2.4, 0, -CHUNK_LENGTH * 0.3);
      chunkGroup.add(poleLeft);

      const poleRight = this.createHighwayLight(1);
      poleRight.position.set(ROAD_WIDTH / 2 + 2.4, 0, -CHUNK_LENGTH * 0.7);
      chunkGroup.add(poleRight);

      // 2. Roadside Scenery (STRICTLY ON THE SHOULDERS - ROADWAY IS 100% CLEAR)
      const r = Math.random();
      if (r < 0.5) {
        // Highway Digital Video Billboard on far shoulder
        const side = Math.random() > 0.5 ? 1 : -1;
        const billboard = this.createCyberBillboard();
        billboard.position.set(side * (ROAD_WIDTH / 2 + 8.0), 0, -CHUNK_LENGTH * 0.5);
        chunkGroup.add(billboard);
      } else {
        // Highway Guardrail Crash Barrier Section on shoulder
        const side = Math.random() > 0.5 ? 1 : -1;
        const barrier = this.createHighwayCurbSection();
        barrier.position.set(side * (ROAD_WIDTH / 2 + 1.2), 0, -CHUNK_LENGTH * 0.5);
        chunkGroup.add(barrier);
      }
    }

    // --- PROCEDURAL 3D HIGHWAY SCENERY ASSETS ---
    createHighwayLight(sideDirection) {
      // Modern Expressway Cantilever Streetlight
      const group = new THREE.Group();
      const poleMat = new THREE.MeshLambertMaterial({ color: 0x455a64, flatShading: true });
      const lampHousingMat = new THREE.MeshLambertMaterial({ color: 0x263238, flatShading: true });
      const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 }); // Glowing highway sodium/LED light

      // Vertical tapered steel pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 9.2, 6), poleMat);
      pole.position.y = 4.6;
      group.add(pole);

      // Overhanging curved arm extending toward highway
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 0.14), poleMat);
      arm.position.set(sideDirection * -1.2, 9.0, 0);
      arm.rotation.z = sideDirection * 0.22;
      group.add(arm);

      // Lamp housing
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.5), lampHousingMat);
      lamp.position.set(sideDirection * -2.4, 8.8, 0);
      group.add(lamp);

      // Luminous emitting lens underneath
      const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), lampGlowMat);
      lens.rotateX(Math.PI / 2);
      lens.position.set(sideDirection * -2.4, 8.68, 0);
      group.add(lens);

      return group;
    }

    createHighwayGantry() {
      // Steel Truss Overhead Sign Gantry spanning all 3 lanes
      const group = new THREE.Group();
      const steelMat = new THREE.MeshLambertMaterial({ color: 0x546e7a, flatShading: true });
      const signGreenMat = new THREE.MeshLambertMaterial({ color: 0x1b5e20, flatShading: true });
      const signBlueMat = new THREE.MeshLambertMaterial({ color: 0x0d47a1, flatShading: true });
      const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });

      const spanWidth = ROAD_WIDTH + 4.0;
      const gantryHeight = 7.8;

      // Left & Right Support Pillars
      for (let x of [-spanWidth / 2, spanWidth / 2]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, gantryHeight, 6), steelMat);
        pillar.position.set(x, gantryHeight / 2, 0);
        group.add(pillar);
      }

      // Overhead Crossbar Truss
      const truss = new THREE.Mesh(new THREE.BoxGeometry(spanWidth, 0.6, 0.6), steelMat);
      truss.position.set(0, gantryHeight, 0);
      group.add(truss);

      // Main Left Overhead Highway Sign ("NLEX NORTHBOUND")
      const signLeft = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.2, 0.15), signGreenMat);
      signLeft.position.set(-3.2, gantryHeight - 0.2, 0.35);
      group.add(signLeft);

      // White border on sign
      const borderL = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.4, 0.05), whiteMat);
      borderL.position.set(-3.2, gantryHeight - 0.2, 0.3);
      group.add(borderL);

      // Reflective chevron graphics on sign
      const textStripeL1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 0.08), whiteMat);
      textStripeL1.position.set(-3.2, gantryHeight + 0.4, 0.45);
      group.add(textStripeL1);

      const textStripeL2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 0.08), yellowMat);
      textStripeL2.position.set(-3.2, gantryHeight - 0.3, 0.45);
      group.add(textStripeL2);

      // Right Overhead Highway Sign ("CLARK / CYBER SKYWAY")
      const signRight = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.2, 0.15), signBlueMat);
      signRight.position.set(3.4, gantryHeight - 0.2, 0.35);
      group.add(signRight);

      const borderR = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.4, 0.05), whiteMat);
      borderR.position.set(3.4, gantryHeight - 0.2, 0.3);
      group.add(borderR);

      const textStripeR = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 0.08), whiteMat);
      textStripeR.position.set(3.4, gantryHeight + 0.2, 0.45);
      group.add(textStripeR);

      return group;
    }

    createCyberBillboard() {
      // Highway Digital Video Billboard
      const group = new THREE.Group();
      const frameMat = new THREE.MeshLambertMaterial({ color: 0x1f2430, flatShading: true });
      const screenMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00f0ff : 0xff007f });
      const pillarMat = new THREE.MeshLambertMaterial({ color: 0x37474f, flatShading: true });

      // Support Column
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 8.5, 6), pillarMat);
      col.position.y = 4.25;
      group.add(col);

      // Billboard Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.0, 0.4), frameMat);
      frame.position.set(0, 9.5, 0);
      group.add(frame);

      // Luminous Neon Screen Display
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 3.4), screenMat);
      screen.position.set(0, 9.5, 0.22);
      group.add(screen);

      return group;
    }

    createHighwayCurbSection() {
      const group = new THREE.Group();
      const barrierMat = new THREE.MeshLambertMaterial({ color: 0x78909c, flatShading: true });
      const reflectorMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });

      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 12.0), barrierMat);
      bar.position.y = 0.5;
      group.add(bar);

      for (let z of [-4, 0, 4]) {
        const refl = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.18), reflectorMat);
        refl.position.set(0, 0.7, z);
        group.add(refl);
      }

      return group;
    }

    createCitySkylineBackdrop() {
      // Retro Cyber City Metropolis Skyline Horizon (Flanking only - Roadway is 100% clear)
      const group = new THREE.Group();
      const bldgColors = [0x161d2b, 0x1a233a, 0x0f1724, 0x222b42, 0x1c2833];
      const neonMats = [
        new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
        new THREE.MeshBasicMaterial({ color: 0xff007f }),
        new THREE.MeshBasicMaterial({ color: 0xf8b800 }),
        new THREE.MeshBasicMaterial({ color: 0x39ff14 })
      ];

      // Generate skyscrapers ONLY on far left & far right shoulders (|x| >= 50m)
      // The central corridor (|x| < 50m) is 100% CLEAR so the highway horizon is open and unobstructed!
      const numPerSide = 12;
      for (const side of [-1, 1]) {
        for (let i = 0; i < numPerSide; i++) {
          const height = 40 + Math.random() * 85;
          const width = 18 + Math.random() * 22;
          const depth = 20 + Math.random() * 24;
          const color = bldgColors[Math.floor(Math.random() * bldgColors.length)];
          const bldgMat = new THREE.MeshLambertMaterial({ color, flatShading: true });

          const bldg = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bldgMat);
          const xPos = side * (52 + i * 12 + Math.random() * 8);
          const zPos = -320 + (Math.random() - 0.5) * 80;
          bldg.position.set(xPos, height / 2 - 8, zPos);
          group.add(bldg);

          // Rooftop Neon Antenna Spires
          if (Math.random() < 0.65) {
            const spireMat = neonMats[Math.floor(Math.random() * neonMats.length)];
            const spireHeight = 8 + Math.random() * 18;
            const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, spireHeight, 4), spireMat);
            spire.position.set(xPos, height + spireHeight / 2 - 8, zPos);
            group.add(spire);
          }

          // Tiered Penthouse Block
          if (Math.random() < 0.5) {
            const topH = 10 + Math.random() * 15;
            const topW = width * 0.6;
            const topBldg = new THREE.Mesh(new THREE.BoxGeometry(topW, topH, depth * 0.6), bldgMat);
            topBldg.position.set(xPos, height + topH / 2 - 8, zPos);
            group.add(topBldg);
          }
        }
      }

      this.citySkylineBackdrop = group;
      this.scene.add(group);
    }

    // --- AERO WIND SLIPSTREAM GENERATION (Anti-Abuse Jump Zones) ---
    createWindStreamMesh(width, length) {
      const group = new THREE.Group();
      group.userData = { animTimer: Math.random() * 10, chevrons: [] };

      const cyanMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.75
      });
      const whiteMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.88
      });
      const ribbonMat = new THREE.MeshBasicMaterial({
        color: 0x80deea,
        transparent: true,
        opacity: 0.4
      });

      // 1. Outer Lane Wind Stream Guide Ribbons (Left & Right)
      const streamLen = 22.0;
      const ribbonWidth = 0.08;
      const halfW = Math.max(1.4, width * 0.5 + 0.25);

      const leftRibbon = new THREE.Mesh(new THREE.BoxGeometry(ribbonWidth, 0.04, streamLen), ribbonMat);
      leftRibbon.position.set(-halfW, 0.04, 0);
      group.add(leftRibbon);

      const rightRibbon = new THREE.Mesh(new THREE.BoxGeometry(ribbonWidth, 0.04, streamLen), ribbonMat);
      rightRibbon.position.set(halfW, 0.04, 0);
      group.add(rightRibbon);

      // 2. Animated Wind Chevrons (Flowing towards the obstacle along -Z)
      const numChevrons = 4;
      for (let i = 0; i < numChevrons; i++) {
        const chGroup = new THREE.Group();
        const baseZ = -streamLen * 0.5 + (i / numChevrons) * streamLen;

        // Left wing of chevron (angled toward obstacle)
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.16), i % 2 === 0 ? cyanMat : whiteMat);
        wingL.position.set(-0.32, 0.05, 0.12);
        wingL.rotation.y = -0.55;
        chGroup.add(wingL);

        // Right wing of chevron (angled toward obstacle)
        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.16), i % 2 === 0 ? cyanMat : whiteMat);
        wingR.position.set(0.32, 0.05, 0.12);
        wingR.rotation.y = 0.55;
        chGroup.add(wingR);

        // Wind swirl spark in center of chevron
        const spark = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), cyanMat);
        spark.position.set(0, 0.15, 0);
        chGroup.add(spark);

        chGroup.position.set(0, 0, baseZ);
        chGroup.userData = { offsetZ: (i / numChevrons) * streamLen };
        group.add(chGroup);
        group.userData.chevrons.push(chGroup);
      }

      return group;
    }

    animateWindStream(mesh, dt) {
      if (!mesh || !mesh.userData || !mesh.userData.chevrons) return;
      mesh.userData.animTimer += dt;
      const speed = 26.0; // Flowing forward toward the vehicle
      const streamLen = 22.0;

      mesh.userData.chevrons.forEach((ch) => {
        ch.userData.offsetZ -= speed * dt;
        if (ch.userData.offsetZ < 0) {
          ch.userData.offsetZ += streamLen;
        }
        ch.position.z = -streamLen * 0.5 + ch.userData.offsetZ;
        ch.position.y = 0.02 + Math.sin(mesh.userData.animTimer * 6 + ch.position.z) * 0.03;
      });
    }

    // --- 3D HIGH-VISIBILITY OBSTACLE MODELS ---
    createObstacle(zSpawn) {
      // 5 High-Visibility Expressway Obstacle Types (NO flat/invisible obstacles)
      const types = ['truck', 'bus', 'van', 'barrier', 'boulder'];
      const type = types[Math.floor(Math.random() * types.length)];
      let mesh = null;
      let width = 2.4;
      let length = 4.5;
      let speedKph = 50;

      if (type === 'truck') {
        mesh = this.createTruckModel();
        width = 2.8;
        length = 8.5;
        speedKph = 55 + Math.random() * 18;
      } else if (type === 'bus') {
        mesh = this.createBusModel();
        width = 2.7;
        length = 8.0;
        speedKph = 65 + Math.random() * 18;
      } else if (type === 'van') {
        mesh = this.createVanModel();
        width = 2.4;
        length = 4.8;
        speedKph = 70 + Math.random() * 20;
      } else if (type === 'barrier') {
        mesh = this.createBarrierModel();
        width = 3.2;
        length = 1.6;
        speedKph = 0;
      } else {
        mesh = this.createBoulderHazardModel();
        width = 3.0;
        length = 3.0;
        speedKph = 0;
      }

      // 3 High-Speed Expressway Lanes
      const lanes = [-4.6, 0, 4.6];
      const laneX = lanes[Math.floor(Math.random() * lanes.length)] + (Math.random() - 0.5) * 0.4;

      mesh.position.set(laneX, 0, zSpawn);
      this.scene.add(mesh);

      // High-Visibility Aero Wind Slipstream Zone (leading directly into the rear draft)
      const windMesh = this.createWindStreamMesh(width, length);
      windMesh.position.set(laneX, 0.05, zSpawn + length * 0.5 + 11.0);
      this.scene.add(windMesh);

      return {
        type,
        mesh,
        windMesh,
        x: laneX,
        y: 0,
        z: zSpawn,
        width,
        length,
        speedKph,
        driftTimer: Math.random() * 10,
        isCrashed: false,
        hasCrashed: false,
        vx: 0,
        vy: 0,
        vz: 0,
        rotVx: 0,
        rotVy: 0,
        rotVz: 0,
        crashTimer: 0
      };
    }

    createTruckModel() {
      // Massive NLEX 18-Wheeler Cargo Container Rig (3.8m tall, 8.5m long, 2.8m wide)
      const group = new THREE.Group();
      const cabColors = [0xfbc02d, 0xe53935, 0x0288d1, 0x43a047];
      const cabMat = new THREE.MeshLambertMaterial({ color: cabColors[Math.floor(Math.random() * cabColors.length)], flatShading: true });
      const containerMat = new THREE.MeshLambertMaterial({ color: 0xeceff1, flatShading: true });
      const chromeMat = new THREE.MeshLambertMaterial({ color: 0xe0e0e0, flatShading: true });
      const darkMat = new THREE.MeshLambertMaterial({ color: 0x212121, flatShading: true });
      const redTaillightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
      const chevronYellowMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
      const chevronBlackMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

      // 1. Truck Cab
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), cabMat);
      cab.position.set(0, 1.6, -3.1);
      group.add(cab);

      // Windshield
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 0.2), darkMat);
      windshield.position.set(0, 2.2, -4.35);
      group.add(windshield);

      // Front Chrome Grille
      const grille = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.2, 0.2), chromeMat);
      grille.position.set(0, 1.0, -4.4);
      group.add(grille);

      // Dual Chrome Vertical Exhaust Smokestacks
      for (let x of [-1.35, 1.35]) {
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.8, 6), chromeMat);
        stack.position.set(x, 2.1, -1.9);
        group.add(stack);
      }

      // 2. Cargo Container Trailer (High & Imposing)
      const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 6.2), containerMat);
      trailer.position.set(0, 2.0, 1.4);
      group.add(trailer);

      // Trailer Roof Guard
      const roofBeams = new THREE.Mesh(new THREE.BoxGeometry(2.76, 0.12, 6.24), darkMat);
      roofBeams.position.set(0, 3.65, 1.4);
      group.add(roofBeams);

      // Bold Reflective Rear Hazard Stripes on back of container
      const rearDoor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 0.05), chevronYellowMat);
      rearDoor.position.set(0, 1.2, 4.52);
      group.add(rearDoor);

      for (let s of [-0.9, -0.3, 0.3, 0.9]) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.02, 0.08), chevronBlackMat);
        stripe.position.set(s, 1.2, 4.53);
        stripe.rotation.z = 0.45;
        group.add(stripe);
      }

      // 4 Bright Glowing Red Taillights on rear bumper
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 0.2), darkMat);
      bumper.position.set(0, 0.5, 4.5);
      group.add(bumper);

      for (let x of [-1.0, -0.6, 0.6, 1.0]) {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.08), redTaillightMat);
        tl.position.set(x, 0.5, 4.62);
        group.add(tl);
      }

      // Heavy 3D Wheels (4 axle pairs)
      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1e1e1e });
      for (let z of [-3.1, 0.0, 1.6, 3.2]) {
        for (let x of [-1.35, 1.35]) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 8), wheelMat);
          wheel.rotateZ(Math.PI / 2);
          wheel.position.set(x, 0.42, z);
          group.add(wheel);
        }
      }

      return group;
    }

    createBusModel() {
      // Modern Expressway Intercity Coach (3.4m tall, 8.0m long, 2.7m wide)
      const group = new THREE.Group();
      const busMat = new THREE.MeshLambertMaterial({ color: 0x0288d1, flatShading: true });
      const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
      const darkGlassMat = new THREE.MeshLambertMaterial({ color: 0x101a24, flatShading: true });
      const redTaillightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
      const destLedMat = new THREE.MeshBasicMaterial({ color: 0xffea00 }); // Glowing destination sign

      // Lower Chassis
      const lower = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 7.8), busMat);
      lower.position.set(0, 0.9, 0);
      group.add(lower);

      // Upper Cabin with White Roof
      const upper = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 7.8), whiteMat);
      upper.position.set(0, 2.2, 0);
      group.add(upper);

      // Panoramic Continuous Tinted Windows
      const windows = new THREE.Mesh(new THREE.BoxGeometry(2.64, 0.9, 7.2), darkGlassMat);
      windows.position.set(0, 2.1, 0.2);
      group.add(windows);

      // Front Curved Windshield
      const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.2), darkGlassMat);
      frontGlass.position.set(0, 2.0, -3.92);
      group.add(frontGlass);

      // Illuminated LED Front Destination Sign ("NLEX EXPRESS")
      const destSign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.08), destLedMat);
      destSign.position.set(0, 2.85, -3.95);
      group.add(destSign);

      // Aerodynamic Rooftop AC Pod
      const acPod = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 2.4), whiteMat);
      acPod.position.set(0, 3.2, 0);
      group.add(acPod);

      // Dual High-Visibility Red Taillight Columns on Rear
      for (let x of [-1.15, 1.15]) {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 0.08), redTaillightMat);
        tl.position.set(x, 1.5, 3.93);
        group.add(tl);
      }

      // Wheels
      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
      for (let z of [-2.4, 2.2, 3.1]) {
        for (let x of [-1.3, 1.3]) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 8), wheelMat);
          wheel.rotateZ(Math.PI / 2);
          wheel.position.set(x, 0.42, z);
          group.add(wheel);
        }
      }

      return group;
    }

    createVanModel() {
      // Modern Commuter Expressway Van / UV Express (2.4m tall, 4.8m long)
      const group = new THREE.Group();
      const vanMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5, flatShading: true });
      const glassMat = new THREE.MeshLambertMaterial({ color: 0x1a2634, flatShading: true });
      const darkMat = new THREE.MeshLambertMaterial({ color: 0x263238, flatShading: true });
      const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
      const chevronMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });

      // Main Van Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.8, 4.6), vanMat);
      body.position.set(0, 1.2, 0);
      group.add(body);

      // Sloped Hood
      const hood = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.9), vanMat);
      hood.position.set(0, 0.7, -2.5);
      group.add(hood);

      // Side Windows
      const sideWindows = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.65, 3.6), glassMat);
      sideWindows.position.set(0, 1.5, 0.2);
      group.add(sideWindows);

      // Front Windshield
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 0.2), glassMat);
      windshield.position.set(0, 1.55, -2.1);
      windshield.rotation.x = 0.35;
      group.add(windshield);

      // Roof Luggage Rails
      const roofRack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 3.2), darkMat);
      roofRack.position.set(0, 2.18, 0.2);
      group.add(roofRack);

      // Rear Hazard Chevron Reflector Strip
      const chevron = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.05), chevronMat);
      chevron.position.set(0, 0.8, 2.32);
      group.add(chevron);

      // Dual Red Taillights
      for (let x of [-1.0, 1.0]) {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.06), taillightMat);
        tl.position.set(x, 1.2, 2.33);
        group.add(tl);
      }

      // Wheels
      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
      for (let z of [-1.5, 1.5]) {
        for (let x of [-1.15, 1.15]) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.24, 7), wheelMat);
          wheel.rotateZ(Math.PI / 2);
          wheel.position.set(x, 0.35, z);
          group.add(wheel);
        }
      }

      return group;
    }

    createBarrierModel() {
      // High-Impact Highway Barricade with DUAL FLASHING AMBER STROBES (2.3m tall, 3.2m wide)
      const group = new THREE.Group();
      const jerseyConcreteMat = new THREE.MeshLambertMaterial({ color: 0x90a4ae, flatShading: true });
      const orangeSafetyMat = new THREE.MeshLambertMaterial({ color: 0xff6d00, flatShading: true });
      const whiteReflectMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const amberStrobeMat = new THREE.MeshBasicMaterial({ color: 0xffab00 }); // High-intensity flashing beacon
      const blackSteelMat = new THREE.MeshLambertMaterial({ color: 0x263238 });

      // 1. Concrete Jersey Barrier Base (Heavy, high-visibility foundation)
      const jerseyBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.85, 0.7), jerseyConcreteMat);
      jerseyBase.position.y = 0.42;
      group.add(jerseyBase);

      // Reflective chevron strip on concrete base
      const baseStripe = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, 0.72), whiteReflectMat);
      baseStripe.position.set(0, 0.5, 0);
      group.add(baseStripe);

      // 2. High-Elevation A-Frame Warning Barricade (Extends to 2.2m height)
      const board1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.45, 0.14), orangeSafetyMat);
      board1.position.set(0, 1.35, 0);
      group.add(board1);

      const board2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.45, 0.14), orangeSafetyMat);
      board2.position.set(0, 1.95, 0);
      group.add(board2);

      // Diagonal White Reflective Chevron Stripes on boards
      for (let x of [-1.0, 0, 1.0]) {
        const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.47, 0.16), whiteReflectMat);
        s1.position.set(x, 1.35, 0);
        s1.rotation.z = 0.35;
        group.add(s1);

        const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.47, 0.16), whiteReflectMat);
        s2.position.set(x, 1.95, 0);
        s2.rotation.z = -0.35;
        group.add(s2);
      }

      // Vertical Steel Support Poles
      for (let x of [-1.35, 1.35]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), blackSteelMat);
        pole.position.set(x, 1.4, 0);
        group.add(pole);

        // 3. High-Intensity Flashing Amber Strobe Beacons on Top Corners!
        const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 6), blackSteelMat);
        beaconBase.position.set(x, 2.25, 0);
        group.add(beaconBase);

        const amberDome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 6, 6), amberStrobeMat);
        amberDome.position.set(x, 2.45, 0);
        group.add(amberDome);
      }

      // Flanking Safety Cones on left and right (1.0m tall, bright fluorescent orange)
      for (let x of [-1.8, 1.8]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.95, 6), orangeSafetyMat);
        cone.position.set(x, 0.48, 0.3);
        group.add(cone);

        const collar = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.28, 6), whiteReflectMat);
        collar.position.set(x, 0.52, 0.3);
        group.add(collar);
      }

      return group;
    }

    createBoulderHazardModel() {
      // Massive Highway Rockfall Hazard with FLASHING EMERGENCY WARNING FLARE (2.4m tall, 3.0m wide)
      const group = new THREE.Group();
      const rockMat = new THREE.MeshLambertMaterial({ color: 0x546e7a, flatShading: true }); // Highlighted granite
      const hazardYellowMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
      const hazardBlackMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
      const redFlareMat = new THREE.MeshBasicMaterial({ color: 0xff1744 }); // High-intensity flashing red flare
      const orangeSafetyMat = new THREE.MeshLambertMaterial({ color: 0xff6d00, flatShading: true });

      // 1. Massive Primary Geometric Boulder (Faceted, high silhouette)
      const mainRock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), rockMat);
      mainRock.position.set(0, 1.35, 0);
      mainRock.rotation.set(0.4, 0.6, 0.2);
      mainRock.scale.set(1.1, 0.95, 1.0);
      group.add(mainRock);

      // Flanking secondary rock blocks
      const rockL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), rockMat);
      rockL.position.set(-1.3, 0.75, 0.3);
      group.add(rockL);

      const rockR = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), rockMat);
      rockR.position.set(1.2, 0.8, -0.2);
      group.add(rockR);

      // 2. High-Visibility Caution Base Banding (Fluorescent yellow & black perimeter)
      const baseBar = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.35, 0.35), hazardYellowMat);
      baseBar.position.set(0, 0.2, 1.4);
      group.add(baseBar);

      for (let s of [-1.2, -0.6, 0, 0.6, 1.2]) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.37, 0.37), hazardBlackMat);
        stripe.position.set(s, 0.2, 1.4);
        stripe.rotation.y = 0.4;
        group.add(stripe);
      }

      // 3. Emergency High-Mount Warning Strobe Flare (Stands on top of boulder, 2.5m elevation!)
      const flarePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 5), hazardBlackMat);
      flarePillar.position.set(0, 2.4, 0);
      group.add(flarePillar);

      const flareGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), redFlareMat);
      flareGlobe.position.set(0, 2.75, 0);
      group.add(flareGlobe);

      // Flanking Hazard Cones
      for (let x of [-1.7, 1.7]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.85, 6), orangeSafetyMat);
        cone.position.set(x, 0.42, 1.1);
        group.add(cone);
      }

      return group;
    }

    // --- 3D COLLECTIBLE MODELS ---
    createCollectible(zSpawn) {
      // 1. Cyber Energy Cell (+35% Boost)
      // 2. Expressway Hyper RFID Pass (+600 PTS Bonus)
      const isRfid = Math.random() < 0.35;
      const type = isRfid ? 'rfid' : 'battery';

      const group = new THREE.Group();
      if (type === 'battery') {
        // Futuristic Glowing Energy Cell
        const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x004d40 });

        const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.2, 7), darkMat);
        group.add(cell);

        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.35, 6), cyanMat);
        cap.position.y = 0.7;
        group.add(cap);

        const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.55), yellowMat);
        group.add(bolt);
      } else {
        // Glowing Gold Expressway RFID Toll Pass Token (+600 PTS)
        const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const cyanRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const coreMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

        const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.18, 12), goldMat);
        coin.rotateX(Math.PI / 2);
        group.add(coin);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 6, 12), cyanRingMat);
        group.add(ring);

        const star = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.22), coreMat);
        group.add(star);
      }

      const lanes = [-4.6, 0, 4.6];
      const x = lanes[Math.floor(Math.random() * lanes.length)];
      group.position.set(x, 1.2, zSpawn);
      this.scene.add(group);

      return {
        type,
        mesh: group,
        x,
        z: zSpawn,
        rotSpeed: 2.8 + Math.random() * 2.0
      };
    }

    // --- CAR PREVIEW 3D CANVAS ---
    initCarPreview() {
      this.previewScene = new THREE.Scene();
      this.previewScene.background = new THREE.Color(0x161926);

      this.previewCamera = new THREE.PerspectiveCamera(50, 160 / 110, 0.1, 50);
      this.previewCamera.position.set(2.8, 2.2, 3.8);
      this.previewCamera.lookAt(0, 0.5, 0);

      this.previewRenderer = new THREE.WebGLRenderer({
        canvas: this.previewCanvas,
        antialias: true
      });
      this.previewRenderer.setSize(160, 110, false);

      const pLight = new THREE.DirectionalLight(0xffffff, 1.2);
      pLight.position.set(5, 8, 5);
      this.previewScene.add(pLight);
      this.previewScene.add(new THREE.AmbientLight(0xffffff, 0.7));

      this.updatePreviewCar();
    }

    updatePreviewCar() {
      if (this.previewCarMesh) {
        this.previewScene.remove(this.previewCarMesh);
      }
      this.previewCarMesh = this.createRoadsterModel(this.selectedColor);
      this.previewScene.add(this.previewCarMesh);
    }

    // --- CONTROLS & EVENTS ---
    initEvents() {
      window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
        if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = true;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = true;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') {
          this.keys.boost = true;
          e.preventDefault();
        }
        if (e.code === 'Space') {
          this.keys.jump = true;
          this.triggerJump();
          e.preventDefault();
        }
        if (e.code === 'KeyR') {
          if (this.state === 'GAMEOVER' || this.state === 'PLAYING') this.startGame();
        }
        if (e.code === 'KeyP' || e.code === 'Escape') {
          if (this.state === 'PLAYING') this.pauseGame();
          else if (this.state === 'PAUSED') this.resumeGame();
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
        if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = false;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = false;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') this.keys.boost = false;
        if (e.code === 'Space') this.keys.jump = false;
      });

      document.getElementById('startGameBtn').addEventListener('click', () => {
        this.sound.init();
        this.startGame();
      });

      document.getElementById('restartGameBtn').addEventListener('click', () => {
        this.startGame();
      });

      document.getElementById('mainMenuBtn').addEventListener('click', () => {
        this.showTitleScreen();
      });

      document.getElementById('resumeBtn').addEventListener('click', () => {
        this.resumeGame();
      });

      const soundBtn = document.getElementById('soundToggleBtn');
      soundBtn.addEventListener('click', () => {
        this.sound.init();
        const muted = this.sound.toggleMute();
        soundBtn.innerHTML = muted ? `${ICONS.soundOff} <span class="btn-label">SFX OFF</span>` : `${ICONS.soundOn} <span class="btn-label">SFX ON</span>`;
      });

      const crtBtn = document.getElementById('crtToggleBtn');
      crtBtn.addEventListener('click', () => {
        this.crtOverlay.classList.toggle('active');
        const isActive = this.crtOverlay.classList.contains('active');
        crtBtn.innerHTML = `${ICONS.crt} <span class="btn-label">CRT ${isActive ? 'ON' : 'OFF'}</span>`;
      });

      // Thruster Video Modal Events
      const videoModal = document.getElementById('videoModal');
      const openVideoBtn = document.getElementById('openVideoBtn');
      const closeVideoBtn = document.getElementById('closeVideoBtn');
      const modalVideo = document.getElementById('modalVideo');

      if (openVideoBtn && videoModal) {
        openVideoBtn.addEventListener('click', (e) => {
          e.preventDefault();
          videoModal.classList.add('active');
          if (modalVideo) {
            modalVideo.currentTime = 0;
            modalVideo.play().catch(() => {});
          }
        });
      }

      if (closeVideoBtn && videoModal) {
        closeVideoBtn.addEventListener('click', (e) => {
          e.preventDefault();
          videoModal.classList.remove('active');
          if (modalVideo) {
            modalVideo.pause();
          }
        });
      }

      // Resolution Toggle Button (16:9 Widescreen Toggle)
      const resBtn = document.getElementById('resToggleBtn');
      resBtn.addEventListener('click', () => {
        if (this.pixelMode === 'LO') {
          this.pixelMode = 'HI';
          this.internalRes = { w: 960, h: 540 };
          resBtn.innerHTML = `${ICONS.pixel} <span class="btn-label">RES: CRISP (540p)</span>`;
        } else {
          this.pixelMode = 'LO';
          this.internalRes = { w: 640, h: 360 };
          resBtn.innerHTML = `${ICONS.pixel} <span class="btn-label">RES: RETRO (360p)</span>`;
        }
        this.renderer.setSize(this.internalRes.w, this.internalRes.h, false);
        this.camera.aspect = this.internalRes.w / this.internalRes.h;
        this.camera.updateProjectionMatrix();
      });

      // Color picker buttons
      const colorBtns = document.querySelectorAll('.color-btn');
      colorBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          colorBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedColor = btn.dataset.color;
          this.updatePreviewCar();
          // Update player car if exists
          if (this.playerCar) {
            this.scene.remove(this.playerCar);
            this.playerCar = this.createRoadsterModel(this.selectedColor);
            this.scene.add(this.playerCar);
          }
        });
      });

      // Mobile Touch Controls
      this.initTouchControls();
    }

    initTouchControls() {
      const btnLeft = document.getElementById('btnSteerLeft');
      const btnRight = document.getElementById('btnSteerRight');
      const btnGas = document.getElementById('btnGasAction');
      const btnBrake = document.getElementById('btnBrakeAction');
      const btnJump = document.getElementById('btnJumpAction');
      const btnBoost = document.getElementById('btnBoostAction');

      const bindTouch = (elem, pressAction, releaseAction) => {
        if (!elem) return;
        const start = (e) => {
          e.preventDefault();
          this.sound.init();
          elem.classList.add('active');
          pressAction();
        };
        const end = (e) => {
          e.preventDefault();
          elem.classList.remove('active');
          releaseAction();
        };
        elem.addEventListener('touchstart', start, { passive: false });
        elem.addEventListener('touchend', end, { passive: false });
        elem.addEventListener('mousedown', start);
        elem.addEventListener('mouseup', end);
        elem.addEventListener('mouseleave', end);
      };

      bindTouch(btnLeft, () => { this.keys.left = true; }, () => { this.keys.left = false; });
      bindTouch(btnRight, () => { this.keys.right = true; }, () => { this.keys.right = false; });
      bindTouch(btnGas, () => { this.keys.up = true; }, () => { this.keys.up = false; });
      bindTouch(btnBrake, () => { this.keys.down = true; }, () => { this.keys.down = false; });
      bindTouch(btnJump, () => {
        this.keys.jump = true;
        this.triggerJump();
      }, () => {
        this.keys.jump = false;
      });
      bindTouch(btnBoost, () => {
        this.keys.boost = true;
      }, () => {
        this.keys.boost = false;
      });

      // Leaderboard Score Submission in Game Over Modal
      const submitBtn = document.getElementById('btnSubmitScore');
      const callsignInput = document.getElementById('driverCallsignInput');

      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          this.submitScoreToLeaderboard();
        });
      }

      if (callsignInput) {
        callsignInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.submitScoreToLeaderboard();
          }
        });
      }
    }

    // --- SERVER API ---
    async fetchServerHighScore() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (data && data.leaderboard && data.leaderboard.length > 0) {
            const top = data.leaderboard[0];
            if (top.score > this.highScore) {
              this.highScore = top.score;
              localStorage.setItem('nlex_racer_highscore', this.highScore);
              this.updateHud();
            }
          }
        }
      } catch (e) {}
    }

    async submitScoreToLeaderboard(customCallsign) {
      const submitBtn = document.getElementById('btnSubmitScore');
      const feedback = document.getElementById('submitFeedback');
      const input = document.getElementById('driverCallsignInput');

      let callsign = (customCallsign || (input ? input.value : '')).trim().toUpperCase();
      if (!callsign) callsign = 'PILOT_01';
      callsign = callsign.slice(0, 14);

      localStorage.setItem('nlex_pilot_callsign', callsign);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `SAVING...`;
      }

      try {
        const payload = {
          driver: callsign,
          score: Math.floor(this.score),
          distance_km: (this.distanceMeters / 1000).toFixed(2),
          top_speed: Math.floor(this.player.topSpeedKph),
          stage: CHECKPOINTS[this.currentCheckpointIdx].name
        };

        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const json = await res.json();
          const rank = json.rank || 1;
          this.sound.playCheckpointFanfare();
          if (feedback) {
            feedback.innerHTML = `&#10003; RECORD POSTED! YOU ARE RANK #${rank} IN THE HALL OF FAME!`;
          }
          if (submitBtn) {
            submitBtn.innerHTML = `&#10003; RANK #${rank}`;
            submitBtn.disabled = true;
          }
          if (input) input.disabled = true;
          this.showToast(`[HALL OF FAME] ${callsign} CONFIRMED AT RANK #${rank}!`, 2500);

          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('nlex_racer_highscore', this.highScore);
            const recElem = document.getElementById('goHighScore');
            if (recElem) recElem.textContent = Math.floor(this.highScore).toLocaleString() + ' (NEW RECORD!)';
          }
        } else {
          if (feedback) feedback.textContent = 'COULD NOT SUBMIT SCORE. TRY AGAIN!';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `POST SCORE`;
          }
        }
      } catch (e) {
        console.error('Failed to submit score:', e);
        if (feedback) feedback.textContent = 'SERVER TIMEOUT. CHECK CONNECTION!';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `POST SCORE`;
        }
      }
    }

    async submitHighScore(score, distKm) {
      try {
        const savedName = localStorage.getItem('nlex_pilot_callsign') || 'PILOT_01';
        await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: Math.floor(score),
            distance_km: distKm,
            driver: savedName,
            top_speed: Math.floor(this.player.topSpeedKph),
            stage: CHECKPOINTS[this.currentCheckpointIdx].name
          })
        });
      } catch (e) {}
    }

    // --- GAME LIFECYCLE ---
    startGame() {
      this.state = 'PLAYING';
      this.titleModal.classList.remove('active');
      this.gameOverModal.classList.remove('active');
      this.pauseModal.classList.remove('active');

      // Reset Player
      this.player.x = 0;
      this.player.z = 0;
      this.player.jumpY = 0;
      this.player.jumpVelocity = 0;
      this.player.isJumping = false;
      this.player.isBoosting = false;
      this.player.wasBoosting = false;
      this.player.spinAngle = 0;
      this.player.spinVelocity = 0;
      this.player.spinDirection = 'RIGHT';
      this.player.inWindDraft = false;
      this.player.windDraftTimer = 0;
      this.player.jumpCooldown = 0;
      this.player.windSource = null;
      this.player.suspensionSquash = 0;
      this.player.vx = 0;
      this.player.steerAngle = 0;
      this.player.speedKph = this.player.baseSpeedKph;
      this.player.boostEnergy = 100;
      this.player.lives = 3;
      this.player.invulnerableTimer = 0;
      this.player.topSpeedKph = this.player.baseSpeedKph;

      this.playerCar.position.set(0, 0, 0);
      this.playerCar.rotation.set(0, 0, 0);

      // Reset World & Lists
      this.distanceMeters = 0;
      this.score = 0;
      this.currentCheckpointIdx = 0;
      this.clearEntities();

      if (this.citySkylineBackdrop) {
        this.citySkylineBackdrop.position.z = 0;
      }

      this.obstacleSpawnDist = -40;
      this.collectibleSpawnDist = -60;

      this.buildRoadNetwork();
      this.applyCheckpointAtmosphere(CHECKPOINTS[0]);
      this.showCheckpointBanner(CHECKPOINTS[0]);
      this.showToast('[ROADSTER ONLINE] ENGAGE HYPERDRIVE!', 2000);
      this.updateHud();
    }

    triggerJump() {
      if (this.state !== 'PLAYING') return;
      const p = this.player;

      // 1. Anti-abuse Jump Cooldown
      if (p.jumpCooldown > 0) {
        this.showToast('[COOLDOWN] JUMP RECHARGING... PLEASE WAIT!', 700);
        return;
      }

      // 2. Must be on or near the road surface to launch
      if (p.jumpY > 0.18) return;

      // 3. WIND DRAFT LIMIT (Anti-Abuse): Must have caught an obstacle slipstream!
      const hasWind = p.inWindDraft || p.windDraftTimer > 0;
      if (!hasWind) {
        this.sound.playNoWindSputterSound();
        this.shakeIntensity = 0.14;
        this.showToast('[NO DRAFT] DRAFT BEHIND VEHICLES TO JUMP!', 1200);
        return;
      }

      // 4. Battery energy requirement
      if (p.boostEnergy < 20) {
        this.showToast('[LOW BATTERY] 20% ENERGY REQUIRED TO JUMP!', 800);
        return;
      }

      // Launch 360° Aero Wind Stunt Jump! (Apex ~5.0m, cleanly clearing 3.8m trucks without soaring excessively)
      p.isJumping = true;
      p.jumpVelocity = 18.0; // Calibrated launch velocity (apex peaks at ~5.06m)
      p.jumpY = 0.2;
      p.spinAngle = 0;
      p.inWindDraft = false;
      p.windDraftTimer = 0; // Consume the wind draft
      p.boostEnergy = Math.max(0, p.boostEnergy - 20); // Consumes 20% jump energy
      p.speedKph = Math.max(p.speedKph + 22, 160); // Clean forward propulsion to clear long trucks

      // Dynamic 360° Roll Direction: Right or Left based on input / trigger side
      let dirSign = -1; // -1 = Right roll (clockwise), +1 = Left roll (counter-clockwise)
      let dirName = 'RIGHT';

      if (this.keys.right && !this.keys.left) {
        dirSign = -1; // Steering right -> roll right
        dirName = 'RIGHT';
      } else if (this.keys.left && !this.keys.right) {
        dirSign = 1; // Steering left -> roll left
        dirName = 'LEFT';
      } else if (p.vx > 0.3) {
        dirSign = -1; // Moving right -> roll right
        dirName = 'RIGHT';
      } else if (p.vx < -0.3) {
        dirSign = 1; // Moving left -> roll left
        dirName = 'LEFT';
      } else if (p.x > 0.4) {
        dirSign = -1; // On right lane -> roll right
        dirName = 'RIGHT';
      } else if (p.x < -0.4) {
        dirSign = 1; // On left lane -> roll left
        dirName = 'LEFT';
      } else {
        // Centered on highway: alternate direction between jumps
        p.lastSpinDir = (p.lastSpinDir === -1) ? 1 : -1;
        dirSign = p.lastSpinDir;
        dirName = dirSign === -1 ? 'RIGHT' : 'LEFT';
      }

      p.lastSpinDir = dirSign;
      p.spinDirection = dirName;
      // Full 360° roll in 1.08s synchronized with airtime
      p.spinVelocity = dirSign * ((Math.PI * 2) / 1.08);

      this.sound.playJumpSound();
      this.sound.playWindCatchSound();
      this.spawnJumpBlast(p.x, p.z);
      this.spawnWindBlastParticles(p.x, p.z);
      this.shakeIntensity = 0.3;
      this.showToast(`[AERO LAUNCH] 360° ${dirName} STUNT ROLL!`, 1000);
      this.score += 150;
    }

    clearEntities() {
      this.obstacles.forEach((o) => {
        this.scene.remove(o.mesh);
        if (o.windMesh) this.scene.remove(o.windMesh);
      });
      this.obstacles = [];

      this.collectibles.forEach((c) => this.scene.remove(c.mesh));
      this.collectibles = [];

      this.particles.forEach((p) => this.scene.remove(p.mesh));
      this.particles = [];
    }

    pauseGame() {
      if (this.state !== 'PLAYING') return;
      this.state = 'PAUSED';
      this.sound.stopEngine();
      this.pauseModal.classList.add('active');
    }

    resumeGame() {
      if (this.state !== 'PAUSED') return;
      this.state = 'PLAYING';
      this.pauseModal.classList.remove('active');
      this.lastTime = performance.now();
    }

    showTitleScreen() {
      this.state = 'TITLE';
      this.sound.stopEngine();
      this.gameOverModal.classList.remove('active');
      this.pauseModal.classList.remove('active');
      this.titleModal.classList.add('active');
    }

    triggerGameOver() {
      this.state = 'GAMEOVER';
      this.sound.stopEngine();
      this.sound.playGameOverSound();
      this.shakeIntensity = 1.2;

      const isNew = this.score > this.highScore;
      if (isNew) {
        this.highScore = this.score;
        localStorage.setItem('nlex_racer_highscore', this.highScore);
        this.submitHighScore(this.score, this.distanceMeters / 1000);
      }

      document.getElementById('goScore').textContent = Math.floor(this.score).toLocaleString();
      document.getElementById('goDistance').textContent = (this.distanceMeters / 1000).toFixed(2) + ' KM';
      document.getElementById('goTopSpeed').textContent = Math.floor(this.player.topSpeedKph) + ' KPH';
      document.getElementById('goCheckpoint').textContent = CHECKPOINTS[this.currentCheckpointIdx].name;
      const recElem = document.getElementById('goHighScore');
      recElem.textContent = Math.floor(this.highScore).toLocaleString() + (isNew ? ' (NEW RECORD!)' : '');

      // Reset & prep Pilot Callsign submission form
      const callsignInput = document.getElementById('driverCallsignInput');
      const submitBtn = document.getElementById('btnSubmitScore');
      const feedback = document.getElementById('submitFeedback');
      if (callsignInput) {
        const savedName = localStorage.getItem('nlex_pilot_callsign') || 'PILOT_01';
        callsignInput.value = savedName;
        callsignInput.disabled = false;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<svg class="game-icon sm" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/></svg> POST SCORE`;
      }
      if (feedback) {
        feedback.textContent = '';
      }

      this.gameOverModal.classList.add('active');
      this.updateHud();
    }

    showCheckpointBanner(cp) {
      const banner = this.checkpointBanner;
      banner.querySelector('.banner-badge').textContent = `STAGE ${cp.id}`;
      banner.querySelector('.banner-text').textContent = `${cp.name} - ${cp.sub}`;
      banner.classList.add('show');
      this.sound.playCheckpointFanfare();

      setTimeout(() => banner.classList.remove('show'), 3500);
    }

    showToast(text, duration = 1800) {
      this.toastMessage.textContent = text;
      this.toastMessage.classList.add('show');
      setTimeout(() => this.toastMessage.classList.remove('show'), duration);
    }

    applyCheckpointAtmosphere(cp) {
      this.scene.background.set(cp.skyColor);
      this.scene.fog.color.set(cp.fogColor);
      this.scene.fog.density = cp.fogDensity;
      this.sunLight.color.set(cp.lightColor);
      this.materials.grass.color.set(cp.grassColor);
      this.materials.asphalt.color.set(cp.roadColor);
      this.materials.stripeYellow.color.set(cp.stripeColor);
    }

    // --- GAME LOOP & UPDATES ---
    gameLoop(timestamp) {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      // Rotate preview car in Title Screen
      if (this.state === 'TITLE' && this.previewCarMesh) {
        this.previewCarMesh.rotation.y += 0.015;
        this.previewRenderer.render(this.previewScene, this.previewCamera);
      }

      // Render 3D Scene
      this.render();
      requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
      const p = this.player;
      const distanceKm = this.distanceMeters / 1000;

      // Checkpoint progression
      if (
        this.currentCheckpointIdx < CHECKPOINTS.length - 1 &&
        distanceKm >= CHECKPOINTS[this.currentCheckpointIdx + 1].distKm
      ) {
        this.currentCheckpointIdx++;
        const cp = CHECKPOINTS[this.currentCheckpointIdx];
        this.applyCheckpointAtmosphere(cp);
        this.showCheckpointBanner(cp);
        this.score += 1000;
      }

      // Difficulty speed progression
      const targetBaseSpeed = p.baseSpeedKph + Math.min(distanceKm * 4.5, 45);

      // Jump cooldown decay
      if (p.jumpCooldown > 0) {
        p.jumpCooldown -= dt;
      }

      // Check proximity to all obstacle wind slipstream zones
      let detectedWind = false;
      let detectedSource = null;
      for (const obs of this.obstacles) {
        if (obs.isCrashed) continue; // Crashing or flipped vehicles do not provide slipstream
        // Player approaches from behind (p.z > obs.z, heading into negative Z)
        const distZ = p.z - obs.z;
        const distX = Math.abs(p.x - obs.x);
        const minZ = obs.length * 0.5 + 1.0;
        const maxZ = obs.length * 0.5 + 26.0;
        const windWidth = Math.max(2.6, obs.width + 1.2);

        if (distZ >= minZ && distZ <= maxZ && distX <= windWidth * 0.5) {
          detectedWind = true;
          detectedSource = obs.type;
          if (Math.random() < 0.4) {
            this.spawnWindStreamParticles(p.x, p.z);
          }
          break;
        }
      }

      if (detectedWind) {
        if (!p.inWindDraft && p.windDraftTimer <= 0) {
          this.sound.playWindCatchSound();
          this.showToast('[SLIPSTREAM LOCKED] SPACEBAR TO LAUNCH!', 800);
        }
        p.inWindDraft = true;
        p.windDraftTimer = 0.55; // 0.55s grace period
        p.windSource = detectedSource;
        p.speedKph += 6.0 * dt; // Aerodynamic slipstream draft speed boost!
      } else {
        if (p.windDraftTimer > 0) {
          p.windDraftTimer -= dt;
          if (p.windDraftTimer <= 0) {
            p.inWindDraft = false;
            p.windSource = null;
          }
        } else {
          p.inWindDraft = false;
        }
      }

      // Rocket Thruster Jump Physics & 360° Stunt Spin (Snappy ~5.0m apex cleanly clearing trucks)
      if (p.isJumping || p.jumpY > 0) {
        const gravity = 32.0; // Responsive arcade gravity (clean ~5.06m apex with tight clearance)
        p.jumpVelocity -= gravity * dt;
        p.jumpY += p.jumpVelocity * dt;

        // 360° Aerial Stunt Roll progression
        p.spinAngle += p.spinVelocity * dt;

        // Downward cold-gas thruster plasma particles and swirling spiral stunt sparks (throttled to 20Hz for zero lag)
        p.thrusterParticleTimer = (p.thrusterParticleTimer || 0) + dt;
        if (p.thrusterParticleTimer >= 0.05) {
          p.thrusterParticleTimer = 0;
          this.spawnColdGasParticles(p.x, p.z, p.jumpY);
          this.spawnSpiralThrusterParticles(p.x, p.jumpY, p.z, p.spinAngle);
        }

        // Touchdown / Landing back onto road surface
        if (p.jumpY <= 0) {
          p.jumpY = 0;
          p.jumpVelocity = 0;
          p.isJumping = false;
          p.spinAngle = 0;
          p.suspensionSquash = -0.24; // Landing shock absorption compression
          p.jumpCooldown = 0.75; // Cooldown after landing to prevent spamming
          
          this.sound.playLandingSound();
          this.spawnTouchdownDust(p.x, p.z);
          this.shakeIntensity = Math.max(this.shakeIntensity, 0.32);
          this.showToast(`[CLEAN LANDING] 360° ${p.spinDirection} ROLL! +250 PTS`, 900);
          this.score += 250;
        }
      }

      // Nitro Boost (SHIFT Key or Mobile Boost Button)
      if (this.keys.boost && p.boostEnergy > 0) {
        p.isBoosting = true;
        p.boostEnergy = Math.max(0, p.boostEnergy - 28 * dt);
        p.speedKph += (p.boostSpeedKph - p.speedKph) * 4.5 * dt;
        this.spawnBoostParticles();
        this.shakeIntensity = Math.max(this.shakeIntensity, 0.12);

        if (!p.wasBoosting) {
          p.wasBoosting = true;
          this.sound.playBoostSound();
          this.showToast('[NITRO ACTIVE] HIGH-SPEED BOOST ENGAGED!', 800);
        }
      } else {
        p.isBoosting = false;
        p.wasBoosting = false;
        // Natural recharge when not boosting
        if (!p.isJumping) {
          p.boostEnergy = Math.min(100, p.boostEnergy + 16 * dt);
        }

        // Throttle & Brake controls
        if (this.keys.up) {
          p.speedKph += (p.maxSpeedKph - p.speedKph) * 3.5 * dt;
        } else if (this.keys.down) {
          p.speedKph += (40 - p.speedKph) * 5.5 * dt;
        } else {
          p.speedKph += (targetBaseSpeed - p.speedKph) * 2 * dt;
        }
      }

      // Rebound suspension spring oscillation
      if (Math.abs(p.suspensionSquash) > 0.001) {
        p.suspensionSquash += (0 - p.suspensionSquash) * 14.0 * dt;
      } else {
        p.suspensionSquash = 0;
      }

      if (p.speedKph > p.topSpeedKph) p.topSpeedKph = p.speedKph;

      // Engine Audio
      const speedRatio = (p.speedKph - 40) / (p.boostSpeedKph - 40);
      this.sound.updateEngine(speedRatio, p.isJumping);

      // Distance & Z movement (Forward in negative Z)
      const forwardUnitsPerSec = (p.speedKph / 3.6) * 1.5;
      const stepUnits = forwardUnitsPerSec * dt;
      p.z -= stepUnits;
      this.distanceMeters += (p.speedKph / 3600) * 1000 * dt;
      this.score += (p.isJumping ? 2.0 : 1.0) * (p.speedKph * 0.12) * dt * 10;

      // Steering
      let steerInput = 0;
      if (this.keys.left) steerInput -= 1;
      if (this.keys.right) steerInput += 1;

      const steerAccel = steerInput * p.maxSteerSpeed * (p.isJumping ? 1.15 : 1.0);
      p.vx += (steerAccel - p.vx) * 12 * dt;
      p.x += p.vx * dt;
      p.steerAngle = (p.vx / p.maxSteerSpeed) * 0.28;

      // Road bounds check
      const maxRoadX = ROAD_WIDTH / 2 - 1.2;
      if (p.x < -maxRoadX) {
        p.x = -maxRoadX;
        p.vx = 0;
        p.speedKph = Math.max(35, p.speedKph - 60 * dt);
      } else if (p.x > maxRoadX) {
        p.x = maxRoadX;
        p.vx = 0;
        p.speedKph = Math.max(35, p.speedKph - 60 * dt);
      }

      // Invulnerability Timer
      if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;

      // Update 3D Player Roadster Mesh (with jump altitude, dynamic pitch, & 360° stunt spin)
      const currentY = Math.max(0, p.jumpY + p.suspensionSquash);
      this.playerCar.position.set(p.x, currentY, p.z);
      
      // Dynamic pitch: nose up on ascent, nose down on descent, level on pavement
      let jumpPitch = 0;
      if (p.jumpY > 0.05) {
        jumpPitch = -(p.jumpVelocity / 14.5) * 0.16;
      }
      this.playerCar.rotation.x = jumpPitch;
      this.playerCar.rotation.y = -p.steerAngle * 0.45;

      // 360° AERIAL STUNT ROLL!
      if (p.isJumping || p.jumpY > 0.05) {
        this.playerCar.rotation.z = p.spinAngle;
      } else {
        this.playerCar.rotation.z = -p.steerAngle * 0.35;
      }

      // Wheel animation
      if (this.playerCar.userData.wheels) {
        const wheelRotSpeed = forwardUnitsPerSec * 4 * dt;
        this.playerCar.userData.wheels.forEach((w) => {
          w.group.children[0].rotation.x += wheelRotSpeed;
          if (w.isFront) {
            w.group.rotation.y = -p.steerAngle * 1.4;
          }
        });
      }

      // Downward Cold-Gas Plasma Thruster Jets Animation
      if (this.playerCar.userData.downwardJets) {
        const isAirborne = p.jumpY > 0.08 || p.jumpVelocity > 0;
        this.playerCar.userData.downwardJets.forEach((jet) => {
          jet.visible = isAirborne;
          if (isAirborne) {
            const pulse = 0.9 + Math.random() * 0.35;
            const jetLength = Math.max(0.6, p.jumpY * 0.85);
            jet.scale.set(pulse, jetLength * pulse, pulse);
          }
        });
      }

      // Rear boost flames
      if (this.playerCar.userData.flames) {
        const flameActive = p.isJumping || p.jumpVelocity > 3.0 || p.speedKph > 140;
        this.playerCar.userData.flames.forEach((f) => {
          f.visible = flameActive;
          if (flameActive) {
            f.scale.set(1.0, 0.8 + Math.random() * 0.5, 1.0);
          }
        });
      }

      // Ground blast reflection ring
      if (this.playerCar.userData.underglow) {
        const ug = this.playerCar.userData.underglow;
        if (p.jumpY > 0.05) {
          ug.position.y = 0.03 - currentY; // Keep anchored right at the road surface!
          const blastScale = 1.2 + (p.jumpY / 4.4) * 0.55 + Math.random() * 0.15;
          ug.scale.set(blastScale, blastScale, 1);
          ug.material.color.set(0x00f0ff);
          ug.material.opacity = Math.max(0.18, 0.75 - (p.jumpY / 4.4) * 0.4);
        } else {
          ug.position.y = 0.04;
          ug.scale.set(1, 1, 1);
          ug.material.opacity = 0.45;
        }
      }

      // Recycle Road Chunks Ahead
      this.updateRoadChunks(p.z);

      // Update Entities
      this.updateObstacles(dt, p.z);
      this.updateCollectibles(dt, p.z);
      this.updateParticles(dt);

      // Screen Shake Decay
      if (this.shakeIntensity > 0) {
        this.shakeIntensity = Math.max(0, this.shakeIntensity - 2.5 * dt);
      }

      // Camera Follow
      this.updateCamera(dt);

      // HUD
      this.updateHud();
    }

    updateCamera(dt) {
      const p = this.player;
      // Target camera position behind the car (tracks jump smoothly)
      const targetCamX = p.x * 0.65;
      const targetCamZ = p.z + 8.5;
      const targetCamY = 3.6 + Math.max(0, p.jumpY * 0.28);

      this.camera.position.x += (targetCamX - this.camera.position.x) * 10 * dt;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 15 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 8 * dt;

      // Apply screen shake
      if (this.shakeIntensity > 0) {
        this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
        this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      }

      this.camera.lookAt(p.x * 0.85, 1.2 + Math.max(0, p.jumpY * 0.3), p.z - 12);
      this.camera.rotation.z = -p.steerAngle * 0.35;

      // Dynamic Jump & Boost FOV expansion
      const targetFov = p.isBoosting ? 74 : (p.isJumping ? 72 : 60);
      this.camera.fov += (targetFov - this.camera.fov) * 5 * dt;
      this.camera.updateProjectionMatrix();

      // City skyline backdrop follow along Z so buildings stay in distant horizon
      if (this.citySkylineBackdrop) {
        this.citySkylineBackdrop.position.z = p.z;
      }
    }

    updateRoadChunks(playerZ) {
      // Find the furthest forward chunk
      let minChunkZ = 0;
      this.roadChunks.forEach((chunk) => {
        if (chunk.group.position.z < minChunkZ) minChunkZ = chunk.group.position.z;
      });

      // If a chunk is far behind the player camera, recycle it to the front
      this.roadChunks.forEach((chunk) => {
        if (chunk.group.position.z > playerZ + CHUNK_LENGTH + 20) {
          chunk.group.position.z = minChunkZ - CHUNK_LENGTH;
        }
      });
    }

    updateObstacles(dt, playerZ) {
      // Spawn new obstacles ahead
      if (playerZ < this.obstacleSpawnDist) {
        const gap = 35 + Math.random() * 25;
        this.obstacleSpawnDist = playerZ - gap;
        this.obstacles.push(this.createObstacle(playerZ - 130));
      }

      // Move obstacles & test collision
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];

        if (obs.isCrashed) {
          // --- FULL 3D CRASH DYNAMICS & ANIMATION ---
          obs.crashTimer += dt;

          // Apply ballistic linear motion
          obs.x += obs.vx * dt;
          obs.y = (obs.y || 0) + obs.vy * dt;
          obs.z += obs.vz * dt;

          // Gravity pull down to asphalt
          obs.vy -= 26.0 * dt;

          // Road Pavement Collision & Skid Bouncing
          if (obs.y <= 0) {
            obs.y = 0;
            if (Math.abs(obs.vy) > 2.0) {
              obs.vy = -obs.vy * 0.38; // Bounce with restitution loss
              this.spawnSkidSparks(obs.x, obs.z, 16);
            } else {
              obs.vy = 0;
            }

            // High road friction deceleration
            obs.vx *= Math.max(0, 1 - 2.8 * dt);
            obs.vz *= Math.max(0, 1 - 2.5 * dt);
            obs.rotVx *= Math.max(0, 1 - 3.2 * dt);
            obs.rotVy *= Math.max(0, 1 - 2.8 * dt);
            obs.rotVz *= Math.max(0, 1 - 3.2 * dt);
          }

          // Highway Guardrail / Shoulder Deflection (lanes span ~8m)
          if (Math.abs(obs.x) > 8.0) {
            obs.vx = -obs.vx * 0.55;
            obs.x = Math.sign(obs.x) * 8.0;
            this.spawnSkidSparks(obs.x, obs.z, 22);
          }

          // Apply 3D tumbling, spinning and barrel rolling
          obs.mesh.rotation.x += obs.rotVx * dt;
          obs.mesh.rotation.y += obs.rotVy * dt;
          obs.mesh.rotation.z += obs.rotVz * dt;

          obs.mesh.position.set(obs.x, obs.y, obs.z);

          // Billowing crash smoke while skidding (throttled to prevent frame stutter)
          if (obs.crashTimer < 2.0 && Math.random() < 0.18) {
            this.spawnCrashTrailSmoke(obs.x, obs.y + 0.6, obs.z);
          }
        } else {
          // Move obstacle along road (forward in negative Z)
          const forwardSpeed = (obs.speedKph / 3.6) * 1.5;
          obs.z -= forwardSpeed * dt;
          obs.mesh.position.z = obs.z;

          // Commuter van weaving drift
          if (obs.type === 'van') {
            obs.driftTimer += dt;
            obs.x += Math.sin(obs.driftTimer * 1.8) * 0.5 * dt;
            obs.mesh.position.x = obs.x;
          }

          // Update animated wind stream position and chevrons
          if (obs.windMesh) {
            obs.windMesh.position.z = obs.z + obs.length * 0.5 + 11.0;
            obs.windMesh.position.x = obs.x;
            this.animateWindStream(obs.windMesh, dt);
          }
        }

        // Collision Check with Player (only if obstacle has not crashed yet)
        if (this.player.invulnerableTimer <= 0 && !obs.isCrashed) {
          const dx = Math.abs(this.player.x - obs.x);
          const dz = Math.abs(this.player.z - obs.z);

          let obsName = 'HAZARD';
          let bonus = 400;
          if (obs.type === 'truck') {
            obsName = '18-WHEELER RIG';
            bonus = 800;
          } else if (obs.type === 'bus') {
            obsName = 'EXPRESS BUS';
            bonus = 700;
          } else if (obs.type === 'van') {
            obsName = 'COMMUTER VAN';
            bonus = 500;
          } else if (obs.type === 'barrier') {
            obsName = 'HAZARD BARRICADE';
            bonus = 400;
          } else if (obs.type === 'boulder') {
            obsName = 'HIGHWAY DEBRIS';
            bonus = 600;
          }

          // If car is jumping or airborne, player cleanly leaps over vehicles and obstacles!
          if (this.player.isJumping || this.player.jumpY > 0.15) {
            const obsHeight = obs.type === 'truck' ? 3.8 : (obs.type === 'bus' ? 3.4 : (obs.type === 'van' ? 2.4 : 2.0));
            // Gentle safety cushion: prevents scraping without jerky snapping or bouncing
            if (dx < (obs.width + 2.0) * 0.5 && dz < (obs.length + 3.8) * 0.5) {
              const minClearance = obsHeight + 0.55; // Clean 0.55m air margin over roof
              if (this.player.jumpY < minClearance) {
                this.player.jumpY = minClearance;
                if (this.player.jumpVelocity < 0) this.player.jumpVelocity = 0; // Prevent sinking into roof
              }
            }

            if (dx < (obs.width + 2.0) * 0.5 && dz < (obs.length + 3.8) * 0.5 && !obs.hasJumpedOver) {
              obs.hasJumpedOver = true;
              this.score += bonus;
              this.sound.playCheckpointFanfare();
              this.showToast(`[360° ${this.player.spinDirection} OVER ${obsName}] +${bonus} PTS`, 1200);
            }
          } else if (dx < (obs.width + 1.8) * 0.42 && dz < (obs.length + 3.8) * 0.42) {
            this.handlePlayerCollision(obs, obsName);
          }
        }

        // Remove if far behind
        if (obs.z > playerZ + 45) {
          this.scene.remove(obs.mesh);
          if (obs.windMesh) this.scene.remove(obs.windMesh);
          this.obstacles.splice(i, 1);
        }
      }
    }

    updateCollectibles(dt, playerZ) {
      if (playerZ < this.collectibleSpawnDist) {
        this.collectibleSpawnDist = playerZ - (45 + Math.random() * 35);
        this.collectibles.push(this.createCollectible(playerZ - 120));
      }

      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const item = this.collectibles[i];
        item.mesh.rotation.y += item.rotSpeed * dt;

        // Collision check
        const dx = Math.abs(this.player.x - item.x);
        const dz = Math.abs(this.player.z - item.z);
        if (dx < 1.6 && dz < 2.2) {
          if (item.type === 'battery') {
            this.player.boostEnergy = Math.min(100, this.player.boostEnergy + 35);
            this.score += 250;
            this.sound.playBatteryPickup();
            this.showToast('+35% HYPERCELL ENERGY!', 1200);
            this.spawnPickupParticles(item.x, item.z, 0x00f0ff);
          } else {
            this.score += 600;
            this.player.boostEnergy = 100;
            this.sound.playBatteryPickup();
            this.showToast('[RFID TOKEN] TOLL PASS! +600 PTS', 1600);
            this.spawnPickupParticles(item.x, item.z, 0xffd700);
          }
          this.scene.remove(item.mesh);
          this.collectibles.splice(i, 1);
          continue;
        }

        if (item.z > playerZ + 30) {
          this.scene.remove(item.mesh);
          this.collectibles.splice(i, 1);
        }
      }
    }

    handlePlayerCollision(obs, obsName) {
      this.sound.playCrashSound();
      this.sound.playMetalImpact();
      this.shakeIntensity = 1.2;
      this.player.lives -= 1;
      this.player.invulnerableTimer = 1.6;
      this.player.speedKph = Math.max(35, this.player.speedKph * 0.42);

      // Player car physical jolt & spin from crash
      const playerSpinDir = this.player.x > obs.x ? 1 : -1;
      this.player.spinVelocity = playerSpinDir * 9.0;
      this.player.jumpY = 0.35;
      this.player.jumpVelocity = 2.8;

      // Trigger the vehicle's full crash animation!
      if (obs) {
        this.triggerObstacleCrash(obs, obsName);
      }

      // Player crash particles
      this.spawnCrashParticles(this.player.x, this.player.z);

      // Dynamic Crash Toast
      let crashMsg = 'CRASH!';
      if (obs && obs.type === 'truck') {
        crashMsg = '[PILEUP] 18-WHEELER TUMBLED!';
      } else if (obs && obs.type === 'bus') {
        crashMsg = '[CRASH] EXPRESS BUS SPUN OUT!';
      } else if (obs && obs.type === 'van') {
        crashMsg = '[TURNOVER] COMMUTER VAN FLIPPED!';
      } else if (obs && obs.type === 'barrier') {
        crashMsg = '[IMPACT] BARRICADE SHATTERED!';
      } else if (obs && obs.type === 'boulder') {
        crashMsg = '[IMPACT] GRANITE BOULDER SHATTERED!';
      }

      if (this.player.lives > 0) {
        this.showToast(`${crashMsg} (${this.player.lives} BATTERIES LEFT)`, 1500);
      } else {
        this.showToast(`${crashMsg} ROADSTER CRITICAL DAMAGE!`, 1800);
        this.triggerGameOver();
      }
    }

    triggerObstacleCrash(obs, obsName) {
      obs.isCrashed = true;
      obs.hasCrashed = true;
      obs.crashTimer = 0;
      obs.y = obs.mesh.position.y || 0;

      // Hide wind slipstream immediately
      if (obs.windMesh) {
        obs.windMesh.visible = false;
      }

      // Lateral impact direction: pushed violently away from player's center
      const lateralDir = (obs.x >= this.player.x) ? 1 : -1;
      const boostMultiplier = this.player.isBoosting ? 1.7 : 1.0;
      const playerForwardSpeed = (this.player.speedKph / 3.6);

      // 3D Physical Velocities for the vehicle crash:
      obs.vx = lateralDir * (7.5 + Math.random() * 6.5) * boostMultiplier;
      obs.vy = (4.0 + Math.random() * 4.5) * boostMultiplier;
      // Hurled forward down the highway
      obs.vz = -Math.max(14, playerForwardSpeed * 0.7 + Math.random() * 8.0) * boostMultiplier;

      // Dynamic Angular Tumbling / Rolling / Spinning
      obs.rotVx = (Math.random() > 0.5 ? 1 : -1) * (3.5 + Math.random() * 5.0) * boostMultiplier;
      obs.rotVy = lateralDir * (9.0 + Math.random() * 7.0) * boostMultiplier; // Rapid spinout
      obs.rotVz = lateralDir * (5.5 + Math.random() * 6.0) * boostMultiplier; // Sideways roll / flip

      // Spawn multi-layer crash explosion & debris
      this.spawnVehicleCrashExplosion(obs.x, obs.z, obs.type);
    }

    // --- 3D PARTICLE SYSTEMS (Zero-GC Shared Geometries & Materials Pool) ---
    spawnColdGasParticles(x, z, hoverY) {
      if (this.particles.length > 70) return;
      for (const nozOffset of [
        { x: -0.65, z: -1.2 },
        { x: 0.65, z: -1.2 },
        { x: -0.65, z: 1.2 },
        { x: 0.65, z: 1.2 }
      ]) {
        if (Math.random() < 0.5) {
          const mat = Math.random() > 0.5 ? this.sharedMat.cyan : this.sharedMat.white;
          const mesh = new THREE.Mesh(this.sharedGeo.small, mat);
          mesh.position.set(x + nozOffset.x, 0.05, z + nozOffset.z);
          this.scene.add(mesh);

          const blastAngle = Math.random() * Math.PI * 2;
          const blastSpeed = 3.5 + Math.random() * 6.0;
          this.particles.push({
            mesh,
            vx: Math.cos(blastAngle) * blastSpeed,
            vy: 0.3 + Math.random() * 1.5,
            vz: Math.sin(blastAngle) * blastSpeed,
            life: 0.2,
            maxLife: 0.2
          });
        }
      }

      // Outward pavement dust cloud
      if (Math.random() < 0.35) {
        const dMesh = new THREE.Mesh(this.sharedGeo.med, this.sharedMat.dust);
        dMesh.position.set(x + (Math.random() - 0.5) * 1.6, 0.08, z + (Math.random() - 0.5) * 2.2);
        this.scene.add(dMesh);

        this.particles.push({
          mesh: dMesh,
          vx: (Math.random() - 0.5) * 5.0,
          vy: 0.2 + Math.random() * 0.7,
          vz: (Math.random() - 0.5) * 5.0,
          life: 0.28,
          maxLife: 0.28
        });
      }
    }

    spawnSpiralThrusterParticles(x, y, z, spinAngle) {
      if (this.particles.length > 70 || Math.random() > 0.45) return;
      const mat = Math.random() > 0.5 ? this.sharedMat.cyan : this.sharedMat.white;
      const mesh = new THREE.Mesh(this.sharedGeo.small, mat);
      
      const radius = 1.1;
      const pX = x + Math.cos(spinAngle) * radius;
      const pY = y + Math.sin(spinAngle) * radius;
      mesh.position.set(pX, Math.max(0.2, pY), z + 1.2);
      this.scene.add(mesh);

      const spinSign = Math.sign(this.player.spinVelocity) || 1;
      this.particles.push({
        mesh,
        vx: Math.cos(spinAngle + (Math.PI / 2) * spinSign) * 3.8,
        vy: Math.sin(spinAngle + (Math.PI / 2) * spinSign) * 3.8,
        vz: 4.0 + Math.random() * 4.0,
        life: 0.24,
        maxLife: 0.24
      });
    }

    spawnJumpBlast(x, z) {
      for (let i = 0; i < 14; i++) {
        const mat = i % 2 === 0 ? this.sharedMat.cyan : this.sharedMat.white;
        const mesh = new THREE.Mesh(this.sharedGeo.small, mat);
        mesh.position.set(x + (Math.random() - 0.5) * 1.4, 0.12, z + (Math.random() - 0.5) * 2.2);
        this.scene.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        const spd = 5.0 + Math.random() * 6.5;
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: 0.6 + Math.random() * 1.8,
          vz: Math.sin(angle) * spd,
          life: 0.3,
          maxLife: 0.3
        });
      }
    }

    spawnTouchdownDust(x, z) {
      for (let i = 0; i < 10; i++) {
        const mesh = new THREE.Mesh(this.sharedGeo.small, this.sharedMat.dust);
        mesh.position.set(x + (Math.random() - 0.5) * 1.8, 0.1, z + (Math.random() - 0.5) * 2.6);
        this.scene.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        const spd = 2.5 + Math.random() * 4.5;
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: 0.4 + Math.random() * 1.2,
          vz: Math.sin(angle) * spd,
          life: 0.3,
          maxLife: 0.3
        });
      }
    }

    spawnWindStreamParticles(x, z) {
      if (this.particles.length > 70) return;
      const mesh = new THREE.Mesh(this.sharedGeo.streak, this.sharedMat.wind);
      mesh.position.set(x + (Math.random() - 0.5) * 2.0, 0.35 + Math.random() * 0.7, z + (Math.random() - 0.5) * 3.0);
      this.scene.add(mesh);

      this.particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 0.2 + Math.random() * 0.5,
        vz: -20.0 - Math.random() * 6.0,
        life: 0.18,
        maxLife: 0.18
      });
    }

    spawnWindBlastParticles(x, z) {
      for (let i = 0; i < 12; i++) {
        const mat = i % 2 === 0 ? this.sharedMat.cyan : this.sharedMat.white;
        const mesh = new THREE.Mesh(this.sharedGeo.small, mat);
        mesh.position.set(x, 0.3, z);
        this.scene.add(mesh);

        const angle = (i / 12) * Math.PI * 2;
        const spd = 6.0 + Math.random() * 6.0;
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: 1.2 + Math.random() * 3.0,
          vz: Math.sin(angle) * spd,
          life: 0.32,
          maxLife: 0.32
        });
      }
    }

    spawnBoostParticles() {
      if (this.particles.length > 70) return;
      const p = this.player;
      const mat = Math.random() > 0.5 ? this.sharedMat.cyan : this.sharedMat.white;
      const mesh = new THREE.Mesh(this.sharedGeo.small, mat);
      mesh.position.set(p.x + (Math.random() - 0.5) * 0.8, 0.35, p.z + 2.2);
      this.scene.add(mesh);

      this.particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2,
        vz: 7 + Math.random() * 6,
        life: 0.22,
        maxLife: 0.22
      });
    }

    spawnCrashParticles(x, z) {
      const mats = [this.sharedMat.red, this.sharedMat.orange, this.sharedMat.yellow, this.sharedMat.white];
      for (let i = 0; i < 14; i++) {
        const mat = mats[i % mats.length];
        const mesh = new THREE.Mesh(this.sharedGeo.med, mat);
        mesh.position.set(x, 0.6, z);

        const angle = Math.random() * Math.PI * 2;
        const spd = 5 + Math.random() * 9;
        this.scene.add(mesh);
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: 3 + Math.random() * 6,
          vz: Math.sin(angle) * spd,
          life: 0.42,
          maxLife: 0.42
        });
      }
    }

    spawnPickupParticles(x, z, colorKey) {
      const mat = (colorKey === 0xffd700) ? this.sharedMat.gold : this.sharedMat.cyan;
      for (let i = 0; i < 10; i++) {
        const mesh = new THREE.Mesh(this.sharedGeo.small, mat);
        mesh.position.set(x, 1.2, z);

        const angle = Math.random() * Math.PI * 2;
        const spd = 3.5 + Math.random() * 6;
        this.scene.add(mesh);
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: 1.8 + Math.random() * 4.5,
          vz: Math.sin(angle) * spd,
          life: 0.35,
          maxLife: 0.35
        });
      }
    }

    spawnVehicleCrashExplosion(x, z, type) {
      const debrisMats = [this.sharedMat.white, this.sharedMat.grey, this.sharedMat.smoke, this.sharedMat.orange];
      for (let i = 0; i < 16; i++) {
        const mat = debrisMats[i % debrisMats.length];
        const mesh = new THREE.Mesh(this.sharedGeo.med, mat);
        mesh.position.set(x + (Math.random() - 0.5) * 1.4, 0.8 + Math.random() * 1.0, z + (Math.random() - 0.5) * 1.8);
        this.scene.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        const spd = 5.0 + Math.random() * 8.0;
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: 2.5 + Math.random() * 6.0,
          vz: Math.sin(angle) * spd,
          life: 0.55,
          maxLife: 0.55
        });
      }

      const fireMats = [this.sharedMat.red, this.sharedMat.orange, this.sharedMat.yellow, this.sharedMat.white];
      for (let i = 0; i < 8; i++) {
        const mat = fireMats[i % fireMats.length];
        const mesh = new THREE.Mesh(this.sharedGeo.med, mat);
        mesh.position.set(x, 0.9, z);
        this.scene.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        const spd = 3.5 + Math.random() * 7.0;
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: 1.5 + Math.random() * 4.5,
          vz: Math.sin(angle) * spd,
          life: 0.38,
          maxLife: 0.38
        });
      }
    }

    spawnCrashTrailSmoke(x, y, z) {
      if (this.particles.length > 70) return;
      const mesh = new THREE.Mesh(this.sharedGeo.large, this.sharedMat.smoke);
      mesh.position.set(x + (Math.random() - 0.5) * 0.8, y + (Math.random() - 0.5) * 0.5, z + (Math.random() - 0.5) * 1.0);
      this.scene.add(mesh);

      this.particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 1.8,
        vy: 1.5 + Math.random() * 2.0,
        vz: (Math.random() - 0.5) * 1.8,
        life: 0.4,
        maxLife: 0.4
      });
    }

    spawnSkidSparks(x, z, intensity = 12) {
      if (this.particles.length > 70) return;
      for (let i = 0; i < 4; i++) {
        const mat = Math.random() > 0.5 ? this.sharedMat.gold : this.sharedMat.orange;
        const mesh = new THREE.Mesh(this.sharedGeo.tiny, mat);
        mesh.position.set(x + (Math.random() - 0.5) * 0.6, 0.08, z + (Math.random() - 0.5) * 1.0);
        this.scene.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        const spd = 2.5 + Math.random() * intensity;
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: 0.4 + Math.random() * 2.5,
          vz: Math.sin(angle) * spd,
          life: 0.2,
          maxLife: 0.2
        });
      }
    }

    updateParticles(dt) {
      const MAX_ACTIVE_PARTICLES = 75;
      while (this.particles.length > MAX_ACTIVE_PARTICLES) {
        const oldest = this.particles.shift();
        this.scene.remove(oldest.mesh);
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.mesh.position.x += pt.vx * dt;
        pt.mesh.position.y += pt.vy * dt;
        pt.mesh.position.z += pt.vz * dt;
        pt.vy -= 18 * dt; // gravity
        pt.life -= dt;
        if (pt.life <= 0) {
          this.scene.remove(pt.mesh);
          this.particles.splice(i, 1);
        }
      }
    }

    // --- HUD UPDATES ---
    updateHud() {
      this.hudScore.textContent = Math.floor(this.score).toString().padStart(6, '0');
      this.hudHighScore.textContent = Math.floor(this.highScore).toString().padStart(6, '0');
      this.hudDistance.textContent = (this.distanceMeters / 1000).toFixed(1) + ' KM';
      this.hudSpeed.textContent = Math.floor(this.player.speedKph) + ' KPH';
      if (this.player.isBoosting) {
        this.hudBoostPercent.textContent = `NITRO ${Math.floor(this.player.boostEnergy)}%`;
      } else if (this.player.isJumping || this.player.jumpY > 0.08) {
        this.hudBoostPercent.textContent = `AERO ${this.player.spinDirection || '360°'} ${this.player.jumpY.toFixed(1)}M (${Math.floor(this.player.boostEnergy)}%)`;
      } else {
        this.hudBoostPercent.textContent = Math.floor(this.player.boostEnergy) + '%';
      }

      const speedPct = Math.min(100, (this.player.speedKph / this.player.boostSpeedKph) * 100);
      this.speedBarFill.style.width = speedPct + '%';
      this.boostBarFill.style.width = this.player.boostEnergy + '%';

      this.healthCells.forEach((cell, idx) => {
        if (idx < this.player.lives) {
          cell.classList.add('active');
        } else {
          cell.classList.remove('active');
        }
      });

      // Wind Draft HUD Status Badge
      if (this.hudWindBox && (this.hudWindText || this.hudWindStatus)) {
        const targetTextElem = this.hudWindText || this.hudWindStatus;
        if (this.player.isJumping || this.player.jumpY > 0.08) {
          this.hudWindBox.classList.add('wind-active');
          targetTextElem.textContent = 'IN FLIGHT';
        } else if (this.player.inWindDraft || this.player.windDraftTimer > 0) {
          this.hudWindBox.classList.add('wind-active');
          targetTextElem.textContent = 'LOCKED!';
        } else if (this.player.jumpCooldown > 0) {
          this.hudWindBox.classList.remove('wind-active');
          targetTextElem.textContent = 'WAIT';
        } else {
          this.hudWindBox.classList.remove('wind-active');
          targetTextElem.textContent = 'NO DRAFT';
        }
      }

      // Mobile Touch Jump Button visual wind-ready indicator
      if (this.btnJumpAction) {
        if (this.player.inWindDraft || this.player.windDraftTimer > 0) {
          this.btnJumpAction.classList.add('wind-ready');
        } else {
          this.btnJumpAction.classList.remove('wind-ready');
        }
      }
    }

    // --- RENDER ---
    render() {
      // Invulnerability flicker
      if (this.player.invulnerableTimer > 0) {
        this.playerCar.visible = Math.floor(this.player.invulnerableTimer * 14) % 2 === 0;
      } else {
        this.playerCar.visible = true;
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  // Auto-start on load
  window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new PangasinanRoadster3D();
  });
})();
