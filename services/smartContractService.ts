import type Client from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

// Example contract interaction service using WalletConnect
export class SmartContractService {
  private client: Client;
  private session: SessionTypes.Struct;
  private contractAddress: string;
  private contractABI: any[];

  constructor(
    client: Client,
    session: SessionTypes.Struct,
    contractAddress: string,
    contractABI: any[]
  ) {
    this.client = client;
    this.session = session;
    this.contractAddress = contractAddress;
    this.contractABI = contractABI;
  }

  private getFirstChainId(): string {
    const [namespace] = Object.keys(this.session.namespaces);
    const chains = this.session.namespaces[namespace]?.chains ?? [];
    const chainId = chains[0];
    if (!chainId) {
      throw new Error('No chainId available in WalletConnect session');
    }
    return chainId;
  }

  // Method to read from a contract
  async readContractData(methodName: string, args: any[] = []) {
    try {
      const chainId = this.getFirstChainId();
      const result = await this.client.request({
        topic: this.session.topic,
        chainId,
        request: {
          method: 'eth_call',
          params: [{
            to: this.contractAddress,
            data: this.encodeMethodCall(methodName, args)
          }, 'latest']
        }
      });

      return this.decodeMethodResult(methodName, result as string);
    } catch (error) {
      console.error(`Error calling ${methodName}:`, error);
      throw error;
    }
  }

  // Method to write to a contract (send transaction)
  async writeContractData(
    methodName: string,
    args: any[] = [],
    fromAddress: string
  ) {
    try {
      const chainId = this.getFirstChainId();
      const tx = await this.client.request({
        topic: this.session.topic,
        chainId,
        request: {
          method: 'eth_sendTransaction',
          params: [{
            from: fromAddress,
            to: this.contractAddress,
            data: this.encodeMethodCall(methodName, args)
          }]
        }
      });

      return tx;
    } catch (error) {
      console.error(`Error calling ${methodName}:`, error);
      throw error;
    }
  }

  // Helper method to encode method call (simplified)
  private encodeMethodCall(methodName: string, args: any[]): string {
    const method = this.contractABI.find(m => m.name === methodName);
    if (!method) {
      throw new Error(`Method ${methodName} not found in ABI`);
    }

    const methodSignature = `${methodName}(${method.inputs.map((i: { type: string }) => i.type).join(',')})`;
    console.warn('Method encoding is simplified and may not work correctly');
    return methodSignature;
  }

  // Helper method to decode method result (simplified)
  private decodeMethodResult(methodName: string, result: string): any {
    console.warn('Method result decoding is simplified and may not work correctly');
    return result;
  }
}

// Factory method to create SmartContractService
export const createSmartContractService = (
  client: Client,
  session: SessionTypes.Struct,
  contractAddress: string,
  contractABI: any[]
) => {
  return new SmartContractService(
    client,
    session,
    contractAddress,
    contractABI
  );
};