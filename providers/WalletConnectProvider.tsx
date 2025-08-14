import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import SignClient from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';

// Configure your WalletConnect project ID from walletconnect.com
const PROJECT_ID = '77aa612b54c486a8859edcc7bba0663c';

// Create the context type
interface WalletConnectContextType {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  client?: SignClient;
  session?: SessionTypes.Struct;
  provider?: any;
}

// Create the context
const WalletConnectContext = createContext<WalletConnectContextType | undefined>(undefined);

// Provider component
export function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [client, setClient] = useState<SignClient | undefined>(undefined);
  const [session, setSession] = useState<SessionTypes.Struct | undefined>(undefined);

  // Modal opener hook from WalletConnect RN modal
  const { open, isConnected: modalConnected, address: modalAddress, provider } = useWalletConnectModal();

  // Sync state from modal provider
  useEffect(() => {
    if (provider && modalConnected) {
      setIsConnected(true);
      setAddress(modalAddress);
      // Best-effort attempt to read chainId from provider session
      try {
        // @ts-ignore - provider internals are not typed for chainId access
        const ns = provider?.session?.namespaces?.eip155;
        if (ns?.chains && ns.chains[0]) {
          const parts = String(ns.chains[0]).split(":");
          const cid = parts[1];
          const parsed = /^0x/i.test(cid) ? parseInt(cid, 16) : Number(cid);
          if (!Number.isNaN(parsed)) setChainId(parsed);
        }
        // Attempt to cleanup any pending pairings to avoid core/pairing noise
        // @ts-ignore
        provider?.cleanupPendingPairings?.();
      } catch {
        // ignore
      }
    } else if (!modalConnected) {
      resetConnection();
    }
  }, [provider, modalConnected, modalAddress]);

  // Handle session update
  const handleSessionUpdate = (activeSession: SessionTypes.Struct) => {
    console.log('Handling session update:', activeSession);
    if (activeSession) {
      const [namespace] = Object.keys(activeSession.namespaces);
      const accounts = activeSession.namespaces[namespace]?.accounts ?? [];

      console.log('Accounts:', accounts);

      if (accounts.length > 0) {
        // Parse account (format: 'eip155:chainId:address')
        const parts = accounts[0].split(':');
        const accountAddress = parts[2];
        const chainIdHexOrDec = parts[1];

        setAddress(accountAddress);

        const parsedChainId = /^0x/i.test(chainIdHexOrDec)
          ? parseInt(chainIdHexOrDec, 16)
          : Number(chainIdHexOrDec);
        setChainId(parsedChainId);

        setSession(activeSession);
        setIsConnected(true);

        console.log('Session updated successfully');
      }
    }
  };

  // Connect wallet
  const connect = async () => {
    console.log('Connect method called');
    try {
      // Clear any stale sessions/pairings before opening
      try {
        // @ts-ignore
        await provider?.disconnect?.();
        // @ts-ignore
        await provider?.cleanupPendingPairings?.();
      } catch {}
      await open();
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    console.log('Disconnect method called');
    try {
      if (provider?.disconnect) {
        await provider.disconnect();
      }
    } catch (error) {
      console.error('WalletConnect disconnection error:', error);
    } finally {
      resetConnection();
    }
  };

  // Reset connection state
  const resetConnection = () => {
    console.log('Resetting connection');
    setIsConnected(false);
    setAddress(undefined);
    setChainId(undefined);
    setSession(undefined);
  };

  const contextValue: WalletConnectContextType = {
    isConnected,
    address,
    chainId,
    connect,
    disconnect,
    client,
    session,
    provider
  };

  return (
    <WalletConnectContext.Provider value={contextValue}>
      {children}
    </WalletConnectContext.Provider>
  );
}

// Custom hook for using WalletConnect
export function useWalletConnect() {
  const context = useContext(WalletConnectContext);

  if (context === undefined) {
    throw new Error('useWalletConnect must be used within a WalletConnectProvider');
  }

  return context;
}