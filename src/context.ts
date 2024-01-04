import { ethers, AbiCoder } from "ethers";
import {
  IUserOperationMiddlewareCtx,
  IUserOperation,
  StateOverrideSet,
} from "./types";

export class UserOperationMiddlewareCtx implements IUserOperationMiddlewareCtx {
  public op: IUserOperation;
  readonly entryPoint: string;
  readonly chainId: bigint;
  readonly stateOverrides?: StateOverrideSet | undefined;

  constructor(
    op: IUserOperation,
    entryPoint: string,
    chainId: bigint,
    stateOverrides?: StateOverrideSet
  ) {
    this.op = { ...op };
    this.entryPoint = ethers.getAddress(entryPoint);
    this.chainId = BigInt(chainId);
    this.stateOverrides = stateOverrides;
  }

  getUserOpHash() {
    const packed = AbiCoder.defaultAbiCoder().encode(
      [
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "bytes32",
      ],
      [
        this.op.sender,
        this.op.nonce,
        ethers.keccak256(this.op.initCode),
        ethers.keccak256(this.op.callData),
        this.op.callGasLimit,
        this.op.verificationGasLimit,
        this.op.preVerificationGas,
        this.op.maxFeePerGas,
        this.op.maxPriorityFeePerGas,
        ethers.keccak256(this.op.paymasterAndData),
      ]
    );

    const enc = AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "address", "uint256"],
      [ethers.keccak256(packed), this.entryPoint, this.chainId]
    );

    return ethers.keccak256(enc);
  }
}
