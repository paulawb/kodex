import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture()
def client(tmp_path):
    s = Settings("pw", "secret", str(tmp_path / "t.db"), ["*"])
    return TestClient(create_app(s))


def auth(client):
    t = client.post("/api/admin/login", json={"password": "pw"}).json()["token"]
    return {"Authorization": f"Bearer {t}"}


def test_public_products_seeded(client):
    assert len(client.get("/api/products").json()) == 3


def test_admin_requires_auth(client):
    assert client.get("/api/admin/products").status_code == 401
    assert client.post("/api/admin/login", json={"password": "x"}).status_code == 401


def test_admin_crud(client):
    h = auth(client)
    body = {"ref": "KDX-9", "name": "Test", "price": 1000, "sizes": ["S"],
            "colors": [{"name": "A", "hex": "#000000", "ink": "#ffffff"}]}
    p = client.post("/api/admin/products", json=body, headers=h).json()
    body["price"] = 2000
    assert client.put(f"/api/admin/products/{p['id']}", json=body, headers=h).json()["price"] == 2000
    body["active"] = False
    client.put(f"/api/admin/products/{p['id']}", json=body, headers=h)
    assert len(client.get("/api/products").json()) == 3
    assert client.delete(f"/api/admin/products/{p['id']}", headers=h).status_code == 204
    assert client.put("/api/admin/settings", json={"whatsapp_number": "573001112233"}, headers=h).status_code == 200
