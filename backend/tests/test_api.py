import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture()
def client(tmp_path):
    s = Settings("pw", "secret", str(tmp_path / "t.db"), ["*"], str(tmp_path / "up"), 200_000)
    return TestClient(create_app(s))


def auth(client):
    t = client.post("/api/admin/login", json={"password": "pw"}).json()["token"]
    return {"Authorization": f"Bearer {t}"}


def test_store_starts_empty(client):
    assert client.get("/api/products").json() == []


def test_admin_requires_auth(client):
    assert client.get("/api/admin/products").status_code == 401
    assert client.post("/api/admin/login", json={"password": "x"}).status_code == 401


def test_admin_crud(client):
    h = auth(client)
    body = {"ref": "KDX-9", "name": "Test", "price": 1000, "sizes": ["S"],
            "colors": [{"name": "A", "hex": "#000000"}]}
    p = client.post("/api/admin/products", json=body, headers=h).json()
    body["price"] = 2000
    assert client.put(f"/api/admin/products/{p['id']}", json=body, headers=h).json()["price"] == 2000
    body["active"] = False
    client.put(f"/api/admin/products/{p['id']}", json=body, headers=h)
    assert client.get("/api/products").json() == []
    assert client.delete(f"/api/admin/products/{p['id']}", headers=h).status_code == 204
    assert client.put("/api/admin/settings", json={"whatsapp_number": "573001112233"}, headers=h).status_code == 200


# ---- Fotos ----
import io

from PIL import Image


def _jpg(size=(300, 300), bg=(240, 240, 240), fg=(180, 20, 20)):
    im = Image.new("RGB", size, bg)
    im.paste(fg, (100, 80, 200, 250))
    b = io.BytesIO(); im.save(b, "JPEG"); return b.getvalue()


def _png_alpha():
    im = Image.new("RGBA", (200, 200), (0, 0, 0, 0))
    im.paste((10, 10, 10, 255), (50, 40, 150, 160))
    b = io.BytesIO(); im.save(b, "PNG"); return b.getvalue()


def _upload(client, data, name="a.jpg"):
    return client.post("/api/admin/upload", files={"file": (name, data)}, headers=auth(client))


def _fetch(client, url):
    return Image.open(io.BytesIO(client.get(url).content)).convert("RGBA")


def test_upload_requires_auth(client):
    r = client.post("/api/admin/upload", files={"file": ("a.jpg", _jpg())})
    assert r.status_code == 401


def test_jpg_background_removed_and_cropped(client):
    r = _upload(client, _jpg())
    assert r.status_code == 201
    im = _fetch(client, r.json()["url"])
    assert abs(im.width - 100) <= 6 and abs(im.height - 170) <= 6  # recortado a la prenda
    assert im.getpixel((im.width // 2, im.height // 2))[3] == 255  # centro opaco
    assert im.getpixel((0, 0))[3] < 255  # esquina (restos de fondo) transparente/suavizada


def test_png_transparency_preserved(client):
    r = _upload(client, _png_alpha(), "a.png")
    im = _fetch(client, r.json()["url"])
    assert (im.width, im.height) == (100, 120)
    assert im.getpixel((50, 60)) == (10, 10, 10, 255)


def test_opaque_png_background_removed(client):
    im = Image.new("RGB", (200, 200), (255, 255, 255)); im.paste((0, 0, 200), (60, 60, 140, 140))
    b = io.BytesIO(); im.save(b, "PNG")
    out = _fetch(client, _upload(client, b.getvalue(), "a.png").json()["url"])
    assert out.width <= 84


def test_invalid_and_oversized_rejected(client):
    assert _upload(client, b"no soy imagen").status_code == 400
    g = io.BytesIO(); Image.new("RGB", (10, 10)).save(g, "GIF")
    assert _upload(client, g.getvalue(), "a.gif").status_code == 400
    assert _upload(client, b"0" * 300_000).status_code == 413


def test_product_with_photos(client):
    h = auth(client)
    url = _upload(client, _jpg()).json()["url"]
    body = {"ref": "K", "name": "N", "price": 1, "sizes": ["S"],
            "colors": [{"name": "A", "hex": "#000000", "front_image": url}]}
    client.post("/api/admin/products", json=body, headers=h)
    prods = client.get("/api/products").json()
    assert prods[0]["colors"][0]["front_image"] == url


# ---- Mensaje WhatsApp ----
def test_message_template_default_and_update(client):
    h = auth(client)
    assert "{items}" in client.get("/api/settings").json()["message_template"]
    tpl = "Hola KØDEX, soy {nombre} de {ciudad}:\n{items}\nTotal {total}"
    r = client.put("/api/admin/settings", json={"whatsapp_number": "573001112233", "message_template": tpl}, headers=h)
    assert r.status_code == 200
    assert client.get("/api/settings").json()["message_template"] == tpl
    bad = client.put("/api/admin/settings", json={"whatsapp_number": "573001112233", "message_template": ""}, headers=h)
    assert bad.status_code == 422


# ---- Visibilidad: sin foto no aparece nada ----
def _product(client, h, colors, **extra):
    body = {"ref": "K", "name": "N", "price": 1, "sizes": ["S"], "colors": colors, **extra}
    return client.post("/api/admin/products", json=body, headers=h).json()


def test_product_without_photo_is_hidden(client):
    h = auth(client)
    _product(client, h, [{"name": "Rojo", "hex": "#ff0000"}])
    assert client.get("/api/products").json() == []
    assert len(client.get("/api/admin/products", headers=h).json()) == 1  # el admin sí lo ve


def test_only_available_colors_with_photo_shown(client):
    h = auth(client)
    u1 = _upload(client, _jpg()).json()["url"]
    u2 = _upload(client, _jpg()).json()["url"]
    u3 = _upload(client, _jpg()).json()["url"]
    _product(client, h, [
        {"name": "Con foto", "hex": "#123456", "front_image": u1},
        {"name": "Sin foto", "hex": "#654321"},
        {"name": "Desactivado", "hex": "#abcdef", "front_image": u2, "available": False},
        {"name": "Con foto 2", "hex": "#fedcba", "front_image": u3, "back_image": u3},
    ])
    names = [c["name"] for c in client.get("/api/products").json()[0]["colors"]]
    assert names == ["Con foto", "Con foto 2"]


def test_any_hex_color_accepted_and_invalid_rejected(client):
    h = auth(client)
    ok = _product(client, h, [{"name": "Verde oliva", "hex": "#6b8e23"}])
    assert ok["colors"][0]["hex"] == "#6b8e23"
    bad = {"ref": "K", "name": "N", "price": 1, "sizes": ["S"], "colors": [{"name": "x", "hex": "rojo"}]}
    assert client.post("/api/admin/products", json=bad, headers=h).status_code == 422


def test_product_description_and_item_template(client):
    h = auth(client)
    p = _product(client, h, [{"name": "A", "hex": "#000000"}], description="Oversize, algodón 280g")
    assert p["description"] == "Oversize, algodón 280g"
    s = client.get("/api/settings").json()
    assert "{nombre}" in s["item_template"] and "Hola" in s["message_template"]
    tpl = "{n}) {nombre} - {color}/{talla} x{cantidad} = {subtotal}"
    r = client.put("/api/admin/settings", json={"whatsapp_number": "573001112233", "item_template": tpl}, headers=h)
    assert r.status_code == 200 and client.get("/api/settings").json()["item_template"] == tpl
