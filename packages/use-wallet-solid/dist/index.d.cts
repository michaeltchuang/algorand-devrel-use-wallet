import * as _txnlab_use_wallet from '@txnlab/use-wallet';
import { WalletManager, NetworkId, AlgodConfig, WalletState, WalletKey, SignMetadata, SignDataResponse } from '@txnlab/use-wallet';
export * from '@txnlab/use-wallet';
import * as solid_js from 'solid-js';
import { JSX } from 'solid-js';
import algosdk from 'algosdk';

interface WalletProviderProps {
    manager: WalletManager;
    children: JSX.Element;
}
declare const WalletProvider: (props: WalletProviderProps) => JSX.Element;
declare const useWalletManager: () => WalletManager;
declare const useNetwork: () => {
    activeNetwork: solid_js.Accessor<string>;
    networkConfig: () => Record<string, _txnlab_use_wallet.NetworkConfig>;
    activeNetworkConfig: () => _txnlab_use_wallet.NetworkConfig;
    setActiveNetwork: (networkId: NetworkId | string) => Promise<void>;
    updateAlgodConfig: (networkId: string, config: Partial<AlgodConfig>) => void;
    resetNetworkConfig: (networkId: string) => void;
};
declare const useWallet: () => {
    wallets: _txnlab_use_wallet.BaseWallet[];
    isReady: solid_js.Accessor<boolean>;
    algodClient: solid_js.Accessor<algosdk.Algodv2>;
    activeWallet: () => _txnlab_use_wallet.BaseWallet | null;
    activeWalletAccounts: () => _txnlab_use_wallet.WalletAccount[] | null;
    activeWalletAddresses: () => string[] | null;
    activeWalletState: () => WalletState | null;
    activeAccount: () => _txnlab_use_wallet.WalletAccount | null;
    activeAddress: () => string | null;
    activeWalletId: solid_js.Accessor<WalletKey | null>;
    isWalletActive: (walletKey: WalletKey) => boolean;
    isWalletConnected: (walletKey: WalletKey) => boolean;
    signData: (data: string, metadata: SignMetadata) => Promise<SignDataResponse>;
    signTransactions: <T extends algosdk.Transaction[] | Uint8Array[]>(txnGroup: T | T[], indexesToSign?: number[]) => Promise<(Uint8Array | null)[]>;
    transactionSigner: (txnGroup: algosdk.Transaction[], indexesToSign: number[]) => Promise<Uint8Array[]>;
    walletStore: solid_js.Accessor<Partial<Record<WalletKey, WalletState>>>;
};

export { WalletProvider, useNetwork, useWallet, useWalletManager };
