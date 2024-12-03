import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BiWallet } from "react-icons/bi";

const AVALANCHE_MAINNET_PARAMS = {
  chainId: "0xA86A",
  chainName: "Avalanche C-Chain",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://snowtrace.io/"],
};

function MetaMaskConnector({ onConnect }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedConnectionStatus = localStorage.getItem("isWalletConnected");
    if (savedConnectionStatus === "true") {
      checkConnection();
    }

    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const accountAddress = accounts[0].address;
          setAccount(accountAddress);
          setIsConnected(true);

          const balance = await provider.getBalance(accountAddress);
          const formattedBalance = ethers.formatEther(balance);

          localStorage.setItem("isWalletConnected", "true");

          if (onConnect) onConnect(accountAddress, formattedBalance);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error("Failed to connect:", err);
        setError("An error occurred while checking connection.");
      }
    } else {
      setError("MetaMask is not installed.");
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        await checkConnection();
      } catch (err) {
        console.error("Failed to connect wallet:", err);
        setError("Failed to connect wallet. Please try again.");
      }
    } else {
      setError(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
    }
  };

  const handleChainChanged = async (newChainId) => {
    if (newChainId !== AVALANCHE_MAINNET_PARAMS.chainId) {
      setError("Please switch to the Avalanche network.");
    }
    checkConnection();
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount(null);
      localStorage.removeItem("isWalletConnected");
    } else {
      setAccount(accounts[0]);
      checkConnection();
    }
  };

  return (
    <div>
      {!isConnected ? (
        <button
          className="flex bg-blue-500 p-2 rounded-lg text-white hover:bg-blue-400 justify-around gap-x-2"
          onClick={connectWallet}
        >
          <BiWallet className="mt-1" />
          <span>Connect Wallet</span>
        </button>
      ) : (
        <div className="flex space-x-4 items-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all">
            <img
              src="https://cryptologos.cc/logos/avalanche-avax-logo.png"
              alt="Avalanche"
              className="h-6 w-6"
            />
            <span className="font-medium text-gray-900">Avalanche</span>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all">
            <span className="font-medium text-gray-900" title={account}>
              {account.length > 10
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : account}
            </span>
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg text-white"
            onClick={() => handleAccountsChanged([])}
          >
            Disconnect
          </button>
        </div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default MetaMaskConnector;
