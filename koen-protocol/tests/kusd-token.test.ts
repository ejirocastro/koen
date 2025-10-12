import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

/*
 * kUSD Token Test Suite
 *
 * Tests for the Kōen USD stablecoin (SIP-010 fungible token)
 * - Token metadata (name, symbol, decimals, URI)
 * - Transfer functionality
 * - Faucet for testing (1000 kUSD per call)
 * - Authorization checks
 */

describe("kUSD Token - Metadata", () => {
  it("should return correct token name", () => {
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "get-name",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("Koen USD"));
  });

  it("should return correct token symbol", () => {
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "get-symbol",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("kUSD"));
  });

  it("should return 6 decimals", () => {
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "get-decimals",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(6));
  });

  it("should return token URI", () => {
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "get-token-uri",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.stringUtf8("https://koen.finance/kusd.json")));
  });

  it("should allow owner to update token URI", () => {
    const newUri = "https://new-koen.finance/kusd.json";
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "set-token-uri",
      [Cl.stringUtf8(newUri)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));

    // Verify URI was updated
    const { result: uriResult } = simnet.callPublicFn(
      "kusd-token",
      "get-token-uri",
      [],
      deployer
    );
    expect(uriResult).toBeOk(Cl.some(Cl.stringUtf8(newUri)));
  });

  it("should prevent non-owner from updating token URI", () => {
    const newUri = "https://hacker.com/kusd.json";
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "set-token-uri",
      [Cl.stringUtf8(newUri)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
  });
});

describe("kUSD Token - Initial State", () => {
  it("should have zero initial supply", () => {
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("should return zero balance for any address", () => {
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(0));
  });
});

describe("kUSD Token - Faucet (Testing)", () => {
  it("should allow anyone to call faucet and receive 1000 kUSD", () => {
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "faucet",
      [],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(1000000000)); // 1000 kUSD with 6 decimals

    // Verify balance
    const { result: balance } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance).toBeOk(Cl.uint(1000000000));

    // Verify total supply increased
    const { result: supply } = simnet.callPublicFn(
      "kusd-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(supply).toBeOk(Cl.uint(1000000000));
  });

  it("should allow multiple faucet calls by same user", () => {
    // First call
    simnet.callPublicFn("kusd-token", "faucet", [], wallet1);

    // Second call
    const { result } = simnet.callPublicFn("kusd-token", "faucet", [], wallet1);
    expect(result).toBeOk(Cl.uint(1000000000));

    // Verify balance is 2000 kUSD
    const { result: balance } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance).toBeOk(Cl.uint(2000000000));
  });

  it("should allow multiple users to call faucet", () => {
    simnet.callPublicFn("kusd-token", "faucet", [], wallet1);
    simnet.callPublicFn("kusd-token", "faucet", [], wallet2);
    simnet.callPublicFn("kusd-token", "faucet", [], wallet3);

    // Verify total supply
    const { result: supply } = simnet.callPublicFn(
      "kusd-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(supply).toBeOk(Cl.uint(3000000000)); // 3000 kUSD total
  });
});

describe("kUSD Token - Transfer", () => {
  beforeEach(() => {
    // Setup: Use faucet to give wallet1 some kUSD
    simnet.callPublicFn("kusd-token", "faucet", [], wallet1);
  });

  it("should allow user to transfer their own tokens", () => {
    const amount = 500000000; // 500 kUSD
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [
        Cl.uint(amount),
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.none()
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));

    // Verify balances
    const { result: balance1 } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance1).toBeOk(Cl.uint(500000000));

    const { result: balance2 } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(balance2).toBeOk(Cl.uint(500000000));
  });

  it("should prevent transfer with zero amount", () => {
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [
        Cl.uint(0),
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.none()
      ],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(402)); // ERR_INVALID_AMOUNT
  });

  it("should prevent unauthorized transfer", () => {
    const amount = 500000000;
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [
        Cl.uint(amount),
        Cl.principal(wallet1), // Trying to transfer from wallet1
        Cl.principal(wallet2),
        Cl.none()
      ],
      wallet3 // But calling as wallet3
    );
    expect(result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
  });

  it("should prevent transfer with insufficient balance", () => {
    const amount = 2000000000; // 2000 kUSD (more than balance)
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [
        Cl.uint(amount),
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.none()
      ],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(1)); // STX error for insufficient balance
  });

  it("should handle transfer with memo", () => {
    const amount = 100000000; // 100 kUSD
    const memo = Cl.bufferFromUtf8("Payment for services");

    const { result } = simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [
        Cl.uint(amount),
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.some(memo)
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should allow full balance transfer", () => {
    const amount = 1000000000; // 1000 kUSD (full balance)
    const { result } = simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [
        Cl.uint(amount),
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.none()
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));

    // Verify wallet1 has 0 balance
    const { result: balance1 } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance1).toBeOk(Cl.uint(0));

    // Verify wallet2 received full amount
    const { result: balance2 } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(balance2).toBeOk(Cl.uint(1000000000));
  });
});

describe("kUSD Token - Complex Scenarios", () => {
  it("should handle faucet -> transfer -> transfer chain", () => {
    // Wallet1 gets kUSD from faucet
    simnet.callPublicFn("kusd-token", "faucet", [], wallet1);

    // Transfer 400 kUSD to wallet2
    simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [Cl.uint(400000000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet1
    );

    // Transfer 200 kUSD from wallet2 to wallet3
    simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [Cl.uint(200000000), Cl.principal(wallet2), Cl.principal(wallet3), Cl.none()],
      wallet2
    );

    // Final balances: wallet1 = 600, wallet2 = 200, wallet3 = 200
    const { result: balance1 } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance1).toBeOk(Cl.uint(600000000));

    const { result: balance2 } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(balance2).toBeOk(Cl.uint(200000000));

    const { result: balance3 } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(wallet3)],
      deployer
    );
    expect(balance3).toBeOk(Cl.uint(200000000));

    // Total supply = 1000 kUSD
    const { result: supply } = simnet.callPublicFn(
      "kusd-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(supply).toBeOk(Cl.uint(1000000000));
  });

  it("should handle multiple users with faucet and transfers", () => {
    // Three users call faucet
    simnet.callPublicFn("kusd-token", "faucet", [], wallet1);
    simnet.callPublicFn("kusd-token", "faucet", [], wallet2);
    simnet.callPublicFn("kusd-token", "faucet", [], wallet3);

    // Everyone sends some to deployer
    simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [Cl.uint(100000000), Cl.principal(wallet1), Cl.principal(deployer), Cl.none()],
      wallet1
    );
    simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [Cl.uint(100000000), Cl.principal(wallet2), Cl.principal(deployer), Cl.none()],
      wallet2
    );
    simnet.callPublicFn(
      "kusd-token",
      "transfer",
      [Cl.uint(100000000), Cl.principal(wallet3), Cl.principal(deployer), Cl.none()],
      wallet3
    );

    // Deployer should have 300 kUSD
    const { result: deployerBalance } = simnet.callPublicFn(
      "kusd-token",
      "get-balance",
      [Cl.principal(deployer)],
      deployer
    );
    expect(deployerBalance).toBeOk(Cl.uint(300000000));

    // Total supply should still be 3000 kUSD
    const { result: supply } = simnet.callPublicFn(
      "kusd-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(supply).toBeOk(Cl.uint(3000000000));
  });
});
