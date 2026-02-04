import { EvmProviders } from '../evm/evm-providers';
import EvmClient from '../evm/evm-client';

export default function EvmPage() {
  // Wrap the EVM demo with providers required by RainbowKit and wagmi.
  return (
    <EvmProviders>
      <EvmClient />
    </EvmProviders>
  );
}
