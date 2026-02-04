import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// Build the wagmi config lazily so server-side builds don't execute
// wallet SDK code that expects browser APIs (e.g., indexedDB).
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

export const createWagmiConfig = () =>
  getDefaultConfig({
    appName: 'RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains: [
      mainnet,
      polygon,
      optimism,
      arbitrum,
      base,
      ...(import.meta.env.VITE_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
    ssr: true,
  });
