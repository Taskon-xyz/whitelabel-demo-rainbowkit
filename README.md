# TaskOn White-label Wallet Connection Demo

A TaskOn white-label demo project built with [RainbowKit](https://rainbowkit.com) + [wagmi](https://wagmi.sh) + React + Vite. The app runs as a client-side SPA, and the parent URL is synced with the embedded TaskOn route so deep links can be shared.

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

1. **For local development** (connecting to a local embed or custom host):
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   
   # .env.local will contain:
   # VITE_TASKON_BASE_URL=http://localhost:5173
   ```

2. **For production** (connecting to https://whitelabel.wode.tech):
   - The `.env` file is already configured with production URLs
   - No action needed unless you want to override

> **Note**: `.env.local` takes precedence over `.env` when both exist

### Configure WalletConnect

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project to get your Project ID
3. Replace `YOUR_PROJECT_ID` in `src/wagmi.ts`:

```typescript
const projectId = 'your-actual-project-id';
```

### Start Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to see the result.

## Routing & Deep Links

This demo uses `BrowserRouter` and syncs the TaskOn iframe route into the parent URL using path segments (no query params). If you deploy to a static host, make sure unknown routes fall back to `index.html` so `/email`, `/evm`, and nested TaskOn paths load correctly.

## OAuth Configuration

The TaskOn white-label solution uses a universal OAuth authorization service for social login integrations.

### OAuth Service URL
```
https://generalauthservice.com/
```

### OAuth Provider Configuration

When setting up OAuth applications for your white-label deployment, configure the following callback URLs in each provider's developer console:

#### Twitter/X
- **Callback URL**: `https://generalauthservice.com/callback/twitter`
- **Developer Console**: [https://developer.twitter.com/en/apps](https://developer.twitter.com/en/apps)

#### Discord
- **Redirect URI**: `https://generalauthservice.com/callback/discord`
- **Developer Portal**: [https://discord.com/developers/applications](https://discord.com/developers/applications)

#### Telegram
- **Domain**: `generalauthservice.com`
- **Bot Father**: [@BotFather](https://t.me/botfather)

#### Reddit
- **Redirect URI**: `https://generalauthservice.com/callback/reddit`
- **App Preferences**: [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)

#### YouTube/Google
- **Authorized redirect URI**: `https://generalauthservice.com/callback/youtube`
- **Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)

### OAuth Flow
1. User initiates OAuth login from your white-label site
2. Request is routed through the general auth service
3. User completes authentication with the social provider
4. Provider redirects to `https://generalauthservice.com/callback/{provider}`
5. Auth service redirects back to your white-label site with credentials

## Build and Preview

### Build Commands

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Preview the build locally
pnpm preview
```

The production build output is generated in the `dist` directory.

## Environment Variables

### Available Environment Variables:

```bash
# TaskOn SDK Configuration
VITE_TASKON_BASE_URL  # TaskOn iframe URL (default: https://whitelabel.wode.tech)
VITE_TASKON_CLIENT_ID # Client ID for authentication
VITE_TASKON_PRIVATE_KEY # RSA private key for signing demo logins

# Test Networks
VITE_ENABLE_TESTNETS=true  # Enable test networks
```

### Environment Files Priority:
1. `.env.local` - Local overrides (git ignored)
2. `.env` - Default production values (committed to git)

## Project Structure

```
whitelabel-demo-rainbowkit/
├── index.html
├── src/
│   ├── components/
│   │   ├── EmailClient.tsx     # TaskOn embed wrapper for email demo
│   │   ├── EmailModal.tsx      # Email login modal component
│   │   └── VisitTracker.tsx    # Track visits for analytics
│   ├── evm/
│   │   ├── evm-client.tsx      # TaskOn embed wrapper for EVM demo
│   │   └── evm-providers.tsx   # wagmi + RainbowKit providers
│   ├── hooks/
│   │   └── useVisitTracker.ts  # Shared visit tracking hook
│   ├── pages/
│   │   ├── HomePage.tsx        # Landing page
│   │   ├── EmailPage.tsx       # Email demo page
│   │   └── EvmPage.tsx         # EVM demo page
│   ├── styles/                 # Global styles
│   ├── App.tsx                 # SPA routes
│   ├── main.tsx                # Vite entry
│   ├── utils.ts                # Signature helpers
│   └── wagmi.ts                # Wagmi configuration
├── dist/                       # Vite build output
├── .env                    # Production environment variables
├── .env.local.example      # Local development environment template
├── tailwind.config.js
└── vite.config.ts
```

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Wallet Connection**: RainbowKit 2.2+
- **Ethereum Interaction**: wagmi 2.15+
- **Query Management**: TanStack Query 5.55+
- **Type Support**: TypeScript 5.5+

## Supported Wallets

- MetaMask
- All wallets supporting WalletConnect protocol
- Coinbase Wallet
- Rainbow Wallet
- And more...

## Learn More

- [RainbowKit Documentation](https://rainbowkit.com) - Learn how to customize your wallet connection flow
- [wagmi Documentation](https://wagmi.sh) - Learn how to interact with Ethereum
- [Vite Documentation](https://vitejs.dev/) - Learn how to build React + Vite applications
- [React Router Documentation](https://reactrouter.com/) - Learn how to handle client-side routing
