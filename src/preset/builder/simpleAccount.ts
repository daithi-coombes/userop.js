import { BytesLike, ethers } from "ethers";
import { ERC4337 } from "../../constants";
import { UserOperationBuilder } from "../../builder";
import { BundlerJsonRpcProvider } from "../../provider";
import {
  signUserOpHash,
  estimateUserOperationGas,
  getGasPrice,
} from "../middleware";
import {
  EntryPoint,
  EntryPoint__factory,
  SimpleAccountFactory,
  SimpleAccountFactory__factory,
  SimpleAccount as SimpleAccountImpl,
  SimpleAccount__factory,
} from "../../typechain";
import { IPresetBuilderOpts, UserOperationMiddlewareFn } from "../../types";

export class SimpleAccount extends UserOperationBuilder {
  private signer: ethers.Signer;
  private provider: ethers.JsonRpcProvider;
  private entryPoint: EntryPoint;
  private factory: SimpleAccountFactory;
  private factoryAddress: string;
  private initCode: string;
  private nonceKey: number;
  proxy: SimpleAccountImpl;

  private constructor(
    signer: ethers.Signer,
    rpcUrl: string,
    opts?: IPresetBuilderOpts
  ) {
    super();
    this.signer = signer;
    this.provider = new BundlerJsonRpcProvider(rpcUrl).setBundlerRpc(
      opts?.overrideBundlerRpc
    );
    this.entryPoint = EntryPoint__factory.connect(
      opts?.entryPoint || ERC4337.EntryPoint,
      this.provider
    );
    this.factoryAddress = opts?.factory || ERC4337.SimpleAccount.Factory;
    this.factory = SimpleAccountFactory__factory.connect(
      this.factoryAddress,
      this.provider
    );
    this.initCode = "0x";
    this.nonceKey = opts?.nonceKey || 0;
    this.proxy = SimpleAccount__factory.connect(
      ethers.ZeroAddress,
      this.provider
    );
  }

  private resolveAccount: UserOperationMiddlewareFn = async (ctx) => {
    const [nonce, code] = await Promise.all([
      this.entryPoint.getNonce(ctx.op.sender, this.nonceKey),
      this.provider.getCode(ctx.op.sender),
    ]);
    ctx.op.nonce = nonce;
    ctx.op.initCode = code === "0x" ? this.initCode : "0x";
  };

  public static async init(
    signer: ethers.Signer,
    rpcUrl: string,
    opts?: IPresetBuilderOpts
  ): Promise<SimpleAccount> {
    const instance = new SimpleAccount(signer, rpcUrl, opts);

    try {
      instance.initCode = await ethers.concat([
        instance.factoryAddress,
        instance.factory.interface.encodeFunctionData("createAccount", [
          await instance.signer.getAddress(),
          BigInt(opts?.salt ?? 0),
        ]),
      ]);
      await instance.entryPoint.getSenderAddress(instance.initCode);

      throw new Error("getSenderAddress: unexpected result");
    } catch (error: any) {
      const addr = error?.errorArgs?.sender;
      if (!addr) throw error;

      instance.proxy = SimpleAccount__factory.connect(addr, instance.provider);
    }

    const base = instance
      .useDefaults({
        sender: await instance.proxy.getAddress(),
        signature: await instance.signer.signMessage(
          ethers.getBytes(ethers.keccak256("0xdead"))
        ),
      })
      .useMiddleware(instance.resolveAccount)
      .useMiddleware(getGasPrice(instance.provider));

    const withPM = opts?.paymasterMiddleware
      ? base.useMiddleware(opts.paymasterMiddleware)
      : base.useMiddleware(estimateUserOperationGas(instance.provider));

    return withPM.useMiddleware(signUserOpHash(instance.signer));
  }

  execute(to: string, value: bigint, data: BytesLike) {
    return this.setCallData(
      this.proxy.interface.encodeFunctionData("execute", [to, value, data])
    );
  }

  executeBatch(to: Array<string>, data: Array<BytesLike>) {
    return this.setCallData(
      this.proxy.interface.encodeFunctionData("executeBatch", [to, data])
    );
  }
}
