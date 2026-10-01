"""生成社交分享卡片 static/img/og-cover.png（1200x630）。

用法：
    python tools/build-og-cover.py
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "static" / "img" / "logo.png"
OUTPUT = ROOT / "static" / "img" / "og-cover.png"

WIDTH, HEIGHT = 1200, 630
BG_TOP = (26, 26, 46)
BG_BOTTOM = (52, 30, 92)
ACCENT = (116, 123, 255)
TITLE_FONT = "C:/Windows/Fonts/msyhbd.ttc"
BODY_FONT = "C:/Windows/Fonts/msyh.ttc"
LATIN_FONT = "C:/Windows/Fonts/arial.ttf"


def make_background() -> Image.Image:
    """构建由上到下的深色渐变背景并叠加右上角光晕。

    Returns:
        Image.Image: 尺寸为 WIDTH x HEIGHT 的 RGB 图像。
    """
    base = Image.new("RGB", (WIDTH, HEIGHT), BG_TOP)
    draw = ImageDraw.Draw(base)
    for y in range(HEIGHT):
        ratio = y / (HEIGHT - 1)
        eased = ratio**0.85
        color = tuple(
            round(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * eased) for i in range(3)
        )
        draw.line([(0, y), (WIDTH, y)], fill=color)

    cx, cy, radius = WIDTH - 190, 150, 340
    mask = _radial_mask(WIDTH, HEIGHT, cx, cy, radius)
    glow = Image.new("RGB", (WIDTH, HEIGHT), ACCENT)
    return Image.composite(glow, base, mask.point(lambda v: round(v * 0.55)))


def _radial_mask(width: int, height: int, cx: int, cy: int, radius: int) -> Image.Image:
    """构造用于叠加光晕的径向遮罩。

    Args:
        width: 画布宽度。
        height: 画布高度。
        cx: 光晕圆心横坐标。
        cy: 光晕圆心纵坐标。
        radius: 光晕半径。

    Returns:
        Image.Image: L 模式的遮罩图像。
    """
    mask = Image.new("L", (width, height), 0)
    pixels = mask.load()
    for y in range(height):
        for x in range(width):
            distance = math.hypot(x - cx, y - cy)
            if distance >= radius:
                continue
            pixels[x, y] = round(255 * (1 - distance / radius) ** 1.8)
    return mask


def draw_logo(canvas: Image.Image, center: tuple[int, int], size: int) -> None:
    """把圆形 logo 以叠加方式绘制到画布上。

    Args:
        canvas: 目标画布。
        center: 圆形中心坐标。
        size: 圆形直径。
    """
    logo = Image.open(LOGO).convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    ring = Image.new("RGBA", (size + 16, size + 16), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse(
        [0, 0, size + 15, size + 15], outline=ACCENT + (140,), width=3
    )
    canvas.paste(logo, (center[0] - size // 2, center[1] - size // 2), mask)
    canvas.paste(
        ring,
        (center[0] - size // 2 - 8, center[1] - size // 2 - 8),
        ring,
    )


def main() -> None:
    """渲染并保存社交分享卡片。"""
    canvas = make_background()
    draw = ImageDraw.Draw(canvas)

    draw_logo(canvas, (WIDTH // 2, 208), 208)

    title = ImageFont.truetype(TITLE_FONT, 96)
    body = ImageFont.truetype(BODY_FONT, 34)
    motto = ImageFont.truetype(LATIN_FONT, 30)

    _centered(draw, "KD_klin", 372, title, (255, 255, 255))
    _centered(draw, "个人主页 · 全栈学习中", 504, body, (206, 206, 226))
    _centered(
        draw,
        "The only way to do great is to love what you do.",
        560,
        motto,
        (140, 145, 220),
    )

    canvas.save(OUTPUT, optimize=True)
    print(f"written: {OUTPUT} {canvas.size}")


def _centered(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
) -> None:
    """在画布水平居中绘制一行文本。

    Args:
        draw: 绘制上下文。
        text: 文本内容。
        y: 文本顶端纵坐标。
        font: 字体。
        fill: 颜色。
    """
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    draw.text(
        ((WIDTH - (right - left)) / 2 - left, y - top),
        text,
        font=font,
        fill=fill,
    )


if __name__ == "__main__":
    main()
