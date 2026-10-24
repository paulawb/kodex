<<<<<<< HEAD
# KØDEX - Streetwear sin reglas

Proyecto e-commerce de streetwear con frontend y backend separados bajo Arquitectura Limpia.

## Estructura
```
kodex/
├── backend/        # NestJS + TypeScript + Prisma + PostgreSQL (Clean Architecture)
├── frontend/       # Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui + Zustand
├── docker-compose.yml
└── README.md
```

## Requisitos
- Node.js 20+
- npm/pnpm/yarn
- Docker (recomendado para PostgreSQL)

## Levantar con Docker (Recomendado)
```bash
docker compose up -d
```

## Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```
API: http://localhost:4000

## Frontend
```bash
cd frontend
cp .env.example .env.local
# Edita NEXT_PUBLIC_WHATSAPP_NUMBER con tu número (código país sin +)
npm install
npm run dev
```
App: http://localhost:3000

## Variables
### backend/.env
```env
DATABASE_URL="postgresql://kodex_user:kodex_pass@localhost:5432/kodex_db?schema=public"
PORT=4000
JWT_SECRET=change_me_super_secret
ADMIN_PASSWORD=kodex_admin_2025
CORS_ORIGIN=http://localhost:3000
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567
```

## Acceso Admin
- URL: http://localhost:3000/admin/login
- Contraseña por defecto: `kodex_admin_2025` (cambiar en backend/.env)

## Funcionalidades
- Landing completa (Hero, Colección destacada, Lookbook, Newsletter, Footer)
- Tienda / Catálogo
- Ficha de producto con selector de tallas
- Carrito lateral (Zustand)
- Checkout por WhatsApp con todos los datos del pedido
- Panel Admin (CRUD de productos, protegido por contraseña)
- Arquitectura Limpia en backend (Domain / Application / Infrastructure / Presentation)
=======

>>>>>>> 72bea3cd761f388410fe6cee0355b691ef2a5ff0
