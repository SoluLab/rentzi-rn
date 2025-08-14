import { useWalletConnect } from '../providers/WalletConnectProvider';
import { useState } from 'react';
import { SessionTypes } from '@walletconnect/types';

export const useWalletConnectActions = () => {
  const { 
    isConnected, 
    address, 
    chainId, 
    connect, 
    disconnect,
    client,
    session 
  } = useWalletConnect();

  const [walletConnectionLoading, setWalletConnectionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced connect method with loading and error handling
  const connectWallet = async () => {
    setWalletConnectionLoading(true);
    setError(null);
    
    try {
      await connect();
    } catch (err) {
      console.error('Wallet connection failed:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Connection failed. Please try again.';
      setError(errorMessage);
    } finally {
      setWalletConnectionLoading(false);
    }
  };

  // Enhanced disconnect method with loading and error handling
  const disconnectWallet = async () => {
    setWalletConnectionLoading(true);
    setError(null);
    
    try {
      await disconnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnection failed');
    } finally {
      setWalletConnectionLoading(false);
    }
  };

  // Method to sign a message
  const signMessage = async (message: string) => {
    if (!client || !session) {
      throw new Error('No active WalletConnect session');
    }

    try {
      // This is a placeholder. Actual implementation depends on the wallet's capabilities
      const result = await client.request({
        topic: session.topic,
        chainId: `eip155:${chainId || 1}`,
        request: {
          method: 'personal_sign',
          params: [message, address]
        }
      });

      return result;
    } catch (err) {
      console.error('Message signing error:', err);
      throw err;
    }
  };

  return {
    // Connection state
    isConnected,
    address,
    chainId,
    
    // Actions
    connectWallet,
    disconnectWallet,
    signMessage,
    
    // Loading and error states
    isLoading: walletConnectionLoading,
    error
  };
};