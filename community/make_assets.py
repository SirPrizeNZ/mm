"""Build Community listing images from captured FigJam/game evidence."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
OUT = HERE / "images"
OUT.mkdir(exist_ok=True)

FONT = Path("C:/Windows/Fonts/arial.ttf")
BOLD = Path("C:/Windows/Fonts/arialbd.ttf")


def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


def panel(draw, box, fill, radius=28, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


game = Image.open(HERE / "source" / "ten-player-views-distinct-car-colours.png").convert("RGB")
board = Image.open(HERE / "source" / "current-live-board-compact.jpg").convert("RGB")

cover = Image.new("RGB", (1920, 1080), "#111116")
d = ImageDraw.Draw(cover)
panel(d, (74, 76, 1846, 1004), "#1b1a20", 42, "#3b3940", 3)
d.text((142, 192), "MicroMachine", font=font(90, True), fill="#ffe500")
d.text((147, 402), "Shared races in FigJam", font=font(47, True), fill="white")
d.text((147, 472), "One lobby. Your own car and view.", font=font(32), fill="#d5d1db")
panel(d, (142, 565, 710, 671), "#ffe500", 22)
d.text((177, 592), "JOIN RACE", font=font(42, True), fill="#141216")
d.text((147, 754), "Arrow keys  •  Up to 10 cars", font=font(31), fill="#d5d1db")
d.text((147, 800), "Five-second start countdown", font=font(31), fill="#d5d1db")

# One unaltered game view inside a simple frame; the crop shows all ten cars.
game_view = game.crop((72, 53, 526, 407))
game_view = game_view.resize((906, 706), Image.Resampling.NEAREST)
panel(d, (875, 132, 1818, 882), "#080808", 26, "#55535c", 4)
cover.paste(game_view, (893, 153))
d.text((900, 906), "TEN CAR GRID", font=font(33, True), fill="#ffe500")
cover.save(OUT / "cover-1920x1080.png", optimize=True)

# A legible crop of the actual Figma desktop board.
board_card = board.crop((680, 467, 1070, 760))
board_image = Image.new("RGB", (1920, 1080), "#f0f0f2")
bd = ImageDraw.Draw(board_image)
bd.text((110, 95), "THE SHARED FIGJAM LOBBY", font=font(68, True), fill="#111116")
bd.text((112, 185), "Create a race once. Everyone on the board joins here.", font=font(33), fill="#37353b")
scaled = board_card.resize((1053, 791), Image.Resampling.LANCZOS)
board_image.paste(scaled, (434, 265))
board_image.save(OUT / "figjam-lobby-1920x1080.png", optimize=True)

# Simple pixel car icon inspired by the game's top-down car view.
icon = Image.new("RGBA", (128, 128), "#141318")
idraw = ImageDraw.Draw(icon)
idraw.rounded_rectangle((4, 4, 123, 123), radius=27, outline="#ffe500", width=5)
idraw.rectangle((17, 16, 28, 112), fill="#f9f9f7")
for y in (28, 52, 76, 100):
    idraw.rectangle((17, y, 28, y + 12), fill="#141318")
idraw.rounded_rectangle((50, 19, 95, 111), radius=11, fill="#f52235", outline="#ffd7da", width=3)
idraw.rectangle((55, 31, 90, 52), fill="#444b61")
idraw.rectangle((55, 79, 90, 99), fill="#90121e")
idraw.rectangle((44, 35, 51, 55), fill="#0b0b0d")
idraw.rectangle((94, 35, 101, 55), fill="#0b0b0d")
idraw.rectangle((44, 81, 51, 101), fill="#0b0b0d")
idraw.rectangle((94, 81, 101, 101), fill="#0b0b0d")
icon.save(OUT / "icon-128x128.png", optimize=True)

print({p.name: Image.open(p).size for p in sorted(OUT.glob("*.png"))})
