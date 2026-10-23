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
cd backend && .venv/bin/pytest     # API, subida/recorte de fotos, plantilla
cd frontend && node --test tests/  # mensaje de WhatsApp
```

## Despliegue gratis
- **Backend**: Render (free) con `backend/render.yaml`. Define `ADMIN_PASSWORD` y `ALLOWED_ORIGINS` (URL del frontend).
  El disco free es efímero: para datos permanentes usa un volumen (Fly.io) o reemplaza `repository.py` por una BD externa (Neon/Supabase).
- **Frontend**: GitHub Pages / Netlify / Cloudflare Pages apuntando a `frontend/`. Antes de publicar edita `frontend/js/config.js` con la URL del backend.

## Fotos y colores
Solo se muestran fotos reales; sin foto no aparece nada. Por cada prenda el admin agrega los colores que quiera (selector de paleta completa o código hex), marca cuáles están **disponibles** y sube foto FRONT (obligatoria para que el color se muestre) y BACK (opcional; sin ella se oculta el botón BACK). Una prenda sin ningún color disponible con foto no aparece en la tienda.
PNG con transparencia se conserva; JPG (o PNG opaco) se recorta el fondo liso automáticamente. Máx. 8 MB. Se guardan en `UPLOAD_DIR` (efímero en Render free: usa un volumen o almacenamiento externo).

## Mensaje de WhatsApp
Editable en el admin: saludo/estructura con `{nombre}` `{ciudad}` `{items}` `{total}`, y formato de cada prenda con `{n}` `{nombre}` `{ref}` `{descripcion}` `{color}` `{talla}` `{cantidad}` `{subtotal}`. Cada prenda tiene nombre y descripción editables.

## Admin
`/admin.html`: crear/editar/borrar prendas, nombre, descripción, precios, colores y fotos, tallas, visibilidad y número de WhatsApp.
