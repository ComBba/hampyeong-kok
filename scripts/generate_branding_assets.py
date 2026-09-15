import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

SOURCE_PATH = r"C:\Users\Kimsejun\AppData\Local\Temp\orca-paste-1789475234625-ab5d0ea2-2c0a-4c41-a27b-68288f7e7bdb.png"
OUTPUT_DIR = r"C:\Users\Kimsejun\orca\workspaces\hampyeong-kok\turban\public\images"
PUBLIC_DIR = r"C:\Users\Kimsejun\orca\workspaces\hampyeong-kok\turban\public"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load source image
im = Image.open(SOURCE_PATH).convert("RGBA")
arr = np.array(im)

# 1. Full horizontal logo: crop tightly to non-transparent pixels
alpha = arr[:, :, 3]
y_indices, x_indices = np.where(alpha > 10)
y_min, y_max = y_indices.min(), y_indices.max()
x_min, x_max = x_indices.min(), x_indices.max()

# Add 12px padding
pad = 12
y0 = max(0, y_min - pad)
y1 = min(im.height, y_max + pad + 1)
x0 = max(0, x_min - pad)
x1 = min(im.width, x_max + pad + 1)

full_logo = im.crop((x0, y0, x1, y1))
full_logo_path = os.path.join(OUTPUT_DIR, "logo.png")
full_logo.save(full_logo_path, "PNG", optimize=True)
print(f"Saved full logo: {full_logo.size} -> {full_logo_path}")

# 2. Butterfly pin symbol: from x0 to x_symbol_split (~ x0 + 445)
# Find exact cut between symbol and text
cropped_arr = np.array(full_logo)
# In full_logo coordinates, let's find the minimum non-white column between x=380 and x=480
min_non_white = 9999
split_x = 445
for x in range(380, 480):
    col = cropped_arr[:, x]
    non_white = np.sum((col[:, 3] > 10) & ((col[:, 0] < 240) | (col[:, 1] < 240) | (col[:, 2] < 240)))
    if non_white < min_non_white:
        min_non_white = non_white
        split_x = x

print(f"Symbol split column in full_logo: {split_x} (non-white: {min_non_white})")

symbol_cropped = full_logo.crop((0, 0, split_x + 10, full_logo.height))
# Crop symbol tightly to its own alpha
sym_arr = np.array(symbol_cropped)
sym_alpha = sym_arr[:, :, 3]
sym_y, sym_x = np.where(sym_alpha > 10)
sym_tight = symbol_cropped.crop((sym_x.min() - 6, sym_y.min() - 6, sym_x.max() + 7, sym_y.max() + 7))

# Center the symbol in a 512x512 square canvas
square_sym = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
# Scale sym_tight to fit within 450x450 while preserving aspect ratio
sym_w, sym_h = sym_tight.size
ratio = min(440 / sym_w, 440 / sym_h)
new_w = int(sym_w * ratio)
new_h = int(sym_h * ratio)
sym_resized = sym_tight.resize((new_w, new_h), Image.Resampling.LANCZOS)
paste_x = (512 - new_w) // 2
paste_y = (512 - new_h) // 2
square_sym.paste(sym_resized, (paste_x, paste_y), sym_resized)

symbol_path = os.path.join(OUTPUT_DIR, "logo-symbol.png")
square_sym.save(symbol_path, "PNG", optimize=True)
print(f"Saved symbol square: {square_sym.size} -> {symbol_path}")

# 3. PWA Icons (192x192 and 512x512)
icon_192 = square_sym.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(OUTPUT_DIR, "icon-192.png"), "PNG", optimize=True)
icon_512 = square_sym.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save(os.path.join(OUTPUT_DIR, "icon-512.png"), "PNG", optimize=True)

# Also create app icon with subtle white rounded container for Apple touch icon
apple_icon = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
sym_apple = sym_tight.resize((150, int(150 * (sym_h / sym_w))), Image.Resampling.LANCZOS)
paste_apple_x = (180 - sym_apple.width) // 2
paste_apple_y = (180 - sym_apple.height) // 2
apple_icon.paste(sym_apple, (paste_apple_x, paste_apple_y), sym_apple)
apple_icon.save(os.path.join(OUTPUT_DIR, "apple-touch-icon.png"), "PNG", optimize=True)

# 4. Favicon (.ico)
favicon_16 = square_sym.resize((16, 16), Image.Resampling.LANCZOS)
favicon_32 = square_sym.resize((32, 32), Image.Resampling.LANCZOS)
favicon_48 = square_sym.resize((48, 48), Image.Resampling.LANCZOS)
favicon_path = os.path.join(PUBLIC_DIR, "favicon.ico")
favicon_32.save(favicon_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print(f"Saved multi-size favicon.ico -> {favicon_path}")

# 5. OpenGraph (KakaoTalk / SNS preview card, 1200 x 630)
og_bg = Image.new("RGBA", (1200, 630), (248, 250, 252, 255)) # soft slate-50 bg
draw = ImageDraw.Draw(og_bg)

# Decorative soft emerald and blue ambient glow circles
for r, alpha_val in [(350, 15), (280, 25), (200, 35)]:
    glow = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([80 - r, 120 - r, 80 + r, 120 + r], fill=(16, 185, 129, alpha_val))
    gdraw.ellipse([1100 - r, 480 - r, 1100 + r, 480 + r], fill=(14, 165, 233, alpha_val))
    og_bg = Image.alpha_composite(og_bg, glow)

# Draw a clean card container in the center
card_margin_x = 80
card_margin_y = 60
draw = ImageDraw.Draw(og_bg)
draw.rounded_rectangle(
    [card_margin_x, card_margin_y, 1200 - card_margin_x, 630 - card_margin_y],
    radius=32,
    fill=(255, 255, 255, 245),
    outline=(226, 232, 240, 255),
    width=2
)

# Paste the logo in the upper part
logo_target_w = 640
logo_target_h = int(logo_target_w * (full_logo.height / full_logo.width))
logo_resized = full_logo.resize((logo_target_w, logo_target_h), Image.Resampling.LANCZOS)
logo_paste_x = (1200 - logo_target_w) // 2
logo_paste_y = 110
og_bg.paste(logo_resized, (logo_paste_x, logo_paste_y), logo_resized)

# Try loading Windows Malgun Gothic or standard Korean font
font_title = None
font_sub = None
font_chips = None
for font_name in ["malgunbd.ttf", "malgun.ttf", "gulim.ttc", "NanumGothicBold.ttf"]:
    try:
        font_title = ImageFont.truetype(font_name, 38)
        font_sub = ImageFont.truetype(font_name, 26)
        font_chips = ImageFont.truetype(font_name, 22)
        print(f"Loaded font: {font_name}")
        break
    except Exception:
        pass

if font_title is None:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_chips = ImageFont.load_default()

draw = ImageDraw.Draw(og_bg)

# Subtitle text
sub_text = "2026 함평군 민생회복지원금(50만 원) 가맹점 스마트 지도"
bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
w_sub = bbox_sub[2] - bbox_sub[0]
draw.text(((1200 - w_sub) // 2, 350), sub_text, font=font_sub, fill=(51, 65, 85, 255)) # slate-700

# Feature badges at the bottom
badges = ["🌾 함평 4대 5일장", "🛒 하나로마트 본·지점", "⛽ 주유소·면세유", "📍 내 위치 반경 탐색"]
total_badge_w = 0
badge_widths = []
for b in badges:
    bb = draw.textbbox((0, 0), b, font=font_chips)
    bw = (bb[2] - bb[0]) + 36
    badge_widths.append(bw)
    total_badge_w += bw
total_badge_w += (len(badges) - 1) * 16

start_bx = (1200 - total_badge_w) // 2
by = 430
bh = 46

for i, b in enumerate(badges):
    bw = badge_widths[i]
    draw.rounded_rectangle(
        [start_bx, by, start_bx + bw, by + bh],
        radius=23,
        fill=(241, 245, 249, 255), # slate-100
        outline=(203, 213, 225, 255),
        width=1
    )
    bb = draw.textbbox((0, 0), b, font=font_chips)
    tw = bb[2] - bb[0]
    th = bb[3] - bb[1]
    draw.text((start_bx + (bw - tw) // 2, by + (bh - th) // 2 - 2), b, font=font_chips, fill=(30, 41, 59, 255))
    start_bx += bw + 16

# Footer website domain
footer_text = "hampyeong-kok.vercel.app"
bbox_foot = draw.textbbox((0, 0), footer_text, font=font_sub)
w_foot = bbox_foot[2] - bbox_foot[0]
draw.text(((1200 - w_foot) // 2, 505), footer_text, font=font_sub, fill=(100, 116, 139, 255)) # slate-500

og_image_path = os.path.join(OUTPUT_DIR, "og-image.png")
og_bg.convert("RGB").save(og_image_path, "JPEG", quality=92, optimize=True)
print(f"Saved OG preview image -> {og_image_path}")

print("All branding assets successfully created!")
