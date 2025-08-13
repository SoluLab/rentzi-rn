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
  const { open } = useWalletConnectModal();

  // Initialize WalletConnect
  useEffect(() => {
    const initWalletConnect = async () => {
      try {
        console.log('Initializing WalletConnect client...');
        const signClient = await SignClient.init({
          projectId: PROJECT_ID,
          metadata: {
            name: 'Rentzi',
            description: 'Rentzi Wallet Connection',
            url: 'https://rentzi.com',
            icons: ['https://rentzi.com/logo.png']
          }
        });

        console.log('WalletConnect client initialized successfully');
        setClient(signClient);

        // Check for existing sessions
        const activeSessions = signClient.session.getAll();
        console.log('Active sessions:', activeSessions.length);
        if (activeSessions.length > 0) {
          const latestSession = activeSessions[0];
          handleSessionUpdate(latestSession);
        }

        // Listen for session events
        signClient.on('session_update', ({ topic }) => {
          console.log('Session update event received');
          const updatedSession = signClient.session.get(topic);
          handleSessionUpdate(updatedSession);
        });

        signClient.on('session_delete', () => {
          console.log('Session deleted event received');
          resetConnection();
        });
      } catch (error) {
        console.error('WalletConnect initialization error:', error);
      }
    };

    initWalletConnect();
  }, []);

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
      if (!client) {
        console.warn('SignClient not yet initialized; proceeding with modal provider connect');
      }
      const namespaces = {
        eip155: {
          methods: ['eth_sendTransaction', 'eth_signTransaction', 'eth_sign', 'personal_sign'],
          chains: ['eip155:1'],
          events: ['chainChanged', 'accountsChanged']
        }
      } as const;

      await open();

      // Use the underlying SignClient to read the approved session once connection completes
      // Poll briefly for a new active session
      const getLatestSession = async (): Promise<SessionTypes.Struct | undefined> => {
        if (!client) return undefined;
        const sessions = client.session.getAll();
        return sessions[0];
      };

      // Wait a short time for the session to be established
      let attempts = 0;
      let latest: SessionTypes.Struct | undefined = undefined;
      while (attempts < 20) {
        latest = await getLatestSession();
        if (latest) break;
        await new Promise(r => setTimeout(r, 250));
        attempts += 1;
      }

      if (!latest) {
        throw new Error('Wallet connection not approved');
      }

      handleSessionUpdate(latest);
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    console.log('Disconnect method called');
    if (!client || !session) {
      console.warn('No active session to disconnect');
      return;
    }

    try {
      await client.disconnect({
        topic: session.topic,
        reason: { code: 6000, message: 'User disconnected' }
      });
      resetConnection();
    } catch (error) {
      console.error('WalletConnect disconnection error:', error);
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
    session
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