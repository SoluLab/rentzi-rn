import { Contract, JsonRpcProvider, Wallet, type Signer } from 'ethers';

type TransactionOverrides = {
  value?: bigint;
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
};

// Ethers-based smart contract interaction service (no WalletConnect)
export class SmartContractService {
  private readonly provider: JsonRpcProvider;
  private readonly signer?: Signer;
  private readonly contract: Contract;

  constructor(params: {
    rpcUrl: string;
    contractAddress: string;
    contractABI: any[];
    privateKeyHex?: string; // optional; if provided enables write calls
    signer?: Signer; // optional external signer
  }) {
    const { rpcUrl, contractAddress, contractABI, privateKeyHex, signer } = params;

    this.provider = new JsonRpcProvider(rpcUrl);
    this.signer = signer ?? (privateKeyHex ? new Wallet(privateKeyHex, this.provider) : undefined);

    this.contract = new Contract(
      contractAddress,
      contractABI,
      this.signer ?? this.provider
    );
  }

  // Read-only call
  async readContractData(methodName: string, args: unknown[] = []) {
    try {
      // @ts-ignore - dynamic method index
      const result = await this.contract[methodName](...args);
      return result;
    } catch (error) {
      console.error(`Error calling read method ${methodName}:`, error);
      throw error;
    }
  }

  // State-changing transaction; requires signer
  async writeContractData(
    methodName: string,
    args: unknown[] = [],
    overrides: TransactionOverrides = {}
  ) {
    if (!this.signer) {
      throw new Error('No signer configured. Provide a private key to enable write transactions.');
    }

    try {
      // @ts-ignore - dynamic method index
      const txResponse = await this.contract[methodName](...args, overrides);
      const receipt = await txResponse.wait();
      return receipt;
    } catch (error) {
      console.error(`Error sending tx for method ${methodName}:`, error);
      throw error;
    }
  }
}

// Factory method to create SmartContractService (ethers-powered)
export const createSmartContractService = (params: {
  rpcUrl: string;
  contractAddress: string;
  contractABI: any[];
  privateKeyHex?: string;
  signer?: Signer;
}) => {
  return new SmartContractService(params);
};