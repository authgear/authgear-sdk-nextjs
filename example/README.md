# Authgear Next.js Example App

A minimal Next.js app demonstrating the core features of `@authgear/nextjs`:

- Sign in / sign out via OAuth redirect (PKCE)
- Protected page showing user info (`currentUser()`)
- Protected API route with JWT verification (`verifyAccessToken()`)
- Route protection via `proxy.ts` (`createAuthgearProxy()`)

## Prerequisites

- Node.js >= 18
- An Authgear account and app — sign up at [authgear.com](https://www.authgear.com/) or use a staging tenant

## Setup

### 1. Configure your Authgear app in the portal

In the [Authgear Portal](https://portal.authgear.com/):

1. Open your project and go to **Applications** in the left sidebar.
2. Select your OAuth client (or create one with type **OIDC Client**).
3. Under **Redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/callback
   ```
4. Under **Post Logout Redirect URIs**, add:
   ```
   http://localhost:3000
   ```
5. Click **Save**.

> If you are using a staging tenant, the portal URL is [portal.authgear-staging.com](https://portal.authgear-staging.com/).

### 2. Install dependencies

From the **repo root**, build the SDK first so the local `file:..` dependency is up to date:

```bash
# In the repo root
npm install
npm run build
```

Then install the example app's dependencies:

```bash
cd example
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
AUTHGEAR_ENDPOINT=https://your-app.authgear.cloud
AUTHGEAR_CLIENT_ID=your-client-id
AUTHGEAR_CLIENT_SECRET=your-client-secret
AUTHGEAR_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=a-random-string-at-least-32-characters-long
```

| Variable | Where to find it |
|---|---|
| `AUTHGEAR_ENDPOINT` | Your Authgear app domain, e.g. `https://myapp.authgear.cloud` |
| `AUTHGEAR_CLIENT_ID` | Portal → Applications → your client → Client ID |
| `AUTHGEAR_CLIENT_SECRET` | Portal → Applications → your client → Client Secret |
| `AUTHGEAR_REDIRECT_URI` | Must match what you added in step 1 |
| `SESSION_SECRET` | Any random string ≥ 32 characters (use `openssl rand -base64 32`) |

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Usage

| Page | URL | Description |
|---|---|---|
| Home | `/` | Sign-in button if unauthenticated; redirects to dashboard if signed in |
| Dashboard | `/dashboard` | Shows user info, settings link, sign out, and API demo |
| Auth handlers | `/api/auth/[...]` | Login, callback, logout, refresh, userinfo — handled by the SDK |
| Protected API | `/api/me` | Returns `{ sub, email }` — requires a valid Bearer token |

## Running the End-to-End Test

The test uses [Playwright](https://playwright.dev/) to exercise the full sign-in → dashboard → API → sign-out flow against a real Authgear tenant.

### 1. Install Playwright browsers (first time only)

```bash
npx playwright install chromium
```

### 2. Create the test credentials file

```bash
cp .e2e.local.example .e2e.local
```

Edit `.e2e.local` with a real test user account:

```
TEST_EMAIL=your-test-user@example.com
TEST_PASSWORD=your-test-password
BASE_URL=http://localhost:3000
```

### 3. Run the test

Make sure the dev server is running (`npm run dev`), then:

```bash
node authgear-test.mjs
```

The test opens a visible browser window and logs each step. A passing run ends with `✅ All tests passed!`.
