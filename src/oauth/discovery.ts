import type { OIDCConfiguration } from "../types.js";

const cache = new Map<string, { config: OIDCConfiguration; fetchedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function fetchOIDCConfiguration(
  endpoint: string,
): Promise<OIDCConfiguration> {
  const cached = cache.get(endpoint);
  if (cached !== undefined && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.config;
  }

  const url = `${endpoint}/.well-known/openid-configuration`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch OIDC configuration from ${url}: ${res.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const config = (await res.json() as unknown) as OIDCConfiguration;
  cache.set(endpoint, { config, fetchedAt: Date.now() });
  return config;
}

/** Clear cached OIDC configuration (useful for testing) */
export function clearOIDCCache(): void {
  cache.clear();
}
