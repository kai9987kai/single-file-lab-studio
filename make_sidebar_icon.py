from PIL import Image, ImageDraw

def create_sidebar_mask(path, size=24):
    # Create a 24x24 image with a transparent background
    # VS Code Activity Bar icons should be monochromatic (usually white) and use transparency for masking
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Draw a simple monochromatic notebook silhouette (white)
    # Scaled for 24x24
    
    # Notebook cover (white)
    d.rounded_rectangle([4, 2, 20, 22], radius=2, fill=(255, 255, 255, 255))
    
    # Binding holes (transparent)
    for y in range(4, 20, 4):
        d.ellipse([2, y, 6, y+2], fill=(255, 255, 255, 0))
        
    # Page lines (transparent)
    for y in range(8, 18, 4):
        d.line([8, y, 16, y], fill=(255, 255, 255, 0), width=1)

    img.save(path)
    print(f"Sidebar mask saved to {path}")

if __name__ == "__main__":
    create_sidebar_mask("media/sidebar-icon.png", 24)
