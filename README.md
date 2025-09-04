# TaskOn White-label Wallet Connection Demo

A TaskOn white-label demo project built with [RainbowKit](https://rainbowkit.com) + [wagmi](https://wagmi.sh) + [Next.js](https://nextjs.org/) with static deployment support.  

https://whitelabel-demo-rainbowkit.taskon.xyz/  
https://whitelabel.wode.tech/  

## Development Setup

### Install Dependencies

```bash
pnpm install
```

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

## Build and Deployment

### 1. Build Static Files

```bash
npm run build
```

After building, static files will be generated in the `out/` directory.

### 2. Deployment Options

#### 🌐 Netlify

1. Drag the `out/` directory to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your Git repository with build command `npm run build` and publish directory `out`

#### 📁 GitHub Pages

1. Push `out/` directory contents to `gh-pages` branch
2. Enable GitHub Pages in repository settings

```bash
# Example deployment script
npm run build
cd out
git init
git add -A
git commit -m "Deploy"
git push -f git@github.com:username/repo.git main:gh-pages
```

#### ☁️ AWS S3 + CloudFront

```bash
# After installing AWS CLI
npm run build
aws s3 sync out/ s3://your-bucket-name --delete
```

#### 🐋 Docker

```dockerfile
FROM nginx:alpine
COPY out/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 📦 Traditional Server

Upload `out/` directory contents to any web server that supports static files.

### 3. Deployment Configuration

The project is configured for full static export:

- `output: 'export'` - Enable static export
- `trailingSlash: true` - Ensure route compatibility
- `images: { unoptimized: true }` - Disable image optimization (required for static deployment)

### 4. Environment Variables (Optional)

To enable test networks, set the environment variable:

```bash
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

## Project Structure

```
taskon-whitelabel-demo/
├── src/
│   ├── pages/
│   │   ├── _app.tsx      # App entry, RainbowKit configuration
│   │   └── index.tsx     # Main page
│   ├── styles/           # Style files
│   └── wagmi.ts          # Wagmi configuration
├── out/                  # Build output directory (generated after build)
├── next.config.js        # Next.js configuration
└── package.json
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
