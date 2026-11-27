# NAPL Admin

Panel administrativo independiente de NAPL.

## Arquitectura
- Frontend estático servido por Cloudflare Pages: `https://napl-admin.pages.dev`.
- Repositorio del frontend: `Fe2rr/Napl-Admin`.
- API administrativa y datos comunitarios: `https://napl-prueba.vercel.app/api`.
- Catálogo operativo: `Fe2rr/NAPL-Data/private/catalog-state.json`.
- Snapshot público: `Fe2rr/NAPL-Data/public/assets/data/catalog.json`, servido por Cloudflare Pages.
- Neon PostgreSQL almacena ratings, dispositivos, visitas, compatibilidad y reportes.
- GitHub Actions ejecuta la sincronización del catálogo.

## Seguridad
La interfaz y el repositorio pueden ser públicos. Las operaciones administrativas requieren una sesión firmada por el backend. La contraseña, claves de Neon, GitHub y Discord permanecen exclusivamente en variables de entorno del servidor.

## Publicación
Cloudflare Pages publica la carpeta `public/` de este repositorio, rama `main`. Los cambios en el panel se versionan en GitHub y Pages despliega automáticamente.
