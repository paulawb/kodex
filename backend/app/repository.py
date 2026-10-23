import json
import sqlite3
import threading

from .schemas import DEFAULT_TEMPLATE, Product, ProductIn

SEED = [
    ProductIn(
        ref="KDX-001", name="Sigil Tee", type="tee", graphic="sigil", price=129000,
        sizes=["S", "M", "L", "XL"],
        colors=[
            {"name": "Pitch Black", "hex": "#080808", "ink": "#d60e0e"},
            {"name": "Blood Crimson", "hex": "#8e0b0b", "ink": "#080808"},
            {"name": "Washed Charcoal", "hex": "#3a3836", "ink": "#e8d9b0"},
        ],
    ),
    ProductIn(
        ref="KDX-002", name="Fang Hoodie", type="hoodie", graphic="fang", price=249000,
        sizes=["S", "M", "L", "XL"],
        colors=[
            {"name": "Pitch Black", "hex": "#080808", "ink": "#d60e0e"},
            {"name": "Washed Charcoal", "hex": "#3a3836", "ink": "#d60e0e"},
            {"name": "Bone", "hex": "#d9ccb0", "ink": "#080808"},
        ],
    ),
    ProductIn(
        ref="KDX-003", name="Eye Tee", type="tee", graphic="eye", price=139000,
        sizes=["M", "L", "XL"],
        colors=[
            {"name": "Blood Crimson", "hex": "#8e0b0b", "ink": "#e8d9b0"},
            {"name": "Pitch Black", "hex": "#080808", "ink": "#e8d9b0"},
        ],
    ),
]


class Repository:
    """SQLite-backed store. Swap this class to change persistence."""

    def __init__(self, path: str):
        self._lock = threading.Lock()
        self._db = sqlite3.connect(path, check_same_thread=False)
        self._db.row_factory = sqlite3.Row
        with self._lock, self._db:
            self._db.execute(
                "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL)"
            )
            self._db.execute("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
            if self._db.execute("SELECT COUNT(*) FROM products").fetchone()[0] == 0:
                for p in SEED:
                    self._db.execute("INSERT INTO products (data) VALUES (?)", (p.model_dump_json(),))
            self._db.execute("INSERT OR IGNORE INTO settings VALUES ('whatsapp_number', '573000000000')")
            self._db.execute("INSERT OR IGNORE INTO settings VALUES ('currency', 'COP')")
            self._db.execute("INSERT OR IGNORE INTO settings VALUES ('message_template', ?)", (DEFAULT_TEMPLATE,))

    @staticmethod
    def _to_product(row) -> Product:
        return Product(id=row["id"], **json.loads(row["data"]))

    def list_products(self, only_active: bool = False) -> list[Product]:
        with self._lock:
            rows = self._db.execute("SELECT * FROM products ORDER BY id").fetchall()
        items = [self._to_product(r) for r in rows]
        return [p for p in items if p.active] if only_active else items

    def create_product(self, data: ProductIn) -> Product:
        with self._lock, self._db:
            cur = self._db.execute("INSERT INTO products (data) VALUES (?)", (data.model_dump_json(),))
        return Product(id=cur.lastrowid, **data.model_dump())

    def update_product(self, pid: int, data: ProductIn) -> Product | None:
        with self._lock, self._db:
            cur = self._db.execute("UPDATE products SET data=? WHERE id=?", (data.model_dump_json(), pid))
        return Product(id=pid, **data.model_dump()) if cur.rowcount else None

    def delete_product(self, pid: int) -> bool:
        with self._lock, self._db:
            return self._db.execute("DELETE FROM products WHERE id=?", (pid,)).rowcount > 0

    def get_settings(self) -> dict[str, str]:
        with self._lock:
            rows = self._db.execute("SELECT key, value FROM settings").fetchall()
        return {r["key"]: r["value"] for r in rows}

    def set_settings(self, values: dict[str, str]) -> None:
        with self._lock, self._db:
            for k, v in values.items():
                self._db.execute("INSERT OR REPLACE INTO settings VALUES (?, ?)", (k, v))
