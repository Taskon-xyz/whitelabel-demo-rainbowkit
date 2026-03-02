# TaskOn White-label Email Demo

This project is a minimal white-label demo for integrating `@taskon/embed` with a host-owned **Email login** flow.

The current implementation keeps only one authentication path:

- Host demo login (email)
- Fresh signature generation
- TaskOn SDK login synchronization

## Demo URLs

- Production Demo: https://whitelabel-demo-rainbowkit.taskon.xyz/
- TaskOn White-label: https://whitelabel.wode.tech/
- OAuth Service: https://generalauthservice.com/

## Development Setup

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

The app reads variables from `.env.local` first, then `.env`.

Required variables:

```bash
VITE_TASKON_BASE_URL
VITE_TASKON_CLIENT_ID
VITE_TASKON_PRIVATE_KEY
```

### Start Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to run the demo.

## Runtime Flow

1. User logs in via host email modal.
2. Host stores demo email session.
3. Email client re-signs and calls `embed.login(...)`.
4. On host logout, client calls `embed.logout({ clearAuth: true })`.
5. If iframe emits `loginRequired`, host checks session:
   - If already logged in: re-sign and login immediately.
   - If not logged in: open host login modal first.

## Build

```bash
pnpm build
pnpm preview
```

## Project Structure

```text
whitelabel-demo-rainbowkit/
├── src/
│   ├── components/
│   │   ├── EmailClient.tsx
│   │   ├── EmailModal.tsx
│   │   └── VisitTracker.tsx
│   ├── hooks/
│   │   └── useVisitTracker.ts
│   ├── pages/
│   │   └── EmailPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles/globals.css
│   └── utils.ts
├── .env
├── .env.local
└── package.json
```
