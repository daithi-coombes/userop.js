import { JsonRpcProvider } from "ethers";
import { OpToJSON } from "../../utils";
import { UserOperationMiddlewareFn } from "../../types";

interface GasEstimate {
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;

  // TODO: remove this with EntryPoint v0.7
  verificationGas: bigint;
}

export const estimateUserOperationGas =
  (provider: JsonRpcProvider): UserOperationMiddlewareFn =>
  async (ctx) => {
    const params =
      ctx.stateOverrides !== undefined
        ? [OpToJSON(ctx.op), ctx.entryPoint, ctx.stateOverrides]
        : [OpToJSON(ctx.op), ctx.entryPoint];
    const est = (await provider.send(
      "eth_estimateUserOperationGas",
      params
    )) as GasEstimate;

    ctx.op.preVerificationGas = est.preVerificationGas;
    ctx.op.verificationGasLimit =
      est.verificationGasLimit ?? est.verificationGas;
    ctx.op.callGasLimit = est.callGasLimit;
  };
