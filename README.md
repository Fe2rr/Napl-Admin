# NAPL Admin

Panel administrativo independiente de NAPL.

## Arquitectura
- Frontend estático, separado del sitio público.
- API: `https://napl-admin-api.federicoxastro.workers.dev`.
- Datos operativos: Cloudflare D1 existente (`napl-catalog-db`).
- No crea ni migra bases de datos.
- No contiene credenciales; el acceso se valida en el Worker.

## Publicación
Cloudflare Pages debe publicar la raíz del repositorio, sin comando de build y con rama `main`.

## Seguridad pendiente de configuración
El repositorio quedó conectado a Cloudflare Pages. Está actualmente público y debe cambiarse a **privado** desde GitHub antes de usar el panel con datos reales; la interfaz no contiene secretos y el Worker valida cada sesión.
En Cloudflare Worker `napl-admin-api`, configurar `ADMIN_ORIGIN` con el dominio exacto de Pages, además de conservar `ADMIN_PASSWORD`, `SESSION_SECRET` y `GITHUB_TOKEN`.

El panel no altera el frontend público de NAPL. La función `supabase/functions/admin-dashboard/index.ts` lee reportes, compatibilidad, ratings y visitas solo después de validar el token de sesión contra el Worker.
