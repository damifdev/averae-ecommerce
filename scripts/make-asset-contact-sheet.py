from pathlib import Path
from PIL import Image, ImageDraw

source = Path('/tmp/averae-assets')
files = sorted(source.glob('*.jpg'))
thumb_w, thumb_h = 240, 300
label_h = 42
cols = 3
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * thumb_w, rows * (thumb_h + label_h)), '#f6f0e6')
draw = ImageDraw.Draw(sheet)
for index, path in enumerate(files):
    image = Image.open(path).convert('RGB')
    image.thumbnail((thumb_w, thumb_h))
    x = (index % cols) * thumb_w + (thumb_w - image.width) // 2
    y = (index // cols) * (thumb_h + label_h) + (thumb_h - image.height) // 2
    sheet.paste(image, (x, y))
    label = path.stem.replace('averae-department-', '').replace('_', ' ')
    draw.text(((index % cols) * thumb_w + 8, (index // cols) * (thumb_h + label_h) + thumb_h + 10), label, fill='#382820')
sheet.save('/tmp/averae-assets/contact-sheet.jpg', quality=92)
