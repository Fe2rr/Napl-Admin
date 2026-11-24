const corsHeaders = {
  "Access-Control-Allow-Origin": "https://napl-admin.pages.dev",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization",
  "Vary": "Origin",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders, "Cache-Control": "no-store" },
  });
}

function getBackendKey(): { key: string; legacy: boolean } {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return { key: legacyKey, legacy: true };
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const key = JSON.parse(raw)?.default;
      if (typeof key === "string" && key) return { key, legacy: false };
    } catch { /* handled below */ }
  }
  throw new Error("Supabase server key is not configured.");
}

async function fetchRows(path: string, key: string, legacy: boolean) {
  const base = Deno.env.get("SUPABASE_URL");
  if (!base) throw new Error("SUPABASE_URL is not configured.");
  const headers: Record<string, string> = { apikey: key, Prefer: "count=exact" };
  if (legacy) headers.Authorization = `Bearer ${key}`;
  const response = await fetch(`${base}/rest/v1/${path}`, { headers });
  const raw = await response.text();
  let rows: unknown;
  try { rows = raw ? JSON.parse(raw) : []; }
  catch { throw new Error("Invalid database response."); }
  if (!response.ok) throw new Error("Could not read community data.");
  const range = response.headers.get("content-range") || "";
  const total = Number(range.split("/").pop());
  return { rows: Array.isArray(rows) ? rows : [], total: Number.isFinite(total) ? total : 0 };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== "GET") return json({ success:false, error:"method_not_allowed" },405);

  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ success:false, error:"admin_session_required" },401);

  try {
    const verify = await fetch("https://napl-admin-api.federicoxastro.workers.dev/api/verify-session", {
      method:"GET",
      headers:{ Authorization:auth },
      cache:"no-store",
    });
    if (!verify.ok) return json({ success:false, error:"admin_session_invalid" },401);

    const { key, legacy } = getBackendKey();
    const [link, compat, ratings, popularity] = await Promise.all([
      fetchRows("link_reports?select=id,port_id,reason,note,url,created_at,updated_at&order=created_at.desc&limit=100",key,legacy),
      fetchRows("compatibility_reports?select=id,port_id,device_id,device_name,works,status,updated_at&order=updated_at.desc&limit=100",key,legacy),
      fetchRows("rating_votes?select=id,port_id,stars,created_at,updated_at&order=created_at.desc&limit=100",key,legacy),
      fetchRows("game_popularity?select=game_key,all_time_visits,week_visits,month_visits,week_start,month_start,updated_at&order=all_time_visits.desc&limit=1000",key,legacy),
    ]);

    const visitRows = popularity.rows as Array<Record<string, unknown>>;
    const allTimeVisits = visitRows.reduce((n,r)=>n+(Number(r.all_time_visits)||0),0);
    const weekVisits = visitRows.reduce((n,r)=>n+(Number(r.week_visits)||0),0);
    const monthVisits = visitRows.reduce((n,r)=>n+(Number(r.month_visits)||0),0);

    return json({
      success:true,
      totals:{
        linkReports:link.total,
        compatibilityReports:compat.total,
        ratingVotes:ratings.total,
        gamesTracked:popularity.total,
        allTimeVisits,
        weekVisits,
        monthVisits,
      },
      reports:link.rows,
      compatibility:compat.rows,
      ratings:ratings.rows,
      popularity:popularity.rows,
    });
  } catch (error) {
    console.error("NAPL admin dashboard:", error);
    return json({ success:false, error:"community_data_unavailable" },500);
  }
});
