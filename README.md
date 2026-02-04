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

1. **For local development** (connecting to localhost:5173):
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   
   # .env.local will contain:
   # NEXT_PUBLIC_TASKON_BASE_URL=http://localhost:5173
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
export const config = getDefaultConfig({
  appName: 'TaskOn Wallet Demo',
  projectId: 'your-actual-project-id', // Replace this
  chains: [/*...*/],
  ssr: true,
});
```

### Start Development Server

```bash
npm run dev
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

# Build for production
pnpm build

# Output: Static files will be generated in the 'out' directory
```

The project is configured for full static export. After running `pnpm build`, deploy the `out` directory to your server.

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
2. `.env` - Default production values (committed to git)

## Project Structure

```
whitelabel-demo-rainbowkit/
├── src/
│   ├── components/
│   │   └── EmailModal.tsx  # Email login modal component
│   ├── pages/
│   │   ├── _app.tsx        # App entry, RainbowKit configuration
│   │   ├── index.tsx       # Landing page
│   │   ├── evm.tsx         # EVM wallet demo page
│   │   └── email.tsx       # Email login demo page
│   ├── styles/             # Global styles
│   ├── utils.ts            # Utility functions (signature generation)
│   └── wagmi.ts            # Wagmi configuration
├── out/                    # Build output directory (generated after build)
├── .env                    # Production environment variables
├── .env.local.example      # Local development environment template
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
