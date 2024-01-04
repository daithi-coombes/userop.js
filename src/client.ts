import { JsonRpcProvider } from "ethers";
import { UserOperationBuilder } from "./builder";
import { ISendUserOperationOpts, IClientOpts, StateOverrideSet } from "./types";
import { EntryPoint, EntryPoint__factory } from "./typechain";
import { OpToJSON } from "./utils";
import { UserOperationMiddlewareCtx } from "./context";
import { ERC4337 } from "./constants";
import { BundlerJsonRpcProvider } from "./provider";

export class Client {
  private provider: JsonRpcProvider;

  public entryPoint: EntryPoint;
  public chainId: bigint;
  public waitTimeoutMs: number;
  public waitIntervalMs: number;

  private constructor(rpcUrl: string, opts?: IClientOpts) {
    this.provider = new BundlerJsonRpcProvider(rpcUrl).setBundlerRpc(
      opts?.overrideBundlerRpc
    );

    this.entryPoint = EntryPoint__factory.connect(
      opts?.entryPoint || ERC4337.EntryPoint,
      this.provider
    );
    this.chainId = BigInt(1);
    this.waitTimeoutMs = 30000;
    this.waitIntervalMs = 5000;
  }

  public static async init(rpcUrl: string, opts?: IClientOpts) {
    const instance = new Client(rpcUrl, opts);
    instance.chainId = await instance.provider
      .getNetwork()
      .then((network) => BigInt(network.chainId));

    return instance;
  }

  async buildUserOperation(
    builder: UserOperationBuilder,
    stateOverrides?: StateOverrideSet
  ) {
    return builder.buildOp(
      await this.entryPoint.getAddress(),
      this.chainId,
      stateOverrides
    );
  }

  async sendUserOperation(
    builder: UserOperationBuilder,
    opts?: ISendUserOperationOpts
  ) {
    const dryRun = Boolean(opts?.dryRun);
    const op = await this.buildUserOperation(builder, opts?.stateOverrides);
    opts?.onBuild?.(op);

    const userOpHash = dryRun
      ? new UserOperationMiddlewareCtx(
          op,
          await this.entryPoint.getAddress(),
          this.chainId
        ).getUserOpHash()
      : ((await this.provider.send("eth_sendUserOperation", [
          OpToJSON(op),
          await this.entryPoint.getAddress(),
        ])) as string);
    builder.resetOp();

    return {
      userOpHash,
      wait: async () => {
        if (dryRun) {
          return null;
        }

        const end = Date.now() + this.waitTimeoutMs;
        const block = await this.provider.getBlock("latest");
        while (Date.now() < end) {
          const events = await this.entryPoint.queryFilter(
            this.entryPoint.filters.UserOperationEvent(userOpHash),
            Math.max(0, (block?.number || 0) - 100)
          );
          if (events.length > 0) {
            return events[0];
          }
          await new Promise((resolve) =>
            setTimeout(resolve, this.waitIntervalMs)
          );
        }

        return null;
      },
    };
  }
}
