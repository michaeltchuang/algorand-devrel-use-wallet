// src/index.ts
import { useStore } from "@tanstack/svelte-store";
import algosdk from "algosdk";
import { getContext, setContext } from "svelte";
export * from "@txnlab/use-wallet";
var useWalletContext = (manager) => {
  setContext("walletManager", manager);
  manager.resumeSessions().catch((error) => {
    console.error("Error resuming sessions:", error);
  });
};
var useWalletManager = () => {
  const manager = getContext("walletManager");
  if (!manager) {
    throw new Error("useWalletManager must be used within a useWalletContext");
  }
  return manager;
};
var useNetwork = () => {
  const manager = useWalletManager();
  const activeNetwork = useStore(manager.store, (state) => state.activeNetwork);
  const activeNetworkConfig = useStore(
    manager.store,
    (state) => state.networkConfig[activeNetwork.current]
  );
  const setActiveNetwork = async (networkId) => {
    if (networkId === activeNetwork.current) {
      return;
    }
    if (!manager.networkConfig[networkId]) {
      throw new Error(`Network "${networkId}" not found in network configuration`);
    }
    console.info(`[Svelte] Creating new Algodv2 client...`);
    const { algod } = manager.networkConfig[networkId];
    const { token = "", baseServer, port = "", headers = {} } = algod;
    const newClient = new algosdk.Algodv2(token, baseServer, port, headers);
    await manager.setActiveNetwork(networkId);
    manager.store.setState((state) => ({
      ...state,
      activeNetwork: networkId,
      algodClient: newClient
    }));
    console.info(`[Svelte] \u2705 Active network set to ${networkId}.`);
  };
  const updateAlgodConfig = (networkId, config) => {
    manager.updateAlgodConfig(networkId, config);
    if (networkId === activeNetwork.current) {
      console.info(`[Svelte] Creating new Algodv2 client...`);
      const { algod } = manager.networkConfig[networkId];
      const { token = "", baseServer, port = "", headers = {} } = algod;
      const newClient = new algosdk.Algodv2(token, baseServer, port, headers);
      manager.store.setState((state) => ({
        ...state,
        algodClient: newClient
      }));
    }
  };
  const resetNetworkConfig = (networkId) => {
    manager.resetNetworkConfig(networkId);
    if (networkId === activeNetwork.current) {
      console.info(`[Svelte] Creating new Algodv2 client...`);
      const { algod } = manager.networkConfig[networkId];
      const { token = "", baseServer, port = "", headers = {} } = algod;
      const newClient = new algosdk.Algodv2(token, baseServer, port, headers);
      manager.store.setState((state) => ({
        ...state,
        algodClient: newClient
      }));
    }
  };
  return {
    activeNetwork,
    networkConfig: manager.networkConfig,
    activeNetworkConfig,
    setActiveNetwork,
    updateAlgodConfig,
    resetNetworkConfig
  };
};
var useWallet = () => {
  const manager = useWalletManager();
  const walletStore = useStore(manager.store, (state) => state.wallets);
  const transformToWallet = (wallet) => {
    return {
      id: wallet.id,
      walletKey: wallet.walletKey,
      metadata: wallet.metadata,
      accounts: useStore(manager.store, (state) => state.wallets[wallet.walletKey]?.accounts),
      isConnected: () => !!walletStore.current[wallet.walletKey],
      isActive: () => wallet.walletKey === activeWalletId.current,
      canSignData: wallet.canSignData ?? false,
      connect: (args) => wallet.connect(args),
      disconnect: () => wallet.disconnect(),
      setActive: () => wallet.setActive(),
      setActiveAccount: (addr) => wallet.setActiveAccount(addr)
    };
  };
  const wallets = [...manager.wallets].map(transformToWallet);
  const activeWalletId = useStore(manager.store, (state) => state.activeWallet);
  const managerStatus = useStore(manager.store, (state) => state.managerStatus);
  const isReady = () => managerStatus.current === "ready";
  const algodClient = useStore(manager.store, (state) => state.algodClient);
  const activeWallet = () => wallets.find((w) => w.walletKey === activeWalletId.current);
  const activeWalletAccounts = useStore(
    manager.store,
    (state) => state.wallets[activeWalletId.current]?.accounts
  );
  const activeWalletAddresses = useStore(
    manager.store,
    (state) => state.wallets[activeWalletId.current]?.accounts.map((account) => account.address)
  );
  const activeAccount = useStore(
    manager.store,
    (state) => state.wallets[activeWalletId.current]?.activeAccount
  );
  const activeAddress = useStore(
    manager.store,
    (state) => state.wallets[activeWalletId.current]?.activeAccount?.address
  );
  const signTransactions = (txnGroup, indexesToSign) => {
    const wallet = manager.wallets.find((w) => w.walletKey === activeWalletId.current);
    if (!wallet) {
      throw new Error("No active wallet");
    }
    return wallet.signTransactions(txnGroup, indexesToSign);
  };
  const transactionSigner = (txnGroup, indexesToSign) => {
    const wallet = manager.wallets.find((w) => w.walletKey === activeWalletId.current);
    if (!wallet) {
      throw new Error("No active wallet");
    }
    return wallet.transactionSigner(txnGroup, indexesToSign);
  };
  const signData = (data, metadata) => {
    const wallet = manager.wallets.find((w) => w.walletKey === activeWalletId.current);
    if (!wallet) {
      throw new Error("No active wallet");
    }
    return wallet.signData(data, metadata);
  };
  return {
    wallets,
    isReady,
    algodClient,
    activeWallet,
    activeWalletAccounts,
    activeWalletAddresses,
    activeAccount,
    activeAddress,
    signData,
    signTransactions,
    transactionSigner
  };
};
export {
  useNetwork,
  useWallet,
  useWalletContext,
  useWalletManager
};
//# sourceMappingURL=index.js.map