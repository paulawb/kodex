import os
import uuid

from fastapi import APIRouter, Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .images import InvalidImage, process_upload
from .config import Settings, load_settings
from .repository import Repository
from .schemas import LoginIn, Product, ProductIn, SettingsIn
from .security import AdminDep, check_password, make_token


def repo_dep(request: Request) -> Repository:
    return request.app.state.repo


public = APIRouter(prefix="/api")
admin = APIRouter(prefix="/api/admin", dependencies=[AdminDep])


@public.get("/health")
def health():
    return {"ok": True}


@public.get("/products", response_model=list[Product])
def products(repo: Repository = Depends(repo_dep)):
    return repo.list_products(only_active=True)


@public.get("/settings")
def public_settings(repo: Repository = Depends(repo_dep)):
    return repo.get_settings()


@public.post("/admin/login")
def login(body: LoginIn, request: Request):
    s: Settings = request.app.state.settings
    if not check_password(s.admin_password, body.password):
        raise HTTPException(401, "Contraseña incorrecta")
    return {"token": make_token(s.secret_key, s.token_ttl_seconds)}


@admin.get("/products", response_model=list[Product])
def admin_products(repo: Repository = Depends(repo_dep)):
    return repo.list_products()


@admin.post("/products", response_model=Product, status_code=201)
def create_product(body: ProductIn, repo: Repository = Depends(repo_dep)):
    return repo.create_product(body)


@admin.put("/products/{pid}", response_model=Product)
def update_product(pid: int, body: ProductIn, repo: Repository = Depends(repo_dep)):
    product = repo.update_product(pid, body)
    if not product:
        raise HTTPException(404, "Prenda no encontrada")
    return product


@admin.delete("/products/{pid}", status_code=204)
def delete_product(pid: int, repo: Repository = Depends(repo_dep)):
    if not repo.delete_product(pid):
        raise HTTPException(404, "Prenda no encontrada")


@admin.post("/upload", status_code=201)
async def upload_image(request: Request, file: UploadFile = File(...)):
    s: Settings = request.app.state.settings
    data = await file.read(s.max_upload_bytes + 1)
    if len(data) > s.max_upload_bytes:
        raise HTTPException(413, "La imagen supera el tamaño máximo")
    try:
        png = process_upload(data)
    except InvalidImage as e:
        raise HTTPException(400, str(e))
    name = f"{uuid.uuid4().hex}.png"
    with open(os.path.join(s.upload_dir, name), "wb") as f:
        f.write(png)
    return {"url": f"/uploads/{name}"}


@admin.put("/settings")
def update_settings(body: SettingsIn, repo: Repository = Depends(repo_dep)):
    repo.set_settings(body.model_dump())
    return repo.get_settings()


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or load_settings()
    app = FastAPI(title="KØDEX API")
    app.state.settings = settings
    app.state.repo = Repository(settings.db_path)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    os.makedirs(settings.upload_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
    app.include_router(public)
    app.include_router(admin)
    return app

