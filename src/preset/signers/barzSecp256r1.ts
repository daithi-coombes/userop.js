import { BytesLike, ethers, AbiCoder } from "ethers";
import { fromUint8Array } from "js-base64";
import { ec as EC } from "elliptic";
import { ISigner } from "../../types";

export class BarzSecp256r1 implements ISigner {
  private ec = new EC("p256");
  private privateKey: EC.KeyPair;

  constructor(privateKey: BytesLike) {
    this.privateKey = this.ec.keyFromPrivate(ethers.getBytes(privateKey));
  }

  public static generatePrivateKey(): BytesLike {
    const key = new EC("p256").genKeyPair();
    return ethers.hexlify(key.getPrivate().toBuffer());
  }

  public async getPublicKey(): Promise<string> {
    return ethers.hexlify(
      new Uint8Array(this.privateKey.getPublic().encode("array", false))
    );
  }

  // Note: Barz accounts follow the WebAuthn API and hence require values for authenticatorData and
  // clientDataJSON to be encoded as part of the signature. However these fields are not explicitly
  // checked on-chain so we can set a null value.
  public async signMessage(message: string | Uint8Array): Promise<string> {
    const authenticatorData = ethers.ZeroHash;

    const clientDataJSONPre = "";
    const uoHashBase64 = fromUint8Array(ethers.getBytes(message), true);
    const clientDataJSONPost = "";
    const clientDataJSON = `${clientDataJSONPre}${uoHashBase64}${clientDataJSONPost}`;
    const clientHash = ethers.sha256(ethers.toUtf8Bytes(clientDataJSON));

    const sigHash = ethers.sha256(
      ethers.concat([authenticatorData, clientHash])
    );
    const sig = this.privateKey.sign(ethers.getBytes(sigHash));
    return AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint256", "bytes", "string", "string"],
      [
        sig.r.toString(),
        sig.s.toString(),
        authenticatorData,
        clientDataJSONPre,
        clientDataJSONPost,
      ]
    );
  }
}
