import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    admin_password: str
    secret_key: str
    db_path: str
    allowed_origins: list[str]
    upload_dir: str = "uploads"
    max_upload_bytes: int = 8 * 1024 * 1024
    token_ttl_seconds: int = 60 * 60 * 8


def load_settings() -> Settings:
    origins = os.getenv("ALLOWED_ORIGINS", "*")
    return Settings(
        admin_password=os.getenv("ADMIN_PASSWORD", "kodex-change-me"),
        secret_key=os.getenv("SECRET_KEY", "dev-secret-change-me"),
        db_path=os.getenv("DB_PATH", "kodex.db"),
        allowed_origins=[o.strip() for o in origins.split(",") if o.strip()],
        upload_dir=os.getenv("UPLOAD_DIR", "uploads"),
    )
