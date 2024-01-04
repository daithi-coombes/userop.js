import { JsonRpcProvider } from "ethers";
import { UserOperationMiddlewareFn } from "../../types";

const eip1559GasPrice = async (provider: JsonRpcProvider) => {
  const [fee, block] = await Promise.all([
    provider.send("eth_maxPriorityFeePerGas", []),
    provider.getBlock("latest"),
  ]);

  const tip = BigInt(fee);
  const buffer = (tip / BigInt(100)) * BigInt(13);
  const maxPriorityFeePerGas = tip + buffer;
  const maxFeePerGas: bigint = block?.baseFeePerGas
    ? block.baseFeePerGas
      ? BigInt(0)
      : block.baseFeePerGas * BigInt(2) + maxPriorityFeePerGas
    : maxPriorityFeePerGas;

  return { maxFeePerGas, maxPriorityFeePerGas };
};

const legacyGasPrice = async (provider: JsonRpcProvider) => {
  const gas: bigint = (await provider.getFeeData()).gasPrice || BigInt(0);

  return { maxFeePerGas: gas, maxPriorityFeePerGas: gas };
};

export const getGasPrice =
  (provider: JsonRpcProvider): UserOperationMiddlewareFn =>
  async (ctx) => {
    let eip1559Error;
    try {
      const { maxFeePerGas, maxPriorityFeePerGas } = await eip1559GasPrice(
        provider
      );

      ctx.op.maxFeePerGas = maxFeePerGas;
      ctx.op.maxPriorityFeePerGas = maxPriorityFeePerGas;
      return;
    } catch (error: any) {
      eip1559Error = error;
      console.warn(
        "getGas: eth_maxPriorityFeePerGas failed, falling back to legacy gas price."
      );
    }

    try {
      const { maxFeePerGas, maxPriorityFeePerGas } = await legacyGasPrice(
        provider
      );

      ctx.op.maxFeePerGas = maxFeePerGas;
      ctx.op.maxPriorityFeePerGas = maxPriorityFeePerGas;
      return;
    } catch (error) {
      throw new Error(`${eip1559Error}, ${error}`);
    }
  };
