import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

/*
 * Oracle Test Suite
 *
 * Tests for the sBTC price oracle
 * - Initial state and default price
 * - Price updates (admin only)
 * - Price history tracking
 * - Value calculations (sBTC -> USD, USD -> sBTC)
 * - Price freshness checks
 * - Authorization
 */

describe("Oracle - Initial State", () => {
  it("should have default sBTC price of $40,000", () => {
    const defaultPrice = 40000000000n; // $40,000 in micro-USD
    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-price",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(defaultPrice));
  });

  it("should return 6 decimals for price precision", () => {
    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-decimals",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(6));
  });

  it("should have zero as initial last update block", () => {
    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-last-update-block",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("should return contract owner", () => {
    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-owner",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.principal(deployer));
  });
});

describe("Oracle - Price Updates", () => {
  it("should allow owner to update sBTC price within bounds", () => {
    const newPrice = 48000000000n; // $48,000 (20% increase from $40k, within limit)
    const { result } = simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(newPrice)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(newPrice));

    // Verify price was updated
    const { result: priceResult } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-price",
      [],
      deployer
    );
    expect(priceResult).toBeOk(Cl.uint(newPrice));
  });

  it("should prevent non-owner from updating price", () => {
    const newPrice = 50000000000n;
    const { result } = simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(newPrice)],
      wallet1 // Not the owner
    );
    expect(result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
  });

  it("should prevent setting zero price", () => {
    const { result } = simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(0)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(402)); // ERR_INVALID_PRICE
  });

  it("should update last-update-block when price changes", () => {
    const newPrice = 45000000000n;

    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(newPrice)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-last-update-block",
      [],
      deployer
    );

    // Should be greater than 0 after update
    expect(result).toBeOk(Cl.uint(simnet.blockHeight));
  });

  it("should handle multiple consecutive price updates", () => {
    const prices = [45000000000n, 48000000000n, 52000000000n];

    prices.forEach(price => {
      const { result } = simnet.callPublicFn(
        "oracle",
        "set-sbtc-price",
        [Cl.uint(price)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(price));
    });

    // Verify final price
    const { result: finalPrice } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-price",
      [],
      deployer
    );
    expect(finalPrice).toBeOk(Cl.uint(52000000000n));
  });
});

describe("Oracle - Price History", () => {
  beforeEach(() => {
    // Set an initial price to populate history
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(45000000000)],
      deployer
    );
  });

  it("should store price in history when updated", () => {
    const currentBlock = simnet.blockHeight;

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-price-at-block",
      [Cl.uint(currentBlock)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(45000000000));
  });

  it("should return zero for blocks with no price data", () => {
    const futureBlock = 999999;

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-price-at-block",
      [Cl.uint(futureBlock)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(0));
  });

  it("should maintain history of multiple price updates", () => {
    const price1 = 46000000000n;
    const price2 = 47000000000n;

    // Update price and record block
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(price1)],
      deployer
    );
    const block1 = simnet.blockHeight;

    // Mine some blocks
    simnet.mineEmptyBlock();
    simnet.mineEmptyBlock();

    // Update price again
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(price2)],
      deployer
    );
    const block2 = simnet.blockHeight;

    // Verify both prices are in history
    const { result: hist1 } = simnet.callReadOnlyFn(
      "oracle",
      "get-price-at-block",
      [Cl.uint(block1)],
      deployer
    );
    expect(hist1).toBeOk(Cl.uint(price1));

    const { result: hist2 } = simnet.callReadOnlyFn(
      "oracle",
      "get-price-at-block",
      [Cl.uint(block2)],
      deployer
    );
    expect(hist2).toBeOk(Cl.uint(price2));
  });
});

describe("Oracle - Value Calculations", () => {
  beforeEach(() => {
    // Set price to $40,000 for predictable calculations
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(40000000000)], // $40,000
      deployer
    );
  });

  it("should calculate USD value of sBTC amount correctly", () => {
    // 1 sBTC (100,000,000 satoshis) at $40,000 = $40,000 USD
    const sbtcAmount = 100000000n; // 1 sBTC
    const expectedUsdValue = 40000000000n; // $40,000 in micro-USD

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-value",
      [Cl.uint(sbtcAmount)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(expectedUsdValue));
  });

  it("should calculate USD value for fractional sBTC amounts", () => {
    // 0.5 sBTC (50,000,000 satoshis) at $40,000 = $20,000 USD
    const sbtcAmount = 50000000n; // 0.5 sBTC
    const expectedUsdValue = 20000000000n; // $20,000

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-value",
      [Cl.uint(sbtcAmount)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(expectedUsdValue));
  });

  it("should calculate sBTC amount for USD value correctly", () => {
    // $40,000 USD at $40,000/BTC = 1 sBTC (100,000,000 satoshis)
    const usdValue = 40000000000n; // $40,000 in micro-USD
    const expectedSbtcAmount = 100000000n; // 1 sBTC

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-amount",
      [Cl.uint(usdValue)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(expectedSbtcAmount));
  });

  it("should calculate sBTC amount for fractional USD values", () => {
    // $20,000 USD at $40,000/BTC = 0.5 sBTC (50,000,000 satoshis)
    const usdValue = 20000000000n; // $20,000
    const expectedSbtcAmount = 50000000n; // 0.5 sBTC

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-amount",
      [Cl.uint(usdValue)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(expectedSbtcAmount));
  });

  it("should handle zero amounts in calculations", () => {
    const { result: zeroSbtcValue } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-value",
      [Cl.uint(0)],
      deployer
    );
    expect(zeroSbtcValue).toBeOk(Cl.uint(0));

    const { result: zeroUsdAmount } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-amount",
      [Cl.uint(0)],
      deployer
    );
    expect(zeroUsdAmount).toBeOk(Cl.uint(0));
  });

  it("should recalculate values when price changes", () => {
    // Initial: 1 sBTC at $40,000 = $40,000
    const sbtcAmount = 100000000n;

    let { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-value",
      [Cl.uint(sbtcAmount)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(40000000000));

    // Update price to $48,000 (20% increase, within allowed bounds)
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(48000000000)],
      deployer
    );

    // Now: 1 sBTC at $48,000 = $48,000
    ({ result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-value",
      [Cl.uint(sbtcAmount)],
      deployer
    ));
    expect(result).toBeOk(Cl.uint(48000000000));
  });
});

describe("Oracle - Price Freshness", () => {
  it("should consider price fresh after recent update", () => {
    // Update price
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(45000000000)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "is-price-fresh",
      [],
      deployer
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should consider price stale after 1000 blocks", () => {
    // Update price
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(45000000000)],
      deployer
    );

    // Mine 1001 blocks to make price stale
    for (let i = 0; i < 1001; i++) {
      simnet.mineEmptyBlock();
    }

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "is-price-fresh",
      [],
      deployer
    );

    expect(result).toBeOk(Cl.bool(false));
  });

  it("should refresh staleness with new price update", () => {
    // Initial update
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(45000000000)],
      deployer
    );

    // Mine 500 blocks
    for (let i = 0; i < 500; i++) {
      simnet.mineEmptyBlock();
    }

    // Price still fresh
    let { result } = simnet.callReadOnlyFn(
      "oracle",
      "is-price-fresh",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));

    // Mine another 600 blocks (total 1100)
    for (let i = 0; i < 600; i++) {
      simnet.mineEmptyBlock();
    }

    // Now stale
    ({ result } = simnet.callReadOnlyFn(
      "oracle",
      "is-price-fresh",
      [],
      deployer
    ));
    expect(result).toBeOk(Cl.bool(false));

    // Update price to refresh
    simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(46000000000)],
      deployer
    );

    // Fresh again
    ({ result } = simnet.callReadOnlyFn(
      "oracle",
      "is-price-fresh",
      [],
      deployer
    ));
    expect(result).toBeOk(Cl.bool(true));
  });
});

describe("Oracle - Edge Cases", () => {
  it("should handle very large sBTC amounts in calculations", () => {
    const largeSbtcAmount = 10000000000n; // 100 BTC

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-value",
      [Cl.uint(largeSbtcAmount)],
      deployer
    );

    // Should not overflow
    expect(result).toBeOk(Cl.uint(4000000000000)); // $4M
  });

  it("should handle very large USD amounts in calculations", () => {
    const largeUsdValue = 4000000000000n; // $4M

    const { result } = simnet.callReadOnlyFn(
      "oracle",
      "get-sbtc-amount",
      [Cl.uint(largeUsdValue)],
      deployer
    );

    // Should not overflow
    expect(result).toBeOk(Cl.uint(10000000000)); // 100 BTC
  });

  it("should reject extreme price changes beyond bounds", () => {
    const extremePrice = 100000000000n; // $100,000 per BTC (exceeds MAX_SBTC_PRICE of $150k)

    // SECURITY: This should now FAIL due to price bounds
    const { result } = simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(extremePrice)],
      deployer
    );
    // Price increase from $40k to $100k is 150% change (exceeds 20% limit)
    expect(result).toBeErr(Cl.uint(403)); // ERR_PRICE_CHANGE_TOO_LARGE
  });

  it("should reject prices below minimum bound", () => {
    const minPrice = 1n; // 1 micro-USD (below MIN_SBTC_PRICE of $10k)

    // SECURITY: This should now FAIL due to price bounds
    const { result } = simnet.callPublicFn(
      "oracle",
      "set-sbtc-price",
      [Cl.uint(minPrice)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(402)); // ERR_INVALID_PRICE
  });
});
