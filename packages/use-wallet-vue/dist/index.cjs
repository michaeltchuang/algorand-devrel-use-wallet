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
  WalletManagerPlugin: () => WalletManagerPlugin,
  useNetwork: () => useNetwork,
  useWallet: () => useWallet
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("@txnlab/use-wallet"), module.exports);

// src/walletManagerPlugin.ts
var import_use_wallet = require("@txnlab/use-wallet");
var import_vue = require("vue");
var WalletManagerPlugin = {
  install(app, options) {
    const manager = new import_use_wallet.WalletManager(options);
    const algodClient = (0, import_vue.ref)(manager.algodClient);
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
var import_vue_store = require("@tanstack/vue-store");
var import_use_wallet2 = require("@txnlab/use-wallet");
var import_algosdk = require("algosdk");
var import_vue2 = require("vue");
function useWallet() {
  const manager = (0, import_vue2.inject)("walletManager");
  const algodClient = (0, import_vue2.inject)("algodClient");
  if (!manager) {
    throw new Error("WalletManager plugin is not properly installed");
  }
  if (!algodClient) {
    throw new Error("Algod client not properly installed");
  }
  const managerStatus = (0, import_vue_store.useStore)(manager.store, (state) => state.managerStatus);
  const isReady = (0, import_vue2.computed)(() => managerStatus.value === "ready");
  const walletStateMap = (0, import_vue_store.useStore)(manager.store, (state) => state.wallets);
  const activeWalletId = (0, import_vue_store.useStore)(manager.store, (state) => state.activeWallet);
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
  const wallets = (0, import_vue2.computed)(() => {
    return [...manager.wallets.values()].map(transformToWallet);
  });
  const activeWallet = (0, import_vue2.computed)(() => {
    const wallet = activeWalletId.value ? manager.getWallet(activeWalletId.value) || null : null;
    return wallet ? transformToWallet(wallet) : null;
  });
  const activeBaseWallet = (0, import_vue2.computed)(() => {
    return activeWalletId.value ? manager.getWallet(activeWalletId.value) || null : null;
  });
  const activeWalletState = (0, import_vue2.computed)(() => {
    const wallet = activeWallet.value;
    return wallet ? walletStateMap.value[wallet.walletKey] || null : null;
  });
  const activeWalletAccounts = (0, import_vue2.computed)(() => {
    return activeWalletState.value?.accounts ?? null;
  });
  const activeWalletAddresses = (0, import_vue2.computed)(() => {
    return activeWalletAccounts.value?.map((account) => account.address) ?? null;
  });
  const activeAccount = (0, import_vue2.computed)(() => {
    return activeWalletState.value?.activeAccount ?? null;
  });
  const activeAddress = (0, import_vue2.computed)(() => {
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
    algodClient: (0, import_vue2.computed)(() => {
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
var import_vue_store2 = require("@tanstack/vue-store");
var import_use_wallet3 = require("@txnlab/use-wallet");
var import_algosdk2 = __toESM(require("algosdk"), 1);
var import_vue3 = require("vue");
function useNetwork() {
  const manager = (0, import_vue3.inject)("walletManager");
  const algodClient = (0, import_vue3.inject)("algodClient");
  const setAlgodClient = (0, import_vue3.inject)("setAlgodClient");
  if (!manager) {
    throw new Error("WalletManager plugin is not properly installed");
  }
  if (!algodClient || !setAlgodClient) {
    throw new Error("Algod client or setter not properly installed");
  }
  const activeNetwork = (0, import_vue_store2.useStore)(manager.store, (state) => state.activeNetwork);
  const networkConfig = (0, import_vue_store2.useStore)(manager.store, (state) => ({
    networks: { ...manager.networkConfig },
    activeNetwork: state.activeNetwork
  }));
  const activeNetworkConfig = (0, import_vue3.computed)(
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
    const newClient = new import_algosdk2.default.Algodv2(token, baseServer, port, headers);
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
      const newClient = new import_algosdk2.default.Algodv2(token, baseServer, port, headers);
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
      const newClient = new import_algosdk2.default.Algodv2(token, baseServer, port, headers);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WalletManagerPlugin,
  useNetwork,
  useWallet,
  ...require("@txnlab/use-wallet")
});
//# sourceMappingURL=index.cjs.map