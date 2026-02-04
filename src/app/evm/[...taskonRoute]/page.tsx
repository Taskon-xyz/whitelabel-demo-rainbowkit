import type { Metadata } from 'next';
import { EvmProviders } from '../evm-providers';
import EvmClient from '../evm-client';

export const metadata: Metadata = {
  title: 'EVM Wallet Demo - TaskOn Embed',
  description: 'EVM wallet login demo with TaskOn Embed SDK',
};

// Static export requires an explicit list of routes to generate.
// Only the paths returned by generateStaticParams will be available directly.
export const dynamicParams = false;

export default function EvmCatchAllPage() {
  // Render the same EVM demo page for /evm/* deep links.
  return (
    <EvmProviders>
      <EvmClient />
    </EvmProviders>
  );
}

export async function generateStaticParams() {
  // Pre-generate top-level paths so static export can serve /evm/* deep links.
  return [
    { taskonRoute: ['quests'] },
    { taskonRoute: ['events'] },
    { taskonRoute: ['leaderboard'] },
    { taskonRoute: ['incentives'] },
    { taskonRoute: ['benefit'] },
    { taskonRoute: ['wheelOfFortune'] },
    { taskonRoute: ['milestone'] },
  ];
}
