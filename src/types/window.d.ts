export {};

declare global {
  interface Window {
    eternl?: any;
    cardano?: {
      eternl?: any;
      nami?: any;
      flint?: any;
      yoroi?: any;
      typhon?: any;
    };
    lucidService?: any;
    debugWallet?: () => void;
    findCorrectWallet?: () => Promise<boolean>;
    clearWalletCache?: () => Promise<boolean>;
    forceRefresh?: () => Promise<boolean>;
    setTestBalance?: (balanceADA?: number) => bigint;
    LUCID_WASM_PATH?: string;
    CARDANO_MESSAGE_SIGNING_WASM_PATH?: string;
  }
} 