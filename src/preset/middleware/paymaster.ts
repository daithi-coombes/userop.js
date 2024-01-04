import { ethers } from "ethers";
import { UserOperationMiddlewareFn } from "../../types";
import { OpToJSON } from "../../utils";

interface VerifyingPaymasterResult {
  paymasterAndData: string;
  preVerificationGas: string;
  verificationGasLimit: string;
  callGasLimit: string;
}

// Assumes the paymaster interface in https://hackmd.io/@stackup/H1oIvV-qi
export const verifyingPaymaster =
  (paymasterRpc: string, context: any): UserOperationMiddlewareFn =>
  async (ctx) => {
    ctx.op.verificationGasLimit =
      BigInt(ctx.op.verificationGasLimit) * BigInt(3);

    const provider = new ethers.JsonRpcProvider(paymasterRpc);
    const pm = (await provider.send("pm_sponsorUserOperation", [
      OpToJSON(ctx.op),
      ctx.entryPoint,
      context,
    ])) as VerifyingPaymasterResult;

    ctx.op.paymasterAndData = pm.paymasterAndData;
    ctx.op.preVerificationGas = BigInt(pm.preVerificationGas);
    ctx.op.verificationGasLimit = BigInt(pm.verificationGasLimit);
    ctx.op.callGasLimit = BigInt(pm.callGasLimit);
  };
