from PIL import Image, ImageOps, ImageEnhance
import os

# === CONFIGURATION ===
INPUT_LOGO = "logo.jpg"   # ton logo d'origine
OUTPUT_DIR = "logo_variants"

# Création du dossier de sortie
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Charger le logo
logo = Image.open(INPUT_LOGO).convert("RGBA")

# === VARIANTES ===

# 1. Original (copie)
logo.save(os.path.join(OUTPUT_DIR, "logo_original.png"))

# 2. Fond transparent (si fond blanc/noir existant)
def remove_bg(img):
    datas = img.getdata()
    new_data = []
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:  # fond blanc → transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    return img

logo_transparent = remove_bg(logo.copy())
logo_transparent.save(os.path.join(OUTPUT_DIR, "logo_transparent.png"))

# 3. Version foncée (background sombre)
dark_bg = Image.new("RGBA", logo.size, (30, 30, 30, 255))
dark_logo = dark_bg.copy()
dark_logo.paste(logo_transparent, (0, 0), logo_transparent)
dark_logo.save(os.path.join(OUTPUT_DIR, "logo_dark.png"))

# 4. Monochrome (noir et blanc)
mono = ImageOps.grayscale(logo).convert("RGBA")
mono.save(os.path.join(OUTPUT_DIR, "logo_monochrome.png"))

# 5. Inversé (négatif)
inverted = ImageOps.invert(logo.convert("RGB")).convert("RGBA")
inverted.save(os.path.join(OUTPUT_DIR, "logo_inverted.png"))

# 6. Haute visibilité (contraste augmenté)
enhancer = ImageEnhance.Contrast(logo)
contrast_logo = enhancer.enhance(2.0)
contrast_logo.save(os.path.join(OUTPUT_DIR, "logo_high_contrast.png"))

# 7. Petites tailles (favicon et miniatures)
sizes = [512, 256, 128, 64, 32, 16]
for s in sizes:
    small = logo.copy()
    small.thumbnail((s, s))
    small.save(os.path.join(OUTPUT_DIR, f"logo_{s}x{s}.png"))

print("✅ Toutes les variantes ont été générées dans le dossier :", OUTPUT_DIR)
