"""
Pangasinan Roadster: Tesla Cold-Gas Thruster 8-Second Cinematic Animation
Generates 9:16 Vertical Video (MP4) and Animated WebP/GIF using Pillow and imageio
"""

import os
import math
import random
from PIL import Image, ImageDraw
import imageio

# Video Configurations
FPS = 30
DURATION_SEC = 8
TOTAL_FRAMES = FPS * DURATION_SEC  # 240 frames

# Low-res pixel art buffer (16-bit retro resolution), upscaled 2x to 540x960 (9:16)
PIXEL_W = 270
PIXEL_H = 480
OUTPUT_W = 540
OUTPUT_H = 960

GROUND_Y = 320  # baseline tire contact height in pixel coordinates

# Car dimensions (Pixel-Art Roadster)
CAR_LEN = 138
CAR_H = 34

def draw_pixel_roadster(draw, cx, cy, hover_y_offset, wheel_rot, thruster_intensity, suspension_squash=0):
    """
    Draws the handcrafted 16-bit retro pixel-art red futuristic Roadster (side-view).
    Preserves exact body shape, proportions, color, lights, and underbody thruster ports.
    """
    # Car base position with hover offset and suspension compression
    x0 = int(cx - CAR_LEN // 2)
    y0 = int(cy - CAR_H + hover_y_offset + suspension_squash)

    # 1. Glowing Blue Underbody Thruster Blast (if thrusters are firing)
    if thruster_intensity > 0.05:
        # Lower body reflection
        glow_color = (
            int(50 * thruster_intensity),
            int(180 * thruster_intensity),
            int(255 * thruster_intensity),
            int(120 * thruster_intensity)
        )
        # Ground blast impact circle on road
        blast_w = int(thruster_intensity * 80)
        ground_glow_y = GROUND_Y
        for r in range(blast_w, 0, -8):
            alpha = int((1 - r / blast_w) * thruster_intensity * 180)
            col = (0, 200, 255) if r < blast_w * 0.5 else (0, 100, 220)
            draw.ellipse([cx - r, ground_glow_y - 4, cx + r, ground_glow_y + 8], outline=col)

        # Dual underbody cold-gas plasma jets (Front & Rear thrusters)
        thruster_x_offsets = [-32, 28]  # Front and rear cold-gas nozzles
        for tx in thruster_x_offsets:
            noz_x = cx + tx
            noz_y = y0 + CAR_H - 4
            target_y = GROUND_Y

            jet_len = target_y - noz_y
            # Plasma jet outer cone
            spread = int(4 + 8 * thruster_intensity)
            jet_poly = [
                (noz_x - 3, noz_y),
                (noz_x + 3, noz_y),
                (noz_x + spread + random.randint(-2, 2), noz_y + jet_len),
                (noz_x - spread + random.randint(-2, 2), noz_y + jet_len)
            ]
            draw.polygon(jet_poly, fill=(0, 140, 255))

            # Inner bright plasma core
            core_spread = int(2 + 4 * thruster_intensity)
            core_poly = [
                (noz_x - 1, noz_y),
                (noz_x + 1, noz_y),
                (noz_x + core_spread, noz_y + int(jet_len * 0.8)),
                (noz_x - core_spread, noz_y + int(jet_len * 0.8))
            ]
            draw.polygon(core_poly, fill=(180, 240, 255))

            # Pure white throat nozzle flare
            draw.line([(noz_x - 3, noz_y), (noz_x + 3, noz_y)], fill=(255, 255, 255), width=2)

    # 2. Lower Chassis Dark Skirt / Carbon Diffuser
    draw.rectangle([x0 + 12, y0 + CAR_H - 6, x0 + CAR_LEN - 12, y0 + CAR_H - 1], fill=(22, 24, 28))
    # Cold-gas thruster nozzle ports (metallic dark chrome)
    draw.rectangle([cx - 35, y0 + CAR_H - 5, cx - 29, y0 + CAR_H - 2], fill=(60, 70, 85))
    draw.rectangle([cx + 25, y0 + CAR_H - 5, cx + 31, y0 + CAR_H - 2], fill=(60, 70, 85))

    # 3. Main Aerodynamic Red Body (Sculpted low-slung Roadster silhouette)
    red_main = (225, 25, 45)
    red_shadow = (165, 12, 28)
    red_highlight = (255, 90, 105)
    outline = (16, 16, 20)

    # Lower body sill
    draw.rectangle([x0 + 10, y0 + CAR_H - 14, x0 + CAR_LEN - 8, y0 + CAR_H - 6], fill=red_shadow)
    # Mid body block
    draw.rectangle([x0 + 8, y0 + CAR_H - 22, x0 + CAR_LEN - 6, y0 + CAR_H - 14], fill=red_main)
    # Upper hood and rear deck
    draw.polygon([
        (x0 + 6, y0 + CAR_H - 14),   # Front nose tip
        (x0 + 14, y0 + CAR_H - 22),  # Front bumper curve
        (x0 + 44, y0 + CAR_H - 24),  # Front hood cowl
        (x0 + 58, y0 + 6),           # Windshield base
        (x0 + 94, y0 + 6),           # Roofline rear
        (x0 + 116, y0 + CAR_H - 20), # Rear hatch slope
        (x0 + CAR_LEN - 4, y0 + CAR_H - 21), # Rear ducktail spoiler
        (x0 + CAR_LEN - 4, y0 + CAR_H - 12), # Rear bumper corner
        (x0 + 10, y0 + CAR_H - 12)
    ], fill=red_main)

    # Hood highlight specular crease
    draw.line([(x0 + 16, y0 + CAR_H - 22), (x0 + 52, y0 + CAR_H - 23)], fill=red_highlight, width=1)
    draw.line([(x0 + 58, y0 + 7), (x0 + 92, y0 + 7)], fill=red_highlight, width=1)

    # 4. Tinted Panoramic Glass Cockpit
    glass_col = (18, 28, 42)
    glass_glare = (70, 140, 200)
    draw.polygon([
        (x0 + 58, y0 + CAR_H - 22),
        (x0 + 64, y0 + 8),
        (x0 + 90, y0 + 8),
        (x0 + 104, y0 + CAR_H - 22)
    ], fill=glass_col)
    # Glass glare line
    draw.line([(x0 + 68, y0 + 10), (x0 + 84, y0 + 20)], fill=glass_glare, width=1)

    # 5. Front LED Headlight & Light Strip
    draw.line([(x0 + 8, y0 + CAR_H - 18), (x0 + 18, y0 + CAR_H - 21)], fill=(200, 255, 255), width=2)
    # 6. Rear Cyber Taillight LED Bar
    draw.line([(x0 + CAR_LEN - 6, y0 + CAR_H - 21), (x0 + CAR_LEN - 4, y0 + CAR_H - 17)], fill=(255, 30, 60), width=2)

    # 7. Exterior Clean Outline
    draw.line([
        (x0 + 6, y0 + CAR_H - 13),
        (x0 + 14, y0 + CAR_H - 22),
        (x0 + 44, y0 + CAR_H - 24),
        (x0 + 58, y0 + 6),
        (x0 + 94, y0 + 6),
        (x0 + 116, y0 + CAR_H - 20),
        (x0 + CAR_LEN - 4, y0 + CAR_H - 21),
        (x0 + CAR_LEN - 4, y0 + CAR_H - 6),
        (x0 + 10, y0 + CAR_H - 6),
        (x0 + 6, y0 + CAR_H - 13)
    ], fill=outline, width=1)

    # 8. Wheels & Aerodynamic Alloy Rims (Front & Rear)
    wheel_radius = 11
    wheel_y = y0 + CAR_H - 4
    wheel_x_positions = [x0 + 32, x0 + 104]  # Front and Rear wheel wells

    for wx in wheel_x_positions:
        # Wheel arch cutout
        draw.ellipse([wx - wheel_radius - 2, wheel_y - wheel_radius - 2, wx + wheel_radius + 2, wheel_y + wheel_radius + 2], fill=(12, 14, 18))
        # Tire (Dark rubber)
        draw.ellipse([wx - wheel_radius, wheel_y - wheel_radius, wx + wheel_radius, wheel_y + wheel_radius], fill=(24, 26, 30), outline=outline)
        # Alloy rim (Silver/Grey with rotating spokes)
        rim_r = 7
        draw.ellipse([wx - rim_r, wheel_y - rim_r, wx + rim_r, wheel_y + rim_r], fill=(90, 105, 120))
        # 4 rotating spokes
        for a in [0, math.pi / 2, math.pi, math.pi * 1.5]:
            spoke_angle = a + wheel_rot
            sx = int(wx + math.cos(spoke_angle) * (rim_r - 1))
            sy = int(wheel_y + math.sin(spoke_angle) * (rim_r - 1))
            draw.line([(wx, wheel_y), (sx, sy)], fill=(210, 225, 240), width=1)
        # Center lug
        draw.rectangle([wx - 1, wheel_y - 1, wx + 1, wheel_y + 1], fill=(255, 255, 255))

        # Blue thruster glow reflection on rim during hover
        if thruster_intensity > 0.1:
            draw.ellipse([wx - 4, wheel_y + 2, wx + 4, wheel_y + 6], fill=(0, int(150 * thruster_intensity), 255))


def render_all_frames():
    """Generates the full 8-second 240-frame animation sequence."""
    frames = []
    particles = []

    # Road background pixel markers
    road_stripes = [i * 35 for i in range(12)]

    print(f"Generating {TOTAL_FRAMES} frames (8 seconds @ 30 FPS)...")

    for f in range(TOTAL_FRAMES):
        t = f / FPS  # current time in seconds (0.0 to 8.0)

        # Create frame canvas
        img = Image.new("RGB", (PIXEL_W, PIXEL_H), (10, 12, 18))
        draw = ImageDraw.Draw(img)

        # 1. Background (Minimalist 16-Bit Cyber Horizon)
        # Sky gradient / atmospheric night grid
        draw.rectangle([0, 0, PIXEL_W, GROUND_Y - 40], fill=(14, 16, 24))
        # Distant city skyline silhouette
        for b_idx, bx in enumerate(range(0, PIXEL_W, 28)):
            bh = 30 + ((b_idx * 17) % 45)
            draw.rectangle([bx, GROUND_Y - 40 - bh, bx + 24, GROUND_Y - 40], fill=(20, 24, 34))
            # Subtle pixel windows
            if b_idx % 2 == 0:
                draw.rectangle([bx + 4, GROUND_Y - 30 - bh, bx + 8, GROUND_Y - 24 - bh], fill=(240, 180, 50))
                draw.rectangle([bx + 14, GROUND_Y - 20 - bh, bx + 18, GROUND_Y - 14 - bh], fill=(0, 200, 255))

        # Horizon divider line
        draw.line([(0, GROUND_Y - 40), (PIXEL_W, GROUND_Y - 40)], fill=(32, 38, 52), width=1)

        # Ground / Asphalt Pavement
        draw.rectangle([0, GROUND_Y - 40, PIXEL_W, PIXEL_H], fill=(22, 24, 30))
        # Ground contact line
        draw.line([(0, GROUND_Y), (PIXEL_W, GROUND_Y)], fill=(44, 48, 60), width=1)
        # Curb road markings
        draw.line([(0, GROUND_Y + 28), (PIXEL_W, GROUND_Y + 28)], fill=(18, 20, 26), width=2)

        # Road texture lines scrolling (0 to 2 seconds)
        road_speed = 0
        if t < 2.0:
            road_speed = 1.0 - (t / 2.0) * 0.3  # decelerates slightly into stop
        elif t < 2.5:
            road_speed = max(0, 0.7 - (t - 2.0) * 1.4)
        else:
            road_speed = 0

        # Update road stripes
        for s_idx in range(len(road_stripes)):
            road_stripes[s_idx] = (road_stripes[s_idx] - road_speed * 12) % PIXEL_W
            sx = int(road_stripes[s_idx])
            draw.line([(sx, GROUND_Y + 12), (sx + 14, GROUND_Y + 12)], fill=(60, 66, 80), width=2)

        # 2. Physics & Sequence Timings:
        # Car horizontal position (cx)
        if t < 2.0:
            # Driving smoothly onto center screen
            progress = t / 2.0
            cx = int(80 + progress * 55)  # arrives at center x = 135
            wheel_rot = (f * 0.45) % (math.pi * 2)
            hover_y = 0
            thruster_intensity = 0.0
            suspension_squash = 0
        elif t < 4.0:
            # Decelerates to stop, activates cold-gas thrusters
            cx = 135
            wheel_rot = 0
            sub_t = (t - 2.0) / 2.0  # 0.0 to 1.0
            thruster_intensity = min(1.0, sub_t * 1.3)
            # Slight pre-lift suspension decompression
            hover_y = -int(sub_t * 6)
            suspension_squash = 0
        elif t < 6.0:
            # Hovers stable half a meter (~34 pixels in scale) above ground
            cx = 135
            wheel_rot = 0
            sub_t = (t - 4.0) / 2.0
            # Smooth ease in to full hover height: 34 pixels up
            lift_progress = min(1.0, sub_t * 1.5)
            # Gentle subtle atmospheric micro-breathing (±0.8px, staying horizontal!)
            hover_breath = math.sin(f * 0.25) * 1.0
            hover_y = -int(6 + lift_progress * 28 + hover_breath)
            thruster_intensity = 0.95 + math.sin(f * 0.8) * 0.05
            suspension_squash = 0
        else:
            # 6.0s to 8.0s: Thrusters weaken, car lowers back to ground, suspension settles
            cx = 135
            wheel_rot = 0
            sub_t = (t - 6.0) / 2.0  # 0.0 to 1.0

            if sub_t < 0.6:  # 6.0s - 7.2s: descending smoothly
                descend_prog = sub_t / 0.6
                hover_y = -int(34 * (1.0 - descend_prog))
                thruster_intensity = max(0.0, 1.0 - descend_prog * 1.2)
                suspension_squash = 0
            elif sub_t < 0.8:  # 7.2s - 7.6s: landing impact suspension compression!
                land_t = (sub_t - 0.6) / 0.2
                hover_y = 0
                thruster_intensity = 0.0
                # Suspension compresses down 3 pixels then rebounds
                suspension_squash = int(math.sin(land_t * math.pi) * 3)
            else:  # 7.6s - 8.0s: fully settled, wheels on ground
                hover_y = 0
                thruster_intensity = 0.0
                suspension_squash = 0

        # 3. Particle System Spawns
        # Driving dust during 0-2s
        if t < 2.0 and road_speed > 0.2:
            if random.random() < 0.5:
                particles.append({
                    'x': cx - 55,
                    'y': GROUND_Y - 2 + random.randint(-1, 1),
                    'vx': -random.uniform(1.5, 3.5),
                    'vy': -random.uniform(0.3, 1.2),
                    'size': random.randint(1, 2),
                    'color': (70, 75, 90),
                    'life': 14
                })

        # Intense Cold-gas plasma thruster blast particles & dust during hover (2-7s)
        if thruster_intensity > 0.1:
            for tx in [-32, 28]:
                noz_x = cx + tx
                # Electric blue plasma sparks shooting downward
                particles.append({
                    'x': noz_x + random.randint(-4, 4),
                    'y': GROUND_Y - 1,
                    'vx': random.uniform(-4.5, 4.5) * thruster_intensity,
                    'vy': -random.uniform(0.5, 3.0) * thruster_intensity,
                    'size': random.randint(1, 3),
                    'color': random.choice([(0, 240, 255), (140, 230, 255), (255, 255, 255), (0, 120, 255)]),
                    'life': random.randint(10, 22)
                })
                # Ground dust pushed outward
                particles.append({
                    'x': noz_x + random.randint(-6, 6),
                    'y': GROUND_Y - random.randint(0, 3),
                    'vx': (random.choice([-1, 1]) * random.uniform(2.5, 6.0)) * thruster_intensity,
                    'vy': -random.uniform(0.2, 1.0),
                    'size': random.randint(2, 4),
                    'color': (50, 55, 70),
                    'life': random.randint(16, 26)
                })

        # Update and draw particles
        for p in particles[:]:
            p['x'] += p['vx']
            p['y'] += p['vy']
            p['life'] -= 1
            if p['life'] <= 0:
                particles.remove(p)
                continue
            # Draw pixel particle
            px = int(p['x'])
            py = int(p['y'])
            sz = p['size']
            draw.rectangle([px, py, px + sz - 1, py + sz - 1], fill=p['color'])

        # 4. Draw the Pixel-Art Roadster
        draw_pixel_roadster(
            draw,
            cx=cx,
            cy=GROUND_Y,
            hover_y_offset=hover_y,
            wheel_rot=wheel_rot,
            thruster_intensity=thruster_intensity,
            suspension_squash=suspension_squash
        )

        # 5. Cinematic Retro Arcade HUD Overlay (Top & Bottom)
        # Top title & timestamp
        draw.text((12, 12), "TESLA ROADSTER // HOVER MODE", fill=(0, 240, 255))
        time_str = f"T+{t:04.2f}s  THRUSTER: {int(thruster_intensity * 100)}%"
        draw.text((12, 26), time_str, fill=(240, 180, 50))

        # Thruster status badge
        status_text = "DRIVING" if t < 2.0 else ("COLD-GAS ENGAGED" if t < 4.0 else ("HOVER ACTIVE" if t < 6.0 else "LANDING"))
        draw.rectangle([PIXEL_W - 95, 12, PIXEL_W - 12, 28], outline=(0, 240, 255))
        draw.text((PIXEL_W - 90, 15), status_text, fill=(255, 255, 255))

        # Bottom stats
        draw.line([(12, PIXEL_H - 24), (PIXEL_W - 12, PIXEL_H - 24)], fill=(32, 38, 52), width=1)
        draw.text((12, PIXEL_H - 18), "SPACEX COLD-GAS THRUSTERS", fill=(120, 140, 160))
        draw.text((PIXEL_W - 55, PIXEL_H - 18), "9:16 HD", fill=(0, 240, 255))

        # Upscale frame 2x with nearest-neighbor to OUTPUT_W x OUTPUT_H (540x960)
        hires_frame = img.resize((OUTPUT_W, OUTPUT_H), Image.Resampling.NEAREST)
        frames.append(hires_frame)

    return frames

def main():
    os.makedirs('static/videos', exist_ok=True)
    frames = render_all_frames()

    # Save MP4 video
    mp4_path = 'static/videos/roadster_thruster_animation.mp4'
    print(f"Encoding MP4 video to {mp4_path}...")
    import numpy as np
    writer = imageio.get_writer(mp4_path, fps=FPS, codec='libx264', quality=9, pixelformat='yuv420p')
    for f in frames:
        writer.append_data(np.array(f))
    writer.close()
    print("MP4 video successfully created!")

    # Save animated WebP (perfect for embedding and web browsers)
    webp_path = 'static/videos/roadster_thruster_animation.webp'
    print(f"Encoding animated WebP to {webp_path}...")
    frames[0].save(
        webp_path,
        save_all=True,
        append_images=frames[1:],
        duration=int(1000 / FPS),
        loop=0
    )
    print("WebP video successfully created!")

    # Save animated GIF preview (downscaled 0.5x for lightweight playback)
    gif_path = 'static/videos/roadster_thruster_animation.gif'
    print(f"Encoding animated GIF preview to {gif_path}...")
    gif_frames = [f.resize((270, 480), Image.Resampling.NEAREST) for f in frames[::2]] # 15 fps gif for quick load
    gif_frames[0].save(
        gif_path,
        save_all=True,
        append_images=gif_frames[1:],
        duration=int(1000 / 15),
        loop=0
    )
    print("GIF preview successfully created!")

if __name__ == '__main__':
    main()
