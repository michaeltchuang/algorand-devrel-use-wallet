"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  useNetwork: () => useNetwork,
  useWallet: () => useWallet,
  useWalletContext: () => useWalletContext,
  useWalletManager: () => useWalletManager
});
module.exports = __toCommonJS(index_exports);
var import_svelte_store = require("@tanstack/svelte-store");
var import_algosdk = __toESM(require("algosdk"), 1);
var import_svelte = require("svelte");
__reExport(index_exports, require("@txnlab/use-wallet"), module.exports);
var useWalletContext = (manager) => {
  (0, import_svelte.setContext)("walletManager", manager);
  manager.resumeSessions().catch((error) => {
    console.error("Error resuming sessions:", error);
  });
};
var useWalletManager = () => {
  const manager = (0, import_svelte.getContext)("walletManager");
  if (!manager) {
    throw new Error("useWalletManager must be used within a useWalletContext");
  }
  return manager;
};
var useNetwork = () => {
  const manager = useWalletManager();
  const activeNetwork = (0, import_svelte_store.useStore)(manager.store, (state) => state.activeNetwork);
  const activeNetworkConfig = (0, import_svelte_store.useStore)(
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
    const newClient = new import_algosdk.default.Algodv2(token, baseServer, port, headers);
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
      const newClient = new import_algosdk.default.Algodv2(token, baseServer, port, headers);
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
      const newClient = new import_algosdk.default.Algodv2(token, baseServer, port, headers);
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
  const walletStore = (0, import_svelte_store.useStore)(manager.store, (state) => state.wallets);
  const transformToWallet = (wallet) => {
    return {
      id: wallet.id,
      walletKey: wallet.walletKey,
      metadata: wallet.metadata,
      accounts: (0, import_svelte_store.useStore)(manager.store, (state) => state.wallets[wallet.walletKey]?.accounts),
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
  const activeWalletId = (0, import_svelte_store.useStore)(manager.store, (state) => state.activeWallet);
  const managerStatus = (0, import_svelte_store.useStore)(manager.store, (state) => state.managerStatus);
  const isReady = () => managerStatus.current === "ready";
  const algodClient = (0, import_svelte_store.useStore)(manager.store, (state) => state.algodClient);
  const activeWallet = () => wallets.find((w) => w.walletKey === activeWalletId.current);
  const activeWalletAccounts = (0, import_svelte_store.useStore)(
    manager.store,
    (state) => state.wallets[activeWalletId.current]?.accounts
  );
  const activeWalletAddresses = (0, import_svelte_store.useStore)(
    manager.store,
    (state) => state.wallets[activeWalletId.current]?.accounts.map((account) => account.address)
  );
  const activeAccount = (0, import_svelte_store.useStore)(
    manager.store,
    (state) => state.wallets[activeWalletId.current]?.activeAccount
  );
  const activeAddress = (0, import_svelte_store.useStore)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useNetwork,
  useWallet,
  useWalletContext,
  useWalletManager,
  ...require("@txnlab/use-wallet")
});
//# sourceMappingURL=index.cjs.map