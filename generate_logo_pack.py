from PIL import Image, ImageOps, ImageDraw, ImageFont
import os
import cairosvg

# === CONFIG ===
input_file = "logo.jpg"   # Ton logo original (doit contenir icône + texte)
output_dir = "kotiz_logo_kit.1"

# Couleurs officielles KOTIZ
colors = {
    "green": (76, 162, 96),    # #4CA260
    "blue": (59, 91, 171),     # #3B5BAB
    "black": (0, 0, 0),
    "white": (255, 255, 255)
}

# Favicon sizes (standard web/app icons)
favicon_sizes = [16, 32, 64, 128, 180, 192, 512]

# Police (à ajuster selon ton système ou remplacer par ton branding)
font_path = "arial.ttf"

# Crée le dossier de sortie
os.makedirs(output_dir, exist_ok=True)

# Ouvre ton logo
img = Image.open(input_file).convert("RGBA")

# Fonction pour convertir PNG -> SVG
def png_to_svg(png_path, svg_path):
    cairosvg.png2svg(url=png_path, write_to=svg_path)

# ========== 1. Génération des variantes couleurs ==========
for name, color in colors.items():
    # Teinte monochrome
    mono = ImageOps.colorize(img.convert("L"), black="black", white=color)
    mono = mono.convert("RGBA")
    mono_path = f"{output_dir}/kotiz_logo_{name}.png"
    mono.save(mono_path, format="PNG")
    png_to_svg(mono_path, mono_path.replace(".png", ".svg"))

    # Transparent recolorisé
    transparent = img.copy()
    datas = transparent.getdata()
    new_data = []
    for item in datas:
        if item[3] < 200:  # transparence
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(color + (255,))
    transparent.putdata(new_data)
    transparent_path = f"{output_dir}/kotiz_logo_{name}_transparent.png"
    transparent.save(transparent_path, format="PNG")
    png_to_svg(transparent_path, transparent_path.replace(".png", ".svg"))

# ========== 2. Icône seule ==========
icon = img.crop((0, 0, img.width // 2, img.height))
icon_path = f"{output_dir}/kotiz_icon.png"
icon.save(icon_path, format="PNG")
png_to_svg(icon_path, icon_path.replace(".png", ".svg"))

# ========== 3. Texte seul "KOTIZ" ==========
try:
    font = ImageFont.truetype(font_path, 200)
except:
    font = ImageFont.load_default()

text_img = Image.new("RGBA", (1000, 300), (255, 255, 255, 0))
draw = ImageDraw.Draw(text_img)
draw.text((50, 50), "KOTIZ", font=font, fill=(0, 0, 0, 255))
text_path = f"{output_dir}/kotiz_text.png"
text_img.save(text_path, format="PNG")
png_to_svg(text_path, text_path.replace(".png", ".svg"))

# ========== 4. Favicons ==========
for size in favicon_sizes:
    fav = icon.copy()
    fav = fav.resize((size, size), Image.LANCZOS)
    fav_path = f"{output_dir}/favicon_{size}x{size}.png"
    fav.save(fav_path, format="PNG")
    if size >= 64:  # inutile de vectoriser les toutes petites tailles
        png_to_svg(fav_path, fav_path.replace(".png", ".svg"))

# Génération ICO classique
icon.save(f"{output_dir}/favicon.ico", format="ICO", sizes=[(s, s) for s in favicon_sizes])

print("✅ Pack de logos KOTIZ généré dans:", output_dir)
python c:\Users\OK\kotiz-web\generate_logo_pack.py