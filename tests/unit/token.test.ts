import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAppSessionToken } from "../../src/oauth/token.js";

const ENDPOINT = "https://test.authgear.cloud";
const REFRESH_TOKEN = "rft_test_refresh_token";

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("getAppSessionToken", () => {
  it("POSTs to /oauth2/app_session_token with refresh_token in JSON body", async () => {
    const mockResponse = {
      app_session_token: "ast_abc123",
      expire_at: "2026-03-18T12:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(mockResponse), { status: 200 }))
    );

    const result = await getAppSessionToken(ENDPOINT, REFRESH_TOKEN);

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${ENDPOINT}/oauth2/app_session_token`);
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({ "Content-Type": "application/json" });
    const body = JSON.parse(init?.body as string);
    expect(body.refresh_token).toBe(REFRESH_TOKEN);
    expect(result.app_session_token).toBe("ast_abc123");
  });

  it("returns app_session_token from response", async () => {
    const mockResponse = {
      app_session_token: "ast_abc123",
      expire_at: "2026-03-18T12:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(mockResponse), { status: 200 }))
    );

    const result = await getAppSessionToken(ENDPOINT, REFRESH_TOKEN);
    expect(result.app_session_token).toBe("ast_abc123");
    expect(result.expire_at).toBe("2026-03-18T12:00:00Z");
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Forbidden", { status: 403 }))
    );

    await expect(getAppSessionToken(ENDPOINT, REFRESH_TOKEN)).rejects.toThrow(
      "Failed to get app session token (403)"
    );
  });
});
