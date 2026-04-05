#!/usr/bin/env python3
"""Generate professional app icon for SalesCoachApp"""
import sys
sys.path.insert(0, '/Users/coachduynguyenminim4/Library/Python/3.9/lib/python/site-packages')

from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 1024
CENTER = SIZE // 2

img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background gradient effect — deep indigo
# Simulating gradient with concentric rounded rects
for i in range(SIZE):
    ratio = i / SIZE
    r = int(55 + ratio * 24)   # 55 -> 79
    g = int(48 + ratio * 22)   # 48 -> 70
    b = int(163 + ratio * 66)  # 163 -> 229
    draw.rectangle([0, i, SIZE, i + 1], fill=(r, g, b, 255))

# Rounded corners mask
mask = Image.new('L', (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
radius = int(SIZE * 0.22)  # ~225px radius for app icon
mask_draw.rounded_rectangle([0, 0, SIZE, SIZE], radius=radius, fill=255)
img.putalpha(mask)

# Draw a stylized shield/badge shape — representing trust & authority
shield_w = 420
shield_h = 500
sx = CENTER - shield_w // 2
sy = CENTER - shield_h // 2 - 30

# Shield body
shield = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
sd = ImageDraw.Draw(shield)

# Shield shape using polygon
points = [
    (sx, sy + 80),                          # top-left (below curve)
    (CENTER, sy),                           # top-center peak
    (sx + shield_w, sy + 80),               # top-right
    (sx + shield_w, sy + shield_h * 0.6),   # right side
    (CENTER, sy + shield_h),                # bottom point
    (sx, sy + shield_h * 0.6),              # left side
]
sd.polygon(points, fill=(255, 255, 255, 40))

# Inner shield outline
inner_margin = 20
inner_points = [
    (sx + inner_margin, sy + 80 + inner_margin),
    (CENTER, sy + inner_margin + 10),
    (sx + shield_w - inner_margin, sy + 80 + inner_margin),
    (sx + shield_w - inner_margin, sy + shield_h * 0.6 - inner_margin),
    (CENTER, sy + shield_h - inner_margin * 2),
    (sx + inner_margin, sy + shield_h * 0.6 - inner_margin),
]
sd.polygon(inner_points, outline=(255, 255, 255, 80), width=3)

img = Image.alpha_composite(img, shield)
draw = ImageDraw.Draw(img)

# Draw "S" letter — bold, centered in shield
try:
    font = ImageFont.truetype("/System/Library/Fonts/SFCompact.ttf", 320)
except:
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 320)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/SFNSDisplay.ttf", 320)
        except:
            font = ImageFont.load_default()

# Draw "S" with slight shadow for depth
bbox = draw.textbbox((0, 0), "S", font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = CENTER - tw // 2
ty = CENTER - th // 2 - 80

# Shadow
draw.text((tx + 4, ty + 4), "S", fill=(0, 0, 0, 60), font=font)
# Main letter
draw.text((tx, ty), "S", fill=(255, 255, 255, 255), font=font)

# Small accent bar below the S
bar_w = 160
bar_h = 8
bx = CENTER - bar_w // 2
by = ty + th + 20
draw.rounded_rectangle([bx, by, bx + bar_w, by + bar_h], radius=4, fill=(246, 173, 85, 255))

# Three small dots as decoration (representing 3 touch points)
dot_r = 10
dot_y = by + 40
dot_spacing = 40
for i in range(-1, 2):
    dx = CENTER + i * dot_spacing
    draw.ellipse([dx - dot_r, dot_y - dot_r, dx + dot_r, dot_y + dot_r], fill=(246, 173, 85, 200))

# Apply rounded corners mask again
img.putalpha(mask)

# Save icon
icon_path = '/Users/coachduynguyenminim4/Desktop/SalesCoachApp/assets/icon.png'
img.save(icon_path, 'PNG')
print(f'Icon saved: {icon_path}')

# Generate adaptive icon (foreground only, with padding)
adaptive = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
adaptive_draw = ImageDraw.Draw(adaptive)

# Background layer
adaptive_bg = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
bg_draw = ImageDraw.Draw(adaptive_bg)
for i in range(SIZE):
    ratio = i / SIZE
    r = int(55 + ratio * 24)
    g = int(48 + ratio * 22)
    b = int(163 + ratio * 66)
    bg_draw.rectangle([0, i, SIZE, i + 1], fill=(r, g, b, 255))
adaptive_bg_path = '/Users/coachduynguyenminim4/Desktop/SalesCoachApp/assets/adaptive-icon.png'
adaptive_bg.save(adaptive_bg_path, 'PNG')

# Foreground — same design
fg = img.copy()
fg_path = '/Users/coachduynguyenminim4/Desktop/SalesCoachApp/assets/adaptive-icon.png'

# Use full icon as adaptive icon (Android will mask it)
img_full = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
img_full_draw = ImageDraw.Draw(img_full)
# Full background without rounding
for i in range(SIZE):
    ratio = i / SIZE
    r = int(55 + ratio * 24)
    g = int(48 + ratio * 22)
    b = int(163 + ratio * 66)
    img_full_draw.rectangle([0, i, SIZE, i + 1], fill=(r, g, b, 255))

# Composite shield and text onto it
img_full = Image.alpha_composite(img_full, shield)
img_full_draw = ImageDraw.Draw(img_full)
img_full_draw.text((tx + 4, ty + 4), "S", fill=(0, 0, 0, 60), font=font)
img_full_draw.text((tx, ty), "S", fill=(255, 255, 255, 255), font=font)
img_full_draw.rounded_rectangle([bx, by, bx + bar_w, by + bar_h], radius=4, fill=(246, 173, 85, 255))
for i in range(-1, 2):
    dx = CENTER + i * dot_spacing
    img_full_draw.ellipse([dx - dot_r, dot_y - dot_r, dx + dot_r, dot_y + dot_r], fill=(246, 173, 85, 200))

img_full.save(fg_path, 'PNG')
print(f'Adaptive icon saved: {fg_path}')

# Splash icon — same but with transparent bg
splash_path = '/Users/coachduynguyenminim4/Desktop/SalesCoachApp/assets/splash-icon.png'
img.save(splash_path, 'PNG')
print(f'Splash icon saved: {splash_path}')

print('All icons generated!')
