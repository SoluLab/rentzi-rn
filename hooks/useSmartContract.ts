import { useState } from 'react';
import type Client from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';
import { createSmartContractService } from '../services/smartContractService';
import { useWalletConnect } from '../providers/WalletConnectProvider';

// Example contract ABI (you'll replace this with your actual contract ABI)
const EXAMPLE_CONTRACT_ABI = [
  // Example ABI method
  {
    "inputs": [],
    "name": "exampleReadMethod",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const useSmartContract = (
  contractAddress: string
) => {
  const { client, session, address } = useWalletConnect();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  // Validate WalletConnect connection
  const validateConnection = () => {
    if (!client || !session) {
      throw new Error('No active WalletConnect session');
    }
    if (!address) {
      throw new Error('No wallet address connected');
    }
  };

  // Create service instance
  const getContractService = () => {
    validateConnection();
    return createSmartContractService(
      client!, 
      session!, 
      contractAddress, 
      EXAMPLE_CONTRACT_ABI
    );
  };

  // Example read method
  const fetchContractData = async (methodName: string = 'exampleReadMethod', args: any[] = []) => {
    setLoading(true);
    setError(null);

    try {
      const contractService = getContractService();
      const result = await contractService.readContractData(methodName, args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Example write method 
  const executeContractTransaction = async (
    methodName: string, 
    args: any[] = []
  ) => {
    setLoading(true);
    setError(null);

    try {
      const contractService = getContractService();
      const receipt = await contractService.writeContractData(
        methodName, 
        args,
        address!
      );
      setData(receipt);
      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchContractData,
    executeContractTransaction,
    loading,
    error,
    data
  };
};