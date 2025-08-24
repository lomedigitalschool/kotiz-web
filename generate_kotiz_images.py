from PIL import Image, ImageDraw, ImageFont

# Paramètres
texte = "KOTIZ"
font_path = "arial.ttf"  # Remplace par le chemin vers la police que tu veux
font_size = 120
main_image_path = "main.png"  # Ton icône de main
output_size = (600, 200)  # Taille de sortie des images

# Charger la police
font = ImageFont.truetype(font_path, font_size)

# 1️⃣ Texte seul
img_text = Image.new("RGBA", output_size, (255, 255, 255, 0))  # fond transparent
draw = ImageDraw.Draw(img_text)
# Remplacement de draw.textsize par draw.textbbox pour calculer la taille du texte
bbox = draw.textbbox((0, 0), texte, font=font)
w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
draw.text(((output_size[0]-w)/2, (output_size[1]-h)/2), texte, font=font, fill="black")
img_text.save("kotiz_seul.png")

# 2️⃣ Main seule
main_img = Image.open(main_image_path).convert("RGBA")
main_img = main_img.resize((150, 150), Image.Resampling.LANCZOS)  # Ajuste la taille si besoin
img_main = Image.new("RGBA", output_size, (255, 255, 255, 0))
img_main.paste(main_img, ((output_size[0]-main_img.width)//2, (output_size[1]-main_img.height)//2), main_img)
img_main.save("main_seule.png")

# 3️⃣ Texte + main côte à côte
img_combo = Image.new("RGBA", output_size, (255, 255, 255, 0))
draw = ImageDraw.Draw(img_combo)

# Mesurer texte
bbox_text = draw.textbbox((0, 0), texte, font=font)
w_text, h_text = bbox_text[2] - bbox_text[0], bbox_text[3] - bbox_text[1]
main_resized = main_img

# Calculer position pour centrer horizontalement les deux éléments
total_width = w_text + 20 + main_resized.width  # 20px d'espace entre texte et main
start_x = (output_size[0] - total_width) // 2
text_y = (output_size[1] - h_text) // 2
main_y = (output_size[1] - main_resized.height) // 2

draw.text((start_x, text_y), texte, font=font, fill="black")
img_combo.paste(main_resized, (start_x + w_text + 20, main_y), main_resized)
img_combo.save("kotiz_et_main.png")

print("✅ Images générées : kotiz_seul.png, main_seule.png, kotiz_et_main.png")
