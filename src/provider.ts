import { ethers, JsonRpcProvider } from "ethers";

export class BundlerJsonRpcProvider extends JsonRpcProvider {
  private bundlerRpc?: ethers.JsonRpcProvider;
  private bundlerMethods = new Set([
    "eth_sendUserOperation",
    "eth_estimateUserOperationGas",
    "eth_getUserOperationByHash",
    "eth_getUserOperationReceipt",
    "eth_supportedEntryPoints",
  ]);

  setBundlerRpc(bundlerRpc?: string): JsonRpcProvider {
    if (bundlerRpc) {
      this.bundlerRpc = new ethers.JsonRpcProvider(bundlerRpc);
    }
    return this;
  }

  send(method: string, params: any[]): Promise<any> {
    if (this.bundlerRpc && this.bundlerMethods.has(method)) {
      return this.bundlerRpc.send(method, params);
    }

    return super.send(method, params);
  }
}
