from PIL import Image, ImageOps
import os

# === CONFIG ===
input_file = "logo.jpg"   # Ton logo original
output_dir = "kotiz_logo_kit"

# Couleurs officielles KOTIZ
colors = {
    "green": (76, 162, 96),    # #4CA260
    "blue": (59, 91, 171),     # #3B5BAB
    "black": (0, 0, 0),
    "white": (255, 255, 255)
}

# Crée le dossier de sortie
os.makedirs(output_dir, exist_ok=True)

# Ouvre ton logo
img = Image.open(input_file).convert("RGBA")

# Génération des variantes
for name, color in colors.items():
    # Teinte monochrome
    mono = ImageOps.colorize(img.convert("L"), black="black", white=color)
    mono = mono.convert("RGBA")

    # Sauvegarde PNG
    mono.save(f"{output_dir}/kotiz_logo_{name}.png", format="PNG")

    # Version transparente
    transparent = img.copy()
    datas = transparent.getdata()
    new_data = []
    for item in datas:
        if item[3] < 200:  # transparence
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(color + (255,))
    transparent.putdata(new_data)
    transparent.save(f"{output_dir}/kotiz_logo_{name}_transparent.png", format="PNG")

# Icône seule (tu peux cropper manuellement ici)
icon = img.crop((0, 0, img.width // 2, img.height))  # exemple: moitié gauche
icon.save(f"{output_dir}/kotiz_icon.png", format="PNG")

print("✅ Kit de logos KOTIZ généré dans:", output_dir)
