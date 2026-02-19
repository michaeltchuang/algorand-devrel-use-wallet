// src/index.ts
export * from "@txnlab/use-wallet";

// src/walletManagerPlugin.ts
import { WalletManager } from "@txnlab/use-wallet";
import { ref } from "vue";
var WalletManagerPlugin = {
  install(app, options) {
    const manager = new WalletManager(options);
    const algodClient = ref(manager.algodClient);
    const setAlgodClient = (client) => {
      algodClient.value = client;
      manager.algodClient = client;
    };
    app.provide("walletManager", manager);
    app.provide("algodClient", algodClient);
    app.provide("setAlgodClient", setAlgodClient);
    manager.resumeSessions().catch((error) => {
      console.error("Error resuming sessions:", error);
    });
  }
};

// src/useWallet.ts
import { useStore } from "@tanstack/vue-store";
import "@txnlab/use-wallet";
import "algosdk";
import { computed, inject } from "vue";
function useWallet() {
  const manager = inject("walletManager");
  const algodClient = inject("algodClient");
  if (!manager) {
    throw new Error("WalletManager plugin is not properly installed");
  }
  if (!algodClient) {
    throw new Error("Algod client not properly installed");
  }
  const managerStatus = useStore(manager.store, (state) => state.managerStatus);
  const isReady = computed(() => managerStatus.value === "ready");
  const walletStateMap = useStore(manager.store, (state) => state.wallets);
  const activeWalletId = useStore(manager.store, (state) => state.activeWallet);
  const transformToWallet = (wallet) => {
    const walletState = walletStateMap.value[wallet.walletKey];
    return {
      id: wallet.id,
      walletKey: wallet.walletKey,
      metadata: wallet.metadata,
      accounts: walletState?.accounts ?? [],
      activeAccount: walletState?.activeAccount ?? null,
      isConnected: !!walletState,
      isActive: wallet.walletKey === activeWalletId.value,
      canSignData: wallet.canSignData ?? false,
      connect: (args) => wallet.connect(args),
      disconnect: () => wallet.disconnect(),
      setActive: () => wallet.setActive(),
      setActiveAccount: (addr) => wallet.setActiveAccount(addr)
    };
  };
  const wallets = computed(() => {
    return [...manager.wallets.values()].map(transformToWallet);
  });
  const activeWallet = computed(() => {
    const wallet = activeWalletId.value ? manager.getWallet(activeWalletId.value) || null : null;
    return wallet ? transformToWallet(wallet) : null;
  });
  const activeBaseWallet = computed(() => {
    return activeWalletId.value ? manager.getWallet(activeWalletId.value) || null : null;
  });
  const activeWalletState = computed(() => {
    const wallet = activeWallet.value;
    return wallet ? walletStateMap.value[wallet.walletKey] || null : null;
  });
  const activeWalletAccounts = computed(() => {
    return activeWalletState.value?.accounts ?? null;
  });
  const activeWalletAddresses = computed(() => {
    return activeWalletAccounts.value?.map((account) => account.address) ?? null;
  });
  const activeAccount = computed(() => {
    return activeWalletState.value?.activeAccount ?? null;
  });
  const activeAddress = computed(() => {
    return activeAccount.value?.address ?? null;
  });
  const signTransactions = (txnGroup, indexesToSign) => {
    if (!activeBaseWallet.value) {
      throw new Error("No active wallet");
    }
    return activeBaseWallet.value.signTransactions(txnGroup, indexesToSign);
  };
  const transactionSigner = (txnGroup, indexesToSign) => {
    if (!activeBaseWallet.value) {
      throw new Error("No active wallet");
    }
    return activeBaseWallet.value.transactionSigner(txnGroup, indexesToSign);
  };
  const signData = (data, metadata) => {
    if (!activeBaseWallet.value) {
      throw new Error("No active wallet");
    }
    return activeBaseWallet.value.signData(data, metadata);
  };
  return {
    wallets,
    isReady,
    algodClient: computed(() => {
      if (!algodClient.value) {
        throw new Error("Algod client is undefined");
      }
      return algodClient.value;
    }),
    activeWallet,
    activeWalletAccounts,
    activeWalletAddresses,
    activeAccount,
    activeAddress,
    signData,
    signTransactions,
    transactionSigner
  };
}

// src/useNetwork.ts
import { useStore as useStore2 } from "@tanstack/vue-store";
import "@txnlab/use-wallet";
import algosdk2 from "algosdk";
import { computed as computed2, inject as inject2 } from "vue";
function useNetwork() {
  const manager = inject2("walletManager");
  const algodClient = inject2("algodClient");
  const setAlgodClient = inject2("setAlgodClient");
  if (!manager) {
    throw new Error("WalletManager plugin is not properly installed");
  }
  if (!algodClient || !setAlgodClient) {
    throw new Error("Algod client or setter not properly installed");
  }
  const activeNetwork = useStore2(manager.store, (state) => state.activeNetwork);
  const networkConfig = useStore2(manager.store, (state) => ({
    networks: { ...manager.networkConfig },
    activeNetwork: state.activeNetwork
  }));
  const activeNetworkConfig = computed2(
    () => networkConfig.value.networks[networkConfig.value.activeNetwork]
  );
  const setActiveNetwork = async (networkId) => {
    if (networkId === activeNetwork.value) {
      return;
    }
    if (!manager.networkConfig[networkId]) {
      throw new Error(`Network "${networkId}" not found in network configuration`);
    }
    console.info(`[Vue] Creating new Algodv2 client...`);
    const { algod } = manager.networkConfig[networkId];
    const { token = "", baseServer, port = "", headers = {} } = algod;
    const newClient = new algosdk2.Algodv2(token, baseServer, port, headers);
    await manager.setActiveNetwork(networkId);
    setAlgodClient(newClient);
    console.info(`[Vue] \u2705 Active network set to ${networkId}.`);
  };
  const updateAlgodConfig = (networkId, config) => {
    manager.updateAlgodConfig(networkId, config);
    manager.store.setState((state) => ({ ...state }));
    if (networkId === activeNetwork.value) {
      console.info(`[Vue] Creating new Algodv2 client...`);
      const { algod } = manager.networkConfig[networkId];
      const { token = "", baseServer, port = "", headers = {} } = algod;
      const newClient = new algosdk2.Algodv2(token, baseServer, port, headers);
      setAlgodClient(newClient);
    }
  };
  const resetNetworkConfig = (networkId) => {
    manager.resetNetworkConfig(networkId);
    manager.store.setState((state) => ({ ...state }));
    if (networkId === activeNetwork.value) {
      console.info(`[Vue] Creating new Algodv2 client...`);
      const { algod } = manager.networkConfig[networkId];
      const { token = "", baseServer, port = "", headers = {} } = algod;
      const newClient = new algosdk2.Algodv2(token, baseServer, port, headers);
      setAlgodClient(newClient);
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
}
export {
  WalletManagerPlugin,
  useNetwork,
  useWallet
};
//# sourceMappingURL=index.js.map