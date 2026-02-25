"""
Generate wheel_library_banner.gif — retro neon roller rink aesthetic.
Matches the SVG banner: WHEEL (pink flicker) + LIBRARY (blue pulse) +
corner brackets, pulsing border, twinkling stars, rolling wheel.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os

W, H       = 600, 380
N_FRAMES   = 36          # 36 × 90ms ≈ 3.24s loop
FRAME_MS   = 90
OUT        = os.path.join(os.path.dirname(__file__), "wheel_library_banner.gif")

BG     = (13,  13,  13)
PINK   = (255, 20,  147)
BLUE   = (0,   191, 255)
LIME   = (191, 255, 0)
PURPLE = (155, 48,  255)
ORANGE = (255, 111, 0)
GOLD   = (255, 215, 0)

F_BOLD = "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"
F_REG  = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

f_wheel = ImageFont.truetype(F_BOLD, 96)
f_lib   = ImageFont.truetype(F_BOLD, 76)
f_beta  = ImageFont.truetype(F_BOLD, 20)
f_tag   = ImageFont.truetype(F_REG,  11)


def add_glow(base, text, xy, font, color, glow_r, text_alpha=255):
    """Draw blurred glow then sharp text onto base (RGBA, in-place)."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text(xy, text, font=font, fill=(*color, 140), anchor="mm")
    layer = layer.filter(ImageFilter.GaussianBlur(radius=glow_r))
    d2 = ImageDraw.Draw(layer)
    d2.text(xy, text, font=font, fill=(*color, text_alpha), anchor="mm")
    base.alpha_composite(layer)


def add_glow_polyline(base, pts, color, lw, glow_r):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for a, b in zip(pts, pts[1:]):
        d.line([a, b], fill=(*color, 130), width=lw + 4)
    layer = layer.filter(ImageFilter.GaussianBlur(radius=glow_r))
    d2 = ImageDraw.Draw(layer)
    for a, b in zip(pts, pts[1:]):
        d2.line([a, b], fill=(*color, 255), width=lw)
    base.alpha_composite(layer)


def add_glow_ellipse(base, box, color, lw, glow_r):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse(box, outline=(*color, 120), width=lw + 4)
    layer = layer.filter(ImageFilter.GaussianBlur(radius=glow_r))
    d2 = ImageDraw.Draw(layer)
    d2.ellipse(box, outline=(*color, 255), width=lw)
    base.alpha_composite(layer)


# Flicker: frame index → WHEEL alpha
FLICKER = {7: 64, 9: 210, 11: 30, 21: 200}

# Stars: (x, y, size, phase_offset_0..1, color)
STARS = [
    (62,  68,  15, 0.00, GOLD),
    (536, 80,  12, 0.26, BLUE),
    (80,  295,  9, 0.48, LIME),
    (522, 278, 13, 0.13, PINK),
    (300, 40,   8, 0.39, PURPLE),
]

CORNERS = [
    [(6, 48),  (6, 6),   (48, 6)],
    [(552, 6), (594, 6), (594, 48)],
    [(6, 332), (6, 374), (48, 374)],
    [(552, 374),(594, 374),(594, 332)],
]

frames = []
print(f"Rendering {N_FRAMES} frames …")

for i in range(N_FRAMES):
    t  = i / N_FRAMES          # 0 → 1 (loop position)
    s  = math.sin(t * 2 * math.pi)
    p  = (s + 1) / 2           # 0 → 1 smooth pulse

    frame = Image.new("RGBA", (W, H), (*BG, 255))

    # ── Dot grid ──────────────────────────────────────────────────────────
    d = ImageDraw.Draw(frame)
    for gx in range(12, W, 24):
        for gy in range(12, H, 24):
            d.ellipse([gx-1, gy-1, gx+1, gy+1], fill=(*PURPLE, 45))

    # ── Pulsing border ─────────────────────────────────────────────────────
    b_alpha = int(90 + 110 * p)
    blayer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(blayer)
    bd.rounded_rectangle([6, 6, W-6, H-6], radius=10,
                         outline=(*PURPLE, b_alpha), width=2)
    blayer = blayer.filter(ImageFilter.GaussianBlur(radius=5))
    bd2 = ImageDraw.Draw(blayer)
    bd2.rounded_rectangle([6, 6, W-6, H-6], radius=10,
                          outline=(*PURPLE, b_alpha), width=2)
    frame.alpha_composite(blayer)

    # ── Corner brackets ────────────────────────────────────────────────────
    for pts in CORNERS:
        add_glow_polyline(frame, pts, PINK, 3, 4)

    # ── Twinkling stars ────────────────────────────────────────────────────
    for sx, sy, sz, phase, sc in STARS:
        star_p = (math.sin(t * 2 * math.pi + phase * 2 * math.pi) + 1) / 2
        star_a = int(star_p * 255)
        star_sz = max(6, int(sz * (0.3 + 0.7 * star_p)))
        sf = ImageFont.truetype(F_REG, star_sz)
        sl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(sl)
        sd.text((sx, sy), "✦", font=sf, fill=(*sc, star_a), anchor="mm")
        frame.alpha_composite(sl)

    # ── WHEEL  (pink, flickers) ────────────────────────────────────────────
    wheel_a = FLICKER.get(i, 255)
    pink_p  = (math.sin(t * 2 * math.pi) + 1) / 2
    add_glow(frame, "WHEEL", (W//2, 148), f_wheel, PINK,
             glow_r=6 + int(7 * pink_p), text_alpha=wheel_a)

    # ── LIBRARY  (blue, pulses) ────────────────────────────────────────────
    blue_p = (math.sin(t * 2 * math.pi + 0.4 * 2 * math.pi) + 1) / 2
    add_glow(frame, "LIBRARY", (W//2, 232), f_lib, BLUE,
             glow_r=5 + int(6 * blue_p))

    # ── ( BETA AF )  (lime) ───────────────────────────────────────────────
    add_glow(frame, "( BETA AF )", (W//2, 272), f_beta, LIME, glow_r=4)

    # ── Divider ───────────────────────────────────────────────────────────
    dl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dld = ImageDraw.Draw(dl)
    dld.line([(50, 292), (550, 292)], fill=(*PURPLE, 80), width=3)
    dl = dl.filter(ImageFilter.GaussianBlur(radius=2))
    dld2 = ImageDraw.Draw(dl)
    dld2.line([(50, 292), (550, 292)], fill=(*PURPLE, 120), width=1)
    frame.alpha_composite(dl)

    # ── Tagline ───────────────────────────────────────────────────────────
    tl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tld = ImageDraw.Draw(tl)
    tld.text((W//2, 313), "A BABY APP THAT'S STILL LEARNING TO ROLL",
             font=f_tag, fill=(*GOLD, 220), anchor="mm")
    frame.alpha_composite(tl)

    # ── Rolling wheel ─────────────────────────────────────────────────────
    wx  = int(-75 + t * 750) % (W + 150) - 75   # wraps cleanly
    wy  = 354
    wr  = 20
    rot = t * (750 / (2 * math.pi * wr)) * 2 * math.pi   # radians rotated

    whl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    whd = ImageDraw.Draw(whl)

    # Rim glow
    whd.ellipse([wx-wr, wy-wr, wx+wr, wy+wr], outline=(*ORANGE, 90), width=6)
    whl_blur = whl.filter(ImageFilter.GaussianBlur(radius=5))
    frame.alpha_composite(whl_blur)

    # Rim sharp + spokes + hub
    rim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd  = ImageDraw.Draw(rim)
    rd.ellipse([wx-wr, wy-wr, wx+wr, wy+wr], outline=(*ORANGE, 230), width=2)
    for s in range(4):
        ang = rot + s * math.pi / 2
        rd.line([(wx + int(wr * math.cos(ang)),  wy + int(wr * math.sin(ang))),
                 (wx - int(wr * math.cos(ang)),  wy - int(wr * math.sin(ang)))],
                fill=(*ORANGE, 200), width=2)
    hub = 4
    rd.ellipse([wx-hub, wy-hub, wx+hub, wy+hub], fill=(*ORANGE, 230))
    frame.alpha_composite(rim)

    # Convert RGBA → RGB (GIF palette)
    rgb = Image.new("RGB", (W, H), BG)
    rgb.paste(frame, mask=frame.split()[3])
    frames.append(rgb)
    if (i + 1) % 6 == 0:
        print(f"  {i+1}/{N_FRAMES}")

print("Saving GIF …")
frames[0].save(
    OUT,
    save_all=True,
    append_images=frames[1:],
    optimize=False,
    duration=FRAME_MS,
    loop=0,
)
kb = os.path.getsize(OUT) // 1024
print(f"Done → {OUT}  ({kb} KB)")
