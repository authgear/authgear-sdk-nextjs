import { chromium } from "playwright";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load test credentials from .e2e.local (never committed)
const __dir = dirname(fileURLToPath(import.meta.url));
const envFile = resolve(__dir, ".e2e.local");
const env = Object.fromEntries(
  readFileSync(envFile, "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => line.split("=").map((s) => s.trim()))
);

const BASE_URL = env.BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = env.TEST_EMAIL;
const TEST_PASSWORD = env.TEST_PASSWORD;

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error("❌ Missing TEST_EMAIL or TEST_PASSWORD in .e2e.local");
  console.error("   Copy .e2e.local.example to .e2e.local and fill in your credentials.");
  process.exit(1);
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

  // --- Step 5: Call /api/me ---
  console.log("\n--- Step 5: Call /api/me ---");
  await page.click("button:has-text('Call /api/me')");
  await page.waitForSelector("pre", { timeout: 8000 });
  const apiResult = await page.locator("pre").innerText();
  console.log("API result:", apiResult);

  // --- Step 6: Sign out ---
  console.log("\n--- Step 6: Sign out ---");
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
