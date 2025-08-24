from PIL import Image, ImageDraw, ImageFont
import os

# === CONFIG ===
INPUT_LOGO = "logo.jpg"      # Ton logo de base
FONT_PATH = "C:\\Windows\\Fonts\\arial.ttf"  # Chemin mis à jour pour une police système disponible
OUTPUT_DIR = "variants_logo"

PRIMARY_COLOR = "#4CA260"   # Vert
SECONDARY_COLOR = "#3B5BAB" # Bleu

TEXT = "KOTIZ"

# === CRÉER DOSSIER DE SORTIE ===
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Charger le logo
logo = Image.open(INPUT_LOGO).convert("RGBA")

# Taille et proportions
W, H = logo.size

# Détourer l’icône (on suppose qu’elle est dans la moitié haute)
icone = logo.crop((0, 0, W, H * 0.65)).copy()

# Détourer le texte (on suppose qu’il est dans la moitié basse)
texte_img = logo.crop((0, H * 0.65, W, H)).copy()

# --- 1. TEXTE SEUL ---
text_only = Image.new("RGBA", texte_img.size, (255, 255, 255, 0))
text_only.paste(texte_img, (0, 0), texte_img)
text_only.save(os.path.join(OUTPUT_DIR, "01_texte_seul.png"))

# --- 2. ICÔNE SEULE AVEC CERCLE ---
icone_with_circle = Image.new("RGBA", icone.size, (255, 255, 255, 0))
draw = ImageDraw.Draw(icone_with_circle)
bbox = icone.getbbox()
cx, cy = icone.size[0] // 2, icone.size[1] // 2
r = min(icone.size) // 2 - 5
draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline="black", width=4)
icone_with_circle.paste(icone, (0, 0), icone)
icone_with_circle.save(os.path.join(OUTPUT_DIR, "02_icone_avec_cercle.png"))

# --- 3. ICÔNE SEULE SANS CERCLE ---
icone_only = Image.new("RGBA", icone.size, (255, 255, 255, 0))
icone_only.paste(icone, (0, 0), icone)
icone_only.save(os.path.join(OUTPUT_DIR, "03_icone_sans_cercle.png"))

# --- 4. LOGO VERTICAL ---
font = ImageFont.truetype(FONT_PATH, 120)
text_w, text_h = font.getbbox(TEXT)[2:]  # Utilisation de getbbox pour obtenir la largeur et la hauteur du texte
vertical = Image.new("RGBA", (max(W, text_w), H + text_h + 40), (255, 255, 255, 0))
vertical.paste(icone, ((vertical.width - icone.width) // 2, 0), icone)

draw = ImageDraw.Draw(vertical)
draw.text(((vertical.width - text_w) // 2, H + 20), TEXT, fill=PRIMARY_COLOR, font=font)
vertical.save(os.path.join(OUTPUT_DIR, "04_logo_vertical.png"))

# --- 5. LOGO HORIZONTAL ---
horizontal = Image.new("RGBA", (W + text_w + 40, max(H, text_h)), (255, 255, 255, 0))
horizontal.paste(icone, (0, (horizontal.height - icone.height) // 2), icone)
draw = ImageDraw.Draw(horizontal)
draw.text((W + 20, (horizontal.height - text_h) // 2), TEXT, fill=PRIMARY_COLOR, font=font)
horizontal.save(os.path.join(OUTPUT_DIR, "05_logo_horizontal.png"))

print("✅ Variantes générées dans le dossier :", OUTPUT_DIR)
