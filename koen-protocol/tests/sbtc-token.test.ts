import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

/*
 * sBTC Token Test Suite
 *
 * Tests for the Synthetic Bitcoin token (SIP-010 fungible token)
 * - Token metadata (name, symbol, decimals, URI)
 * - Transfer functionality
 * - Mock minting (hackathon only)
 * - Burning
 * - Faucet functionality
 * - Supply limits
 */

describe("sBTC Token - Metadata", () => {
  it("should return correct token name", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "get-name",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("Synthetic Bitcoin"));
  });

  it("should return correct token symbol", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "get-symbol",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("sBTC"));
  });

  it("should return 8 decimals (Bitcoin standard)", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "get-decimals",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(8));
  });

  it("should return token URI", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "get-token-uri",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.stringUtf8("https://koen.finance/sbtc.json")));
  });

  it("should allow owner to update token URI", () => {
    const newUri = "https://new-koen.finance/sbtc.json";
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "set-token-uri",
      [Cl.stringUtf8(newUri)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));

    // Verify URI was updated
    const { result: uriResult } = simnet.callPublicFn(
      "sbtc-token",
      "get-token-uri",
      [],
      deployer
    );
    expect(uriResult).toBeOk(Cl.some(Cl.stringUtf8(newUri)));
  });

  it("should prevent non-owner from updating token URI", () => {
    const newUri = "https://hacker.com/sbtc.json";
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "set-token-uri",
      [Cl.stringUtf8(newUri)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
  });
});

describe("sBTC Token - Initial State & Supply Limits", () => {
  it("should have zero initial supply", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("should return zero balance for any address", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("should return correct max supply (21M BTC)", () => {
    const maxSupply = 2100000000000000n; // 21M BTC in satoshis
    const { result } = simnet.callReadOnlyFn(
      "sbtc-token",
      "get-max-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(maxSupply));
  });

  it("should return correct remaining supply initially", () => {
    const maxSupply = 2100000000000000n; // 21M BTC
    const { result } = simnet.callReadOnlyFn(
      "sbtc-token",
      "get-remaining-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(maxSupply));
  });
});

describe("sBTC Token - Faucet", () => {
  it("should mint 1 sBTC to caller via faucet", () => {
    const faucetAmount = 100000000; // 1 sBTC

    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "faucet",
      [],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(faucetAmount));

    // Verify balance
    const { result: balance } = simnet.callPublicFn(
      "sbtc-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance).toBeOk(Cl.uint(faucetAmount));
  });

  it("should allow multiple faucet calls from same user", () => {
    const faucetAmount = 100000000; // 1 sBTC

    // First faucet call
    simnet.callPublicFn(
      "sbtc-token",
      "faucet",
      [],
      wallet1
    );

    // Second faucet call
    const { result } = simnet.callPublicFn(
      "sbtc-token",
      "faucet",
      [],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(faucetAmount));

    // Verify balance is 2 sBTC
    const { result: balance } = simnet.callPublicFn(
      "sbtc-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance).toBeOk(Cl.uint(200000000)); // 2 sBTC
  });

  it("should allow different users to use faucet", () => {
    const faucetAmount = 100000000;

    simnet.callPublicFn("sbtc-token", "faucet", [], wallet1);
    simnet.callPublicFn("sbtc-token", "faucet", [], wallet2);
    simnet.callPublicFn("sbtc-token", "faucet", [], wallet3);

    // Verify total supply is 3 sBTC
    const { result: supply } = simnet.callPublicFn(
      "sbtc-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(supply).toBeOk(Cl.uint(300000000));
  });
});
