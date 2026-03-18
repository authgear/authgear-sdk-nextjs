import { chromium } from "playwright";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

// Load test credentials from .e2e.local (never committed)
const __dir = dirname(fileURLToPath(import.meta.url));
const envFile = resolve(__dir, ".e2e.local");
const env = Object.fromEntries(
  readFileSync(envFile, "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => line.split("=").map((s) => s.trim()))
);

// Load SESSION_SECRET from .env.local (used to decrypt/encrypt session cookie in tests)
const appEnvFile = resolve(__dir, ".env.local");
const appEnv = Object.fromEntries(
  readFileSync(appEnvFile, "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => line.split("=").map((s) => s.trim()))
);

const BASE_URL = env.BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = env.TEST_EMAIL;
const TEST_PASSWORD = env.TEST_PASSWORD;
const SESSION_SECRET = appEnv.SESSION_SECRET;

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error("❌ Missing TEST_EMAIL or TEST_PASSWORD in .e2e.local");
  console.error("   Copy .e2e.local.example to .e2e.local and fill in your credentials.");
  process.exit(1);
}

if (!SESSION_SECRET) {
  console.error("❌ Missing SESSION_SECRET in .env.local");
  process.exit(1);
}

// Mirrors src/session/cookie.ts — used only in tests to inspect/manipulate the session cookie
const COOKIE_ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_SALT = "authgear-nextjs-session";

function deriveKey(secret) {
  return scryptSync(secret, KEY_SALT, 32);
}

function decryptSessionCookie(encrypted, secret) {
  const key = deriveKey(secret);
  const buf = Buffer.from(encrypted, "base64url");
  const iv = buf.subarray(0, IV_LEN);
  const authTag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(COOKIE_ALGO, key, iv, { authTagLength: TAG_LEN });
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}

function encryptSessionCookie(data, secret) {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(COOKIE_ALGO, key, iv, { authTagLength: TAG_LEN });
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // --- Step 1: Home page (unauthenticated) ---
  console.log("--- Step 1: Home page ---");
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  console.log("Title:", await page.title());
  console.log("Body:", (await page.innerText("body")).slice(0, 200));

  // --- Step 2: Sign in ---
  console.log("\n--- Step 2: Click Sign In ---");
  await page.click("button:has-text('Sign In')");
  await page.waitForURL(/authgear/, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
  console.log("On Authgear login page");

  console.log("\n--- Step 3: Fill credentials ---");
  await page.fill('input[name="q_login_id"]', TEST_EMAIL);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.locator('input[type="password"]').first().waitFor({ timeout: 8000 });
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // --- Step 4: Dashboard ---
  console.log("\n--- Step 4: Dashboard ---");
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
  console.log("On dashboard:", page.url());
  console.log("Content:\n", (await page.innerText("body")).slice(0, 600));

  // --- Step 5: Refresh token rotation ---
  // Simulate an expired access token by rewriting the session cookie with expiresAt in the past.
  // On the next dashboard load, currentUser() will refresh and — if rotation is enabled —
  // the server returns a new refresh token that must be persisted to the cookie.
  console.log("\n--- Step 5: Refresh token rotation ---");
  const cookiesBefore = await context.cookies();
  const sessionBefore = cookiesBefore.find((c) => c.name === "authgear.session");
  if (!sessionBefore) throw new Error("No session cookie found after login");

  const dataBefore = decryptSessionCookie(sessionBefore.value, SESSION_SECRET);
  const originalRefreshToken = dataBefore.refreshToken;
  console.log("Original refresh token (first 12 chars):", originalRefreshToken?.slice(0, 12) + "…");

  // Force the access token to appear expired
  const expiredSession = encryptSessionCookie(
    { ...dataBefore, expiresAt: Math.floor(Date.now() / 1000) - 60 },
    SESSION_SECRET,
  );
  await context.addCookies([{ ...sessionBefore, value: expiredSession }]);

  // Navigate to dashboard — triggers currentUser() → token refresh
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState("networkidle");

  const cookiesAfter = await context.cookies();
  const sessionAfter = cookiesAfter.find((c) => c.name === "authgear.session");
  if (!sessionAfter) throw new Error("Session cookie missing after refresh");

  const dataAfter = decryptSessionCookie(sessionAfter.value, SESSION_SECRET);
  const newRefreshToken = dataAfter.refreshToken;
  console.log("New refresh token     (first 12 chars):", newRefreshToken?.slice(0, 12) + "…");

  if (newRefreshToken === originalRefreshToken) {
    throw new Error(
      "Refresh token was NOT rotated — either rotation is disabled on the server, or the rotated token was not persisted to the cookie",
    );
  }
  console.log("✓ Refresh token rotated and persisted to cookie");

  // Dashboard should still show user info (new tokens are valid)
  const dashContent = (await page.innerText("body")).slice(0, 600);
  if (!dashContent.includes(TEST_EMAIL)) {
    throw new Error("Dashboard did not show user info after token rotation");
  }
  console.log("✓ Dashboard still authenticated after rotation");

  // --- Step 6a: Open Account Settings via getOpenURL ---
  console.log("\n--- Step 6a: Open Account Settings ---");
  const [newTab] = await Promise.all([
    page.waitForEvent("popup", { timeout: 15000 }),
    page.click("button:has-text('Account Settings')"),
  ]);
  await newTab.waitForLoadState("networkidle");
  const settingsURL = newTab.url();
  console.log("Settings URL:", settingsURL);
  if (
    !settingsURL.includes("response_type=none") ||
    !settingsURL.includes("/settings")
  ) {
    throw new Error(`Unexpected settings URL: ${settingsURL}`);
  }
  console.log("✓ Account Settings opened in new tab with pre-auth URL");
  await newTab.close();

  // --- Step 7: Call /api/me ---
  console.log("\n--- Step 7: Call /api/me ---");
  await page.click("button:has-text('Call /api/me')");
  await page.waitForSelector("pre", { timeout: 8000 });
  const apiResult = await page.locator("pre").innerText();
  console.log("API result:", apiResult);

  // --- Step 8: Sign out ---
  console.log("\n--- Step 8: Sign out ---");
  await page.click("button:has-text('Sign Out')");
  await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
  console.log("After logout URL:", page.url());
  console.log("Home:", (await page.innerText("body")).slice(0, 200));

  await browser.close();
  console.log("\n✅ All tests passed!");
}

main().catch((err) => {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
});
