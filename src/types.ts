import { BytesLike, ethers } from "ethers";
import { UserOperationEventEvent } from "./typechain/EntryPoint";

export interface ISateOverrideAccount {
  nonce: bigint;
  code: BytesLike;
  balance: bigint;
  state: Record<string, BytesLike>;
  stateDiff: Record<string, BytesLike>;
}

export type StateOverrideSet = Record<string, Partial<ISateOverrideAccount>>;

export interface IUserOperation {
  sender: string;
  nonce: bigint;
  initCode: BytesLike;
  callData: BytesLike;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: BytesLike;
  signature: BytesLike;
}

export type UserOperationMiddlewareFn = (
  context: IUserOperationMiddlewareCtx
) => Promise<void>;

export interface IUserOperationMiddlewareCtx {
  op: IUserOperation;
  entryPoint: string;
  chainId: bigint;
  stateOverrides?: StateOverrideSet;

  // A userOpHash is a unique hash of op + entryPoint + chainId.
  getUserOpHash: () => string;
}

export interface IClientOpts {
  entryPoint?: string;
  overrideBundlerRpc?: string;
}

export interface ISendUserOperationOpts {
  dryRun?: boolean;
  onBuild?: (op: IUserOperation) => Promise<any> | any;
  stateOverrides?: StateOverrideSet;
}

export interface ISendUserOperationResponse {
  userOpHash: string;
  wait: () => Promise<UserOperationEventEvent.Event | null>;
}

export interface IPresetBuilderOpts {
  entryPoint?: string;
  factory?: string;
  salt?: bigint;
  nonceKey?: number;
  paymasterMiddleware?: UserOperationMiddlewareFn;
  overrideBundlerRpc?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISigner extends Pick<ethers.Signer, "signMessage"> {}

export interface ICall {
  to: string;
  value: bigint;
  data: BytesLike;
}
