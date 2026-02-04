import EvmPage, { metadata } from '../page';

/**
 * Catch-all route so /evm/* paths render the same demo page.
 * This enables path-based deep links that map to iframe routes.
 *
 * For static export deployments, ensure the hosting layer rewrites
 * /evm/* back to /evm/ so the client can hydrate correctly.
 */
export { metadata };
export default EvmPage;

export function generateStaticParams() {
  // Keep static export builds happy; dynamic paths are handled at runtime.
  return [];
}
