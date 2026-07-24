export async function verifySupabaseAccessToken(accessToken?: string) {
  if (!accessToken) return null;
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { id?: string };
  return payload.id || null;
}
