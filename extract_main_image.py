from PIL import Image

# Charger le logo complet
logo_path = "logo_complet.png"
logo = Image.open(logo_path).convert("RGBA")

# Définir la zone de découpe pour la main (left, upper, right, lower)
# Tu dois ajuster ces valeurs selon la position de la main dans ton logo
box = (100, 50, 300, 250)  # exemple : à modifier selon ton image

# Découper la main
main_only = logo.crop(box)

# Sauvegarder
main_only.save("main_seule.png")

print("✅ Image générée : main_seule.png")
