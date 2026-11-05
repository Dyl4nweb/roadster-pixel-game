# ⚡ PANGASINAN ROADSTER 3D: Electric Drive sa Hilagang Luzon

A **fully 3D pixelated retro arcade driving game** built with **Python Flask**, **Three.js**, **HTML5 WebGL**, and **Vanilla JavaScript**.

The game features authentic **PS1-era / 3D pixel-art low-poly aesthetics**, combining 3D geometry, low internal resolution rendering with nearest-neighbor upscaling, atmospheric retro fog, procedural 3D environments, and dynamic lighting inspired by the scenic provincial landscapes of **Pangasinan, Philippines**.

---

## 🎮 3D Visual Direction & Aesthetics

- **Fully 3D, Not 2D**: Built entirely with Three.js 3D meshes, 3D procedural highway, 3D low-poly models, 3D third-person chase camera, and 3D lighting.
- **Authentic 3D Pixelation**:
  - The WebGL scene renders at an authentic low internal resolution (`320x240` PS1 mode or `480x360` 32-bit mode, togglable on-the-fly with the `🕹️ PIXEL: LO/HI` button).
  - The rendered canvas scales to the browser viewport using **nearest-neighbor filtering** (`image-rendering: pixelated; image-rendering: crisp-edges;`), producing crisp, faceted 3D pixel art edges without bilinear blur.
  - Procedural pixel textures with `THREE.NearestFilter`.
  - All 3D materials use `flatShading: true` for that iconic faceted retro look.
  - Atmospheric 3D exponential retro distance fog (`THREE.FogExp2`).
  - Optional retro CRT scanlines and curved glass vignette overlay.

---

## 🚗 The 3D Futuristic Electric Roadster

- **Angular Low-Poly Geometry**: Modeled with sharp, geometric facets inspired by the futuristic concept electric roadster from your reference image.
- **Continuous LED Daytime Running Light Bar**: A horizontal glowing light strip across the front hood edge and corner faceted LED headlights.
- **Panoramic Glass Canopy**: Low-slung tinted dark glass cockpit canopy with cyan specular sheen.
- **Aero Splitter & Cyber Taillights**: Dark lower front diffuser and a glowing full-width red rear LED light bar.
- **Dual Rear Boost Jets**: Active 3D plasma flame cones that ignite and flicker when boosting.
- **Color Selection**:
  - **Cyber Silver** (matching your reference photo)
  - **Electric Red**
  - **Neon Azure Blue**
  - **Lingayen Gold**
- **Dynamic 3D Animations**:
  - 4 spinning 3D low-poly alloy wheels.
  - Front wheels turn dynamically with steering angle.
  - Car body rolls and banks into curves.
  - Neon colored underglow plane illuminates the road surface.

---

## 🌴 Setting & 3D Environment (Pangasinan, Philippines)

- **Endless 3D Highway**: Multi-lane asphalt road with yellow and white center divider dashes, red-and-white provincial curbs, and dirt road shoulders.
- **3D Roadside Scenery**:
  - **Coconut Palm Trees (*Puno ng Niyog*)**: Segmented polygonal trunks with ring bark and green tropical fronds.
  - **Bahay Kubo (*Nipa Hut*)**: Traditional bamboo stilts, woven sawali walls, and steep peaked thatched nipa roofs.
  - **Sari-Sari Stores**: Mom-and-pop roadside stores with corrugated tin awnings, hanging snack bags, and red beverage coolers.
  - **Utility / Electric Poles**: Concrete highway power poles with crossarms.
  - **Distant Mountain Ranges**: Low-poly peaks on the horizon (Caraballo and Zambales mountains) with 3D parallax depth.
- **4 Location Checkpoints**:
  1. 🌾 **Pangasinan Rice Fields (0.0 - 1.5 km)**: Bright morning azure sky, lush emerald green palay paddies, and carabao carts.
  2. 🐟 **Dagupan Highway (1.5 - 3.5 km)**: Midday tropical sun, sari-sari stores, busy tricycles, jeepneys, and collectible **Golden Bangus**!
  3. 🌊 **Lingayen Coastal Road (3.5 - 6.0 km)**: Ocean breeze, sandy shores, rolling Lingayen Gulf waves, and traditional wooden fishing *bangkas*.
  4. 🌅 **Sunset Highway (6.0+ km)**: Fiery golden-hour sunset with purple mountains, glowing dusk fog, and twilight stars!

---

## 🚧 3D Obstacles & Collectibles

- **Philippine Tricycle**: 3D motorcycle with passenger sidecar cab that weaves smoothly within lanes.
- **Philippine Jeepney**: "King of the Road" with chrome grille, hood horses, banana roof cargo, and destination visor.
- **Carabao Cart (*Kariton*)**: 3D water buffalo hauling sacks of harvest rice.
- **Potholes (*Lubak-lubak*)**: Sunken 3D asphalt depressions with reflective puddles.
- **Road Construction Barriers**: 3D orange-and-white striped barricades.
- **3D Energy Cells (*Baterya*)**: Floating, rotating cyan battery cylinders that replenish 35% boost energy and grant +250 points.
- **3D Golden Bangus**: Rare Dagupan collectible awarding +600 points and 100% boost energy.

---

## 🕹️ Controls

| Action | Desktop Keyboard | Mobile Touchscreen |
| :--- | :--- | :--- |
| **Steer Left** | `A` or `Left Arrow` (◄) | Tap / Hold **◀** Button |
| **Steer Right** | `D` or `Right Arrow` (►) | Tap / Hold **▶** Button |
| **Accelerate** | `W` or `Up Arrow` (▲) | Tap / Hold **🏎️** Gas |
| **Brake / Reverse** | `S` or `Down Arrow` (▼) | Tap / Hold **🛑** Brake |
| **Activate Boost** | Hold `SPACEBAR` | Hold **⚡ BOOST** Button |
| **Restart Game** | `R` | Tap **🔄 ULITIN** |
| **Pause / Resume** | `P` or `ESC` | Tap Pause |

---

## 📁 Project Structure

```
Python Game/
│
├── app.py                  # Python Flask web server & High Score API
├── requirements.txt        # Flask dependency specification
├── README.md               # Game overview & instructions
│
├── templates/
│   └── index.html          # Three.js 3D viewport, HUD, arcade cabinet bezel, & modals
│
└── static/
    ├── three.min.js        # Self-contained Three.js library (no CDN dependency)
    ├── style.css           # 3D pixelated styling, nearest-neighbor CSS, CRT filters
    └── game.js             # 3D engine, low-poly procedural models, audio synthesizer
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Game Server
```bash
python app.py
```

### 3. Open in Browser
Navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

### 4. Deploy to Vercel (100% Free Cloud Hosting)
This project is configured with [`vercel.json`](file:///c:/Projects/Python%20Game/vercel.json) and [`api/index.py`](file:///c:/Projects/Python%20Game/api/index.py) for instant deployment:
1. Connect your GitHub repository on [Vercel.com](https://vercel.com).
2. Click **Deploy**. Vercel automatically deploys your game on a free HTTPS domain!
See [`DEPLOYMENT.md`](file:///c:/Projects/Python%20Game/DEPLOYMENT.md) for full instructions.

---

## 🏆 Credits
**Dylan Ramos created this game.**  
Built with Three.js WebGL, Vanilla JavaScript, and Python Flask.
