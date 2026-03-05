import "server-only";

const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
};

// IDRX API configuration - optional for testnet faucet mode
// When not configured, transaction history will return empty results
export const idrxEnv = {
  apiKey: process.env.IDRX_API_KEY || "",
  secretKey: process.env.IDRX_SECRET_KEY || "",
  baseUrl: process.env.IDRX_BASE_URL || "",
  networkChainId: process.env.IDRX_NETWORK_CHAIN_ID || "",
  networkChainIdEtherlink: process.env.IDRX_NETWORK_CHAIN_ID_ETHERLINK || "",
  isConfigured: Boolean(
    process.env.IDRX_API_KEY &&
    process.env.IDRX_SECRET_KEY &&
    process.env.IDRX_BASE_URL
  ),
};
