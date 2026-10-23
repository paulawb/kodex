"""Procesamiento de fotos: PNG con transparencia se conserva; JPG (o PNG opaco) se recorta el fondo."""
import io

from PIL import Image, ImageChops, ImageDraw, ImageFilter, UnidentifiedImageError

MAX_SIDE = 1000
MARKER = (1, 2, 3)
TOLERANCE = 38


class InvalidImage(ValueError):
    pass


def _has_transparency(img: Image.Image) -> bool:
    if img.mode not in ("RGBA", "LA"):
        return False
    return img.getchannel("A").getextrema()[0] < 250


def remove_background(img: Image.Image) -> Image.Image:
    """Flood-fill desde los bordes (fondo liso de estudio) y deja alfa suavizado."""
    rgb = img.convert("RGB")
    work = rgb.copy()
    w, h = work.size
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for seed in seeds:
        if work.getpixel(seed) != MARKER:
            ImageDraw.floodfill(work, seed, MARKER, thresh=TOLERANCE)
    r, g, b = work.split()
    # píxeles que quedaron exactamente en el marcador = fondo
    is_bg = [ch.point(lambda v, m=m: 255 if v == m else 0) for ch, m in zip((r, g, b), MARKER)]
    marker_mask = ImageChops.multiply(ImageChops.multiply(is_bg[0], is_bg[1]), is_bg[2])
    alpha = ImageChops.invert(marker_mask).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def process_upload(data: bytes) -> bytes:
    """Devuelve un PNG con transparencia, recortado al contenido y limitado a MAX_SIDE."""
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except (UnidentifiedImageError, OSError) as e:
        raise InvalidImage("Archivo de imagen inválido") from e
    fmt = img.format
    if fmt not in ("PNG", "JPEG"):
        raise InvalidImage("Solo se permiten PNG o JPG")
    img.thumbnail((MAX_SIDE, MAX_SIDE))
    if fmt == "PNG" and _has_transparency(img):
        out = img.convert("RGBA")
    else:
        out = remove_background(img)
    bbox = out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bbox:
        raise InvalidImage("No se detectó prenda en la imagen")
    out = out.crop(bbox)
    buf = io.BytesIO()
    out.save(buf, "PNG", optimize=True)
    return buf.getvalue()
