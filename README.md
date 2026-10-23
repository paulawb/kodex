# KØDEX

Tienda 3D tribal-dark con rack virtual, personalizador de prendas, carrito y pedido por WhatsApp.

```
backend/   API Python (FastAPI + SQLite): rutas públicas/admin, auth HMAC, repositorio desacoplado
frontend/  Sitio estático (HTML/CSS/JS): index.html (tienda) y admin.html (panel)
```

## Local
```bash
cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
ADMIN_PASSWORD=miclave SECRET_KEY=algo-largo .venv/bin/uvicorn app.main:create_app --factory --reload
cd frontend && python3 -m http.server 5500     # http://localhost:5500  ·  /admin.html
cd backend && .venv/bin/pytest
```

## Despliegue gratis
- **Backend**: Render (free) con `backend/render.yaml`. Define `ADMIN_PASSWORD` y `ALLOWED_ORIGINS` (URL del frontend).
  El disco free es efímero: para datos permanentes usa un volumen (Fly.io) o reemplaza `repository.py` por una BD externa (Neon/Supabase).
- **Frontend**: GitHub Pages / Netlify / Cloudflare Pages apuntando a `frontend/`. Antes de publicar edita `frontend/js/config.js` con la URL del backend.

## Admin
`/admin.html`: crear/editar/borrar prendas, precios, colores (tela + tinta), tallas, visibilidad y número de WhatsApp.
