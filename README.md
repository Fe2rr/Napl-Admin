# NAPL Admin

Panel administrativo independiente de NAPL.

## Arquitectura
- Frontend estático servido por Cloudflare Pages: `https://napl-admin.pages.dev`.
- Repositorio del frontend: `Fe2rr/Napl-Admin` (público).
- API: `https://napl-admin-api.federicoxastro.workers.dev`.
- Catálogo operativo: JSON privado versionado en `Fe2rr/NAPL-Data/private/catalog-state.json`.
- Snapshot público: `Fe2rr/NAPL-Data/public/assets/data/catalog.json`, servido por Cloudflare Pages.
- El Worker no utiliza binding D1.
- Supabase conserva los reportes, dispositivos, visitas y ratings de la comunidad.

## Seguridad
El repositorio y la interfaz pueden ser públicos. Los datos administrativos requieren una sesión firmada por el Worker. La contraseña y los tokens permanecen en secretos del servidor; no se incluyen en el frontend.

La función `supabase/functions/admin-dashboard/index.ts` lee reportes, compatibilidad, ratings y visitas solo después de validar el token de sesión contra el Worker.

## Publicación
Cloudflare Pages publica la carpeta `public/` de este repositorio, rama `main`. Los cambios en el panel se versionan en GitHub y Pages despliega automáticamente.
