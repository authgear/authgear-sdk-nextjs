---
sidebar_position: 1
---

# Installation

## Requirements

- **Next.js** >= 16.0.0
- **React** >= 19.0.0
- **Node.js** >= 18

## Install the package

```bash
npm install @authgear/nextjs
```

## Authgear portal setup

Before writing any code, register your redirect URIs in the [Authgear Portal](https://portal.authgear.com/):

1. Open your project → **Applications** → select your OAuth client
2. Under **Redirect URIs**, add: `http://localhost:3000/api/auth/callback`
3. Under **Post Logout Redirect URIs**, add: `http://localhost:3000`
4. Click **Save**
