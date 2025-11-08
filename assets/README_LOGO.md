# ClickSilog Logo Assets

This directory contains logo assets for the ClickSilog restaurant ordering app.

## Logo Files

1. **logo.svg** - Full logo with text, suitable for splash screens and marketing materials
2. **icon.svg** - App icon with detailed design, includes plate, rice, egg, and fork
3. **icon-simple.svg** - Simplified app icon optimized for small sizes (recommended for app icon)

## Design Concept

The logo represents the core of ClickSilog:
- **Yellow/Gold Background**: Warm, appetizing color representing Filipino cuisine
- **White Plate**: Clean, restaurant-quality presentation
- **Garlic Rice (Yellow)**: The "log" in silog - garlic rice
- **Fried Egg (Sunny Side Up)**: The "si" in silog - fried egg
- **Orange Accents**: Fork/spoon and text - energetic, food-focused

## Usage

### For App Icon (icon-simple.svg recommended)
- Convert to PNG at multiple sizes: 192x192, 512x512, 1024x1024
- Use for `app.json` icon property
- Ensure it looks good at small sizes

### For Splash Screen
- Use logo.svg or create a version without text
- Convert to PNG at your splash screen dimensions

### Converting SVG to PNG

You can use online tools like:
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

Or use ImageMagick:
```bash
convert -background none -size 512x512 icon-simple.svg icon-512.png
```

## Color Palette

- Primary Yellow: `#FFD54F` / `#FFC107`
- Accent Orange: `#FF6F00` / `#FF8F00`
- White: `#FFFFFF`
- Egg Yellow: `#FFEB3B`
- Rice Cream: `#FFF8E1`

## Customization

All SVG files can be edited with any vector graphics editor (Inkscape, Adobe Illustrator, etc.) to:
- Adjust colors
- Modify shapes
- Add/remove elements
- Change text

