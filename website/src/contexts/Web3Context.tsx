// src/contexts/Web3Context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants/contract';

interface WindowWithEthereum extends Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
  };
}

interface Web3ContextType {
  account: string;
  isWrongNetwork: boolean;
  contract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToFlowNetwork: () => Promise<void>;
  showNotification: (message: string, type: 'error' | 'success') => void;
}

const Web3Context = createContext<Web3ContextType>({} as Web3ContextType);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string>('');
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const FLOW_TESTNET_PARAMS = {
    chainId: '0x221',
    chainName: 'EVM on Flow Testnet',
    nativeCurrency: {
      name: 'FLOW',
      symbol: 'FLOW',
      decimals: 18
    },
    rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
    blockExplorerUrls: ['https://evm-testnet.flowscan.io']
  };

  useEffect(() => {
    checkWalletConnection();
    const ethereum = (window as WindowWithEthereum).ethereum;
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      const ethereum = (window as WindowWithEthereum).ethereum;
      if (ethereum) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const showNotification = (message: string, type: 'error' | 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const initializeContract = (provider: ethers.providers.Web3Provider) => {
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setContract(contractInstance);
  };

  const checkWalletConnection = async () => {
    const ethereum = (window as WindowWithEthereum).ethereum;
    if (ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const provider = new ethers.providers.Web3Provider(ethereum);
          initializeContract(provider);
          checkNetwork();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount('');
      setContract(null);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const checkNetwork = async () => {
    const ethereum = (window as WindowWithEthereum).ethereum;
    if (ethereum) {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setIsWrongNetwork(chainId !== '0x221');
    }
  };

  const switchToFlowNetwork = async () => {
    const ethereum = (window as WindowWithEthereum).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x221' }],
      });
      setIsWrongNetwork(false);
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [FLOW_TESTNET_PARAMS],
          });
          setIsWrongNetwork(false);
        } catch (addError) {
          showNotification('Failed to add Flow network', 'error');
        }
      } else {
        showNotification('Failed to switch network', 'error');
      }
    }
  };

  const connectWallet = async () => {
    const ethereum = (window as WindowWithEthereum).ethereum;
    if (!ethereum) {
      showNotification('Please install MetaMask', 'error');
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const provider = new ethers.providers.Web3Provider(ethereum);
      initializeContract(provider);
      await checkNetwork();
      showNotification('Wallet connected successfully!', 'success');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showNotification('Failed to connect wallet', 'error');
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setContract(null);
    setIsWrongNetwork(false);
    showNotification('Wallet disconnected', 'success');
  };

  return (
    <Web3Context.Provider value={{
      account,
      isWrongNetwork,
      contract,
      connectWallet,
      disconnectWallet,
      switchToFlowNetwork,
      showNotification
    }}>
      {children}
      {notification && (
        <div 
          className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg transition-all duration-500 ${
            notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);