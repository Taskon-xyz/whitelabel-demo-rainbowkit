import type { Metadata } from 'next';
import { EvmProviders } from '../evm-providers';
import EvmClient from '../evm-client';

export const metadata: Metadata = {
  title: 'EVM Wallet Demo - TaskOn Embed',
  description: 'EVM wallet login demo with TaskOn Embed SDK',
};

// Keep this route dynamic so any /evm/* deep link renders the demo.

export default function EvmCatchAllPage() {
  // Render the same EVM demo page for /evm/* deep links.
  return (
    <EvmProviders>
      <EvmClient />
    </EvmProviders>
  );
}

