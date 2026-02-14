from PIL import Image, ImageDraw, ImageFont
import os

def create_notebook_icon(path, size=128):
    # Create a 128x128 image with a transparent background
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Try to use a system font that has emojis, or just draw a stylish notebook shape
    # Since fonts vary, I'll draw a stylized notebook
    
    # Notebook cover
    cover_color = (63, 185, 80) # GitHub green
    d.rounded_rectangle([20, 10, 100, 118], radius=8, fill=cover_color, outline=(48, 54, 61), width=2)
    
    # "Spiral" binding
    for y in range(20, 110, 15):
        d.ellipse([10, y, 30, y+8], fill=(200, 200, 200), outline=(48, 54, 61), width=1)
        
    # Page lines or label
    d.rectangle([40, 30, 80, 45], fill=(255, 255, 255))
    for y in range(60, 100, 10):
        d.line([40, y, 85, y], fill=(255, 255, 255), width=2)

    img.save(path)
    print(f"Icon saved to {path}")

if __name__ == "__main__":
    create_notebook_icon("icon.png", 128)
