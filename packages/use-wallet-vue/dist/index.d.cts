import * as _txnlab_use_wallet from '@txnlab/use-wallet';
import { WalletManagerConfig, WalletId, WalletKey, WalletMetadata, WalletAccount, SignMetadata, SignDataResponse, AlgodConfig } from '@txnlab/use-wallet';
export * from '@txnlab/use-wallet';
import * as vue from 'vue';
import algosdk from 'algosdk';

declare const WalletManagerPlugin: {
    install(app: any, options: WalletManagerConfig): void;
};

interface Wallet {
    id: WalletId;
    /** Unique key for this wallet instance. Used for skinned WalletConnect instances. */
    walletKey: WalletKey;
    metadata: WalletMetadata;
    accounts: WalletAccount[];
    activeAccount: WalletAccount | null;
    isConnected: boolean;
    isActive: boolean;
    connect: (args?: Record<string, any>) => Promise<WalletAccount[]>;
    disconnect: () => Promise<void>;
    setActive: () => void;
    setActiveAccount: (address: string) => void;
    canSignData: boolean;
}
declare function useWallet(): {
    wallets: vue.ComputedRef<Wallet[]>;
    isReady: vue.ComputedRef<boolean>;
    algodClient: vue.ComputedRef<algosdk.Algodv2>;
    activeWallet: vue.ComputedRef<Wallet | null>;
    activeWalletAccounts: vue.ComputedRef<WalletAccount[] | null>;
    activeWalletAddresses: vue.ComputedRef<string[] | null>;
    activeAccount: vue.ComputedRef<WalletAccount | null>;
    activeAddress: vue.ComputedRef<string | null>;
    signData: (data: string, metadata: SignMetadata) => Promise<SignDataResponse>;
    signTransactions: <T extends algosdk.Transaction[] | Uint8Array[]>(txnGroup: T | T[], indexesToSign?: number[]) => Promise<(Uint8Array | null)[]>;
    transactionSigner: (txnGroup: algosdk.Transaction[], indexesToSign: number[]) => Promise<Uint8Array[]>;
};

declare function useNetwork(): {
    activeNetwork: Readonly<vue.Ref<string, string>>;
    networkConfig: Record<string, _txnlab_use_wallet.NetworkConfig>;
    activeNetworkConfig: vue.ComputedRef<_txnlab_use_wallet.NetworkConfig>;
    setActiveNetwork: (networkId: string) => Promise<void>;
    updateAlgodConfig: (networkId: string, config: Partial<AlgodConfig>) => void;
    resetNetworkConfig: (networkId: string) => void;
};

export { type Wallet, WalletManagerPlugin, useNetwork, useWallet };
