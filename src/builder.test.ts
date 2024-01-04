import { ethers } from "ethers";
import { faker } from "@faker-js/faker";
import {
  UserOperationBuilder,
  DEFAULT_CALL_GAS_LIMIT,
  DEFAULT_VERIFICATION_GAS_LIMIT,
  DEFAULT_PRE_VERIFICATION_GAS,
  DEFAULT_USER_OP,
  UserOperationMiddlewareFn,
} from ".";
import { OpToJSON } from "./utils";

const MOCK_BYTES_1 = "0xdead";
const MOCK_BYTES_2 = "0xbeef";

describe("UserOperationBuilder", () => {
  test("Should initialize correctly", () => {
    const builder = new UserOperationBuilder();

    expect(builder.getOp()).toStrictEqual(DEFAULT_USER_OP);
  });

  describe("Fields", () => {
    describe("Sender", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        const mockValue = faker.finance.ethereumAddress();

        expect(builder.getSender()).toStrictEqual(ethers.ZeroAddress);
        expect(builder.setSender(mockValue).getSender()).toStrictEqual(
          ethers.getAddress(mockValue)
        );
      });

      test("Updates via partial with good values", () => {
        const mockValue = faker.finance.ethereumAddress();

        expect(
          builder.setPartial({ sender: mockValue }).getSender()
        ).toStrictEqual(ethers.getAddress(mockValue));
      });

      test("Throws error via setter on bad values", () => {
        const mockValue = "0xdead";

        expect(() => builder.setSender(mockValue)).toThrow();
      });

      test("Throws error via partial on bad values", () => {
        const mockValue = "0xdead";

        expect(() => builder.setPartial({ sender: mockValue })).toThrow();
      });
    });

    describe("Nonce", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        const mockValue = BigInt("0x1");

        expect(builder.getNonce()).toStrictEqual(BigInt(0));
        expect(builder.setNonce(mockValue).getNonce()).toStrictEqual(
          BigInt(mockValue)
        );
      });

      test("Updates via partial with good values", () => {
        const mockValue = BigInt("0x2");

        expect(
          builder.setPartial({ nonce: mockValue }).getNonce()
        ).toStrictEqual(BigInt(mockValue));
      });

      // test("Throws error via setter on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setNonce(mockValue)).toThrow();
      // });

      // test("Throws error via partial on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setPartial({ nonce: mockValue })).toThrow();
      // });
    });

    describe("InitCode", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        expect(builder.getInitCode()).toStrictEqual("0x");
        expect(builder.setInitCode(MOCK_BYTES_1).getInitCode()).toStrictEqual(
          MOCK_BYTES_1
        );
      });

      test("Updates via partial with good values", () => {
        expect(
          builder.setPartial({ initCode: MOCK_BYTES_2 }).getInitCode()
        ).toStrictEqual(MOCK_BYTES_2);
      });

      test("Throws error via setter on bad values", () => {
        const mockValue = "";

        expect(() => builder.setInitCode(mockValue)).toThrow();
      });

      test("Throws error via partial on bad values", () => {
        const mockValue = "";

        expect(() => builder.setPartial({ initCode: mockValue })).toThrow();
      });
    });

    describe("CallData", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        expect(builder.getCallData()).toStrictEqual("0x");
        expect(builder.setCallData(MOCK_BYTES_1).getCallData()).toStrictEqual(
          MOCK_BYTES_1
        );
      });

      test("Updates via partial with good values", () => {
        expect(
          builder.setPartial({ callData: MOCK_BYTES_2 }).getCallData()
        ).toStrictEqual(MOCK_BYTES_2);
      });

      test("Throws error via setter on bad values", () => {
        const mockValue = "";

        expect(() => builder.setCallData(mockValue)).toThrow();
      });

      test("Throws error via partial on bad values", () => {
        const mockValue = "";

        expect(() => builder.setPartial({ callData: mockValue })).toThrow();
      });
    });

    describe("CallGasLimit", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        const mockValue = BigInt("0x1");

        expect(builder.getCallGasLimit()).toStrictEqual(DEFAULT_CALL_GAS_LIMIT);
        expect(
          builder.setCallGasLimit(mockValue).getCallGasLimit()
        ).toStrictEqual(BigInt(mockValue));
      });

      test("Updates via partial with good values", () => {
        const mockValue = BigInt("0x2");

        expect(
          builder.setPartial({ callGasLimit: mockValue }).getCallGasLimit()
        ).toStrictEqual(BigInt(mockValue));
      });

      // test("Throws error via setter on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setCallGasLimit(mockValue)).toThrow();
      // });

      // test("Throws error via partial on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setPartial({ callGasLimit: mockValue })).toThrow();
      // });
    });

    describe("VerificationGasLimit", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        const mockValue = BigInt("0x1");

        expect(builder.getVerificationGasLimit()).toStrictEqual(
          DEFAULT_VERIFICATION_GAS_LIMIT
        );
        expect(
          builder.setVerificationGasLimit(mockValue).getVerificationGasLimit()
        ).toStrictEqual(BigInt(mockValue));
      });

      test("Updates via partial with good values", () => {
        const mockValue = BigInt("0x2");

        expect(
          builder
            .setPartial({ verificationGasLimit: mockValue })
            .getVerificationGasLimit()
        ).toStrictEqual(BigInt(mockValue));
      });

      // test("Throws error via setter on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setVerificationGasLimit(mockValue)).toThrow();
      // });

      // test("Throws error via partial on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() =>
      //     builder.setPartial({ verificationGasLimit: mockValue })
      //   ).toThrow();
      // });
    });

    describe("PreVerificationGas", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        const mockValue = BigInt("0x1");

        expect(builder.getPreVerificationGas()).toStrictEqual(
          DEFAULT_PRE_VERIFICATION_GAS
        );
        expect(
          builder.setPreVerificationGas(mockValue).getPreVerificationGas()
        ).toStrictEqual(BigInt(mockValue));
      });

      test("Updates via partial with good values", () => {
        const mockValue = BigInt("0x2");

        expect(
          builder
            .setPartial({ preVerificationGas: mockValue })
            .getPreVerificationGas()
        ).toStrictEqual(BigInt(mockValue));
      });

      // test("Throws error via setter on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setPreVerificationGas(mockValue)).toThrow();
      // });

      // test("Throws error via partial on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() =>
      //     builder.setPartial({ preVerificationGas: mockValue })
      //   ).toThrow();
      // });
    });

    describe("MaxFeePerGas", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        const mockValue = BigInt("0x1");

        expect(builder.getMaxFeePerGas()).toStrictEqual(BigInt(0));
        expect(
          builder.setMaxFeePerGas(mockValue).getMaxFeePerGas()
        ).toStrictEqual(BigInt(mockValue));
      });

      test("Updates via partial with good values", () => {
        const mockValue = BigInt("0x2");

        expect(
          builder.setPartial({ maxFeePerGas: mockValue }).getMaxFeePerGas()
        ).toStrictEqual(BigInt(mockValue));
      });

      // test("Throws error via setter on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setMaxFeePerGas(mockValue)).toThrow();
      // });

      // test("Throws error via partial on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setPartial({ maxFeePerGas: mockValue })).toThrow();
      // });
    });

    describe("MaxPriorityFeePerGas", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        const mockValue = BigInt("0x1");

        expect(builder.getMaxPriorityFeePerGas()).toStrictEqual(BigInt(0));
        expect(
          builder.setMaxPriorityFeePerGas(mockValue).getMaxPriorityFeePerGas()
        ).toStrictEqual(BigInt(mockValue));
      });

      test("Updates via partial with good values", () => {
        const mockValue = BigInt("0x2");

        expect(
          builder
            .setPartial({ maxPriorityFeePerGas: mockValue })
            .getMaxPriorityFeePerGas()
        ).toStrictEqual(BigInt(mockValue));
      });

      // test("Throws error via setter on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() => builder.setMaxPriorityFeePerGas(mockValue)).toThrow();
      // });

      // test("Throws error via partial on bad values", () => {
      //   const mockValue = BigInt("NaN");

      //   expect(() =>
      //     builder.setPartial({ maxPriorityFeePerGas: mockValue })
      //   ).toThrow();
      // });
    });

    describe("PaymasterAndData", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        expect(builder.getPaymasterAndData()).toStrictEqual("0x");
        expect(
          builder.setPaymasterAndData(MOCK_BYTES_1).getPaymasterAndData()
        ).toStrictEqual(MOCK_BYTES_1);
      });

      test("Updates via partial with good values", () => {
        expect(
          builder
            .setPartial({ paymasterAndData: MOCK_BYTES_2 })
            .getPaymasterAndData()
        ).toStrictEqual(MOCK_BYTES_2);
      });

      test("Throws error via setter on bad values", () => {
        const mockValue = "";

        expect(() => builder.setPaymasterAndData(mockValue)).toThrow();
      });

      test("Throws error via partial on bad values", () => {
        const mockValue = "";

        expect(() =>
          builder.setPartial({ paymasterAndData: mockValue })
        ).toThrow();
      });
    });

    describe("Signature", () => {
      const builder = new UserOperationBuilder();

      test("Updates via setter with good values", () => {
        expect(builder.getSignature()).toStrictEqual("0x");
        expect(builder.setSignature(MOCK_BYTES_1).getSignature()).toStrictEqual(
          MOCK_BYTES_1
        );
      });

      test("Updates via partial with good values", () => {
        expect(
          builder.setPartial({ signature: MOCK_BYTES_2 }).getSignature()
        ).toStrictEqual(MOCK_BYTES_2);
      });

      test("Throws error via setter on bad values", () => {
        const mockValue = "";

        expect(() => builder.setSignature(mockValue)).toThrow();
      });

      test("Throws error via partial on bad values", () => {
        const mockValue = "";

        expect(() => builder.setPartial({ signature: mockValue })).toThrow();
      });
    });
  });

  describe("Defaults", () => {
    test("Should not wipe after a reset", () => {
      const mockValue = faker.finance.ethereumAddress();
      const builder = new UserOperationBuilder().useDefaults({
        sender: mockValue,
      });

      expect(builder.resetOp().getSender()).toStrictEqual(
        ethers.getAddress(mockValue)
      );
    });

    test("Should forget defaults on resetDefault", () => {
      const mockValue = faker.finance.ethereumAddress();
      const builder = new UserOperationBuilder().useDefaults({
        sender: mockValue,
      });

      expect(builder.resetDefaults().resetOp().getSender()).toStrictEqual(
        ethers.ZeroAddress
      );
    });
  });

  describe("BuildOp", () => {
    const mockMaxFeePerGas = BigInt("0x1");
    const mockMaxPriorityFeePerGas = BigInt("0x2");
    const mockMW1: UserOperationMiddlewareFn = async (ctx) => {
      ctx.op.paymasterAndData = MOCK_BYTES_1;
    };
    const mockMW2: UserOperationMiddlewareFn = async (ctx) => {
      ctx.op.maxFeePerGas = mockMaxFeePerGas;
      ctx.op.maxPriorityFeePerGas = mockMaxPriorityFeePerGas;
    };

    test("Should apply all changes from middleware functions", async () => {
      const builder = new UserOperationBuilder()
        .useMiddleware(mockMW1)
        .useMiddleware(mockMW2);

      expect(
        await builder.buildOp(faker.finance.ethereumAddress(), BigInt("0x1"))
      ).toStrictEqual(
        OpToJSON({
          ...DEFAULT_USER_OP,
          paymasterAndData: MOCK_BYTES_1,
          maxFeePerGas: BigInt(mockMaxFeePerGas),
          maxPriorityFeePerGas: BigInt(mockMaxPriorityFeePerGas),
        })
      );
    });

    test("Should forget middleware on resetMiddleware", async () => {
      const builder = new UserOperationBuilder()
        .useMiddleware(mockMW1)
        .useMiddleware(mockMW2)
        .resetMiddleware();

      expect(
        await builder.buildOp(faker.finance.ethereumAddress(), BigInt("0x1"))
      ).toStrictEqual(OpToJSON({ ...DEFAULT_USER_OP }));
    });
  });
});
