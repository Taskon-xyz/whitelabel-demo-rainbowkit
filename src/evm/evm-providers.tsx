import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { createWagmiConfig } from '../wagmi';

const client = new QueryClient();

export function EvmProviders({ children }: { children: React.ReactNode }) {
  // Create wagmi config on the client to avoid SSR evaluation issues.
  const config = useMemo(() => createWagmiConfig(), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}