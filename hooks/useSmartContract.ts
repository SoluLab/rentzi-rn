import { useState } from 'react';
import { createSmartContractService } from '../services/smartContractService';

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
  contractAddress: string,
  options?: {
    rpcUrl?: string;
    privateKeyHex?: string; // optional signer for write operations
    abi?: any[];
  }
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  // Create service instance
  const getContractService = () => {
    const rpcUrl = options?.rpcUrl || 'https://mainnet.infura.io/v3/your_key_here';
    return createSmartContractService({
      rpcUrl,
      contractAddress,
      contractABI: options?.abi || EXAMPLE_CONTRACT_ABI,
      privateKeyHex: options?.privateKeyHex,
    });
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
      const receipt = await contractService.writeContractData(methodName, args);
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