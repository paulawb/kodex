import base64
import hashlib
import hmac
import secrets
import time

from fastapi import Depends, Header, HTTPException, Request


def make_token(secret: str, ttl: int) -> str:
    payload = str(int(time.time()) + ttl).encode()
    sig = hmac.new(secret.encode(), payload, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(payload + b"." + sig).decode()


def verify_token(secret: str, token: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(token.encode())
        payload, sig = raw.split(b".", 1)
        expected = hmac.new(secret.encode(), payload, hashlib.sha256).digest()
        return hmac.compare_digest(sig, expected) and int(payload) > time.time()
    except Exception:
        return False


def check_password(expected: str, given: str) -> bool:
    return secrets.compare_digest(expected.encode(), given.encode())


def require_admin(request: Request, authorization: str = Header(default="")):
    settings = request.app.state.settings
    token = authorization.removeprefix("Bearer ").strip()
    if not token or not verify_token(settings.secret_key, token):
        raise HTTPException(status_code=401, detail="No autorizado")


AdminDep = Depends(require_admin)
