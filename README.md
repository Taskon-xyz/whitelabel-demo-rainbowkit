# TaskOn White-label Wallet Connection Demo

A TaskOn white-label demo project built with [RainbowKit](https://rainbowkit.com) + [wagmi](https://wagmi.sh) + [Next.js](https://nextjs.org/) with static deployment support.

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

- **Testnet / development**: `.env.test` (default values included). The default `pnpm dev` and `pnpm run build:test` commands load this file automatically.
- **Production**: `.env.production` (default values included). `pnpm run build:prod` and `pnpm run export:prod` load this file.
- **Overrides**: Copy either file to `.env.local` if you need local-only tweaks; `.env.local` takes precedence over the base files.

### Configure WalletConnect

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project to get your Project ID
3. Replace `YOUR_PROJECT_ID` in `src/wagmi.ts`:

```typescript
export const config = getDefaultConfig({
  appName: 'TaskOn Wallet Demo',
  projectId: 'your-actual-project-id', // Replace this
  chains: [/*...*/],
  ssr: true,
});
```

### Start Development Server

```bash
pnpm dev           # uses .env.test by default
# pnpm run dev:prod # optional: run dev server against production env vars
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

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

## Build and Deployment

### Build Commands

```bash
# Install dependencies
pnpm install

# Testnet build (uses .env.test)
pnpm run build:test

# Production build (uses .env.production)
pnpm run build:prod

# Output: Static files will be generated in the 'out' directory
```

The project is configured for full static export. After running one of the build commands, deploy the `out` directory to your server. If you prefer to run the explicit export step, use `pnpm run export:test` or `pnpm run export:prod`.

## Environment Variables

### Available Environment Variables:

```bash
# TaskOn SDK Configuration
NEXT_PUBLIC_TASKON_BASE_URL  # TaskOn iframe URL (default: https://whitelabel.wode.tech)
NEXT_PUBLIC_TASKON_CLIENT_ID # Client ID for authentication

# Test Networks
NEXT_PUBLIC_ENABLE_TESTNETS=true  # Enable test networks
```

### Environment Files Priority:
1. `.env.local` - Local overrides (git ignored)
2. `.env.test` or `.env.production` - Loaded automatically by the scripts based on the command you run
3. `.env` - Placeholder for documentation only

## Project Structure

```
whitelabel-demo-rainbowkit/
├── src/
│   ├── app/
│   │   ├── email/
│   │   ├── evm/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── hooks/
│   ├── styles/
│   ├── utils.ts            # Utility functions (signature generation)
│   └── wagmi.ts            # Wagmi configuration
├── scripts/
│   └── with-env.js         # Helper to inject env files into Next.js commands
├── out/                    # Build output directory (generated after build)
├── .env                    # Placeholder pointing to environment-specific files
├── .env.test               # Testnet/dev environment variables
├── .env.production         # Production environment variables
├── next.config.js          # Next.js configuration
└── package.json            # Project dependencies
```

## Tech Stack

- **Framework**: Next.js 15
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
- [Next.js Documentation](https://nextjs.org/docs) - Learn how to build Next.js applications
