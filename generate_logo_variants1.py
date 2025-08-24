from PIL import Image, ImageDraw, ImageFont
import os

# === CONFIGURATION ===
base_logo_path = "logo.jpg"  # Ton logo de départ
output_dir = "logo_variants1" 
os.makedirs(output_dir, exist_ok=True)

# Police pour le texte
try:
    font = ImageFont.truetype("arial.ttf", 60)
except:
    font = ImageFont.load_default()

# Texte associé à ton logo
brand_name = "KOTIZ"

# === CHARGEMENT DU LOGO ===
logo = Image.open(base_logo_path).convert("RGBA")

# === 1. Logo seul ===
logo.save(os.path.join(output_dir, "logo_seul.png"))

# === 2. Texte seul ===
text_img = Image.new("RGBA", (600, 200), (255, 255, 255, 0))
draw = ImageDraw.Draw(text_img)
draw.text((50, 50), brand_name, font=font, fill=(0, 0, 0, 255))
text_img.save(os.path.join(output_dir, "texte_seul.png"))

# === 3. Logo + texte côte à côte ===
combo_side = Image.new("RGBA", (logo.width + 600, max(logo.height, 200)), (255, 255, 255, 0))
combo_side.paste(logo, (0, 0))
combo_side.paste(text_img, (logo.width + 20, (logo.height - 200)//2), text_img)
combo_side.save(os.path.join(output_dir, "logo_texte_cote_a_cote.png"))

# === 4. Logo + texte en dessous ===
combo_bottom = Image.new("RGBA", (max(logo.width, 600), logo.height + 200), (255, 255, 255, 0))
combo_bottom.paste(logo, ((combo_bottom.width - logo.width)//2, 0))
combo_bottom.paste(text_img, ((combo_bottom.width - 600)//2, logo.height + 10), text_img)
combo_bottom.save(os.path.join(output_dir, "logo_texte_dessous.png"))

# === 5. Versions en niveaux de gris ===
logo_gray = logo.convert("L").convert("RGBA")
text_gray = text_img.convert("L").convert("RGBA")

logo_gray.save(os.path.join(output_dir, "logo_gris.png"))
text_gray.save(os.path.join(output_dir, "texte_gris.png"))

# === 6. Version favicon (32x32 et 64x64) ===
favicon32 = logo.resize((32, 32))
favicon32.save(os.path.join(output_dir, "favicon32.png"))
favicon64 = logo.resize((64, 64))
favicon64.save(os.path.join(output_dir, "favicon64.png"))

# === 7. Fonds transparents, noir et blanc ===
bg_variants = {
    "fond_transparent.png": (255, 255, 255, 0),
    "fond_blanc.png": (255, 255, 255, 255),
    "fond_noir.png": (0, 0, 0, 255),
}

for name, color in bg_variants.items():
    bg = Image.new("RGBA", logo.size, color)
    bg.paste(logo, (0, 0), logo)
    bg.save(os.path.join(output_dir, name))

print("✅ Toutes les variantes ont été générées dans :", output_dir)
