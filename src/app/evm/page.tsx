import type { Metadata } from 'next';
import { EvmProviders } from './evm-providers';
import EvmClient from './evm-client';

export const metadata: Metadata = {
  title: 'EVM Wallet Demo - TaskOn Embed',
  description: 'EVM wallet login demo with TaskOn Embed SDK',
};

export default function EvmPage() {
  return (
    <EvmProviders>
      <EvmClient />
    </EvmProviders>
  );
}