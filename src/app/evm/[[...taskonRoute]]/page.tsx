import type { Metadata } from 'next';
import { EvmProviders } from '../evm-providers';
import EvmClient from '../evm-client';

export const metadata: Metadata = {
  title: 'EVM Wallet Demo - TaskOn Embed',
  description: 'EVM wallet login demo with TaskOn Embed SDK',
};

// Force static generation for this route
export const dynamic = 'force-static';
// Ensure dynamic params are not allowed for static export builds.
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
  // Provide an explicit static params export for output: 'export' builds.
  // Deep links are still handled at runtime via hosting rewrites to /evm/.
  // For catch-all routes, return an array with the parameter name as key
  return [{ taskonRoute: [] }];
}
