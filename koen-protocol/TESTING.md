# Smart Contract Testing Guide

This guide will help you test all Kōen Protocol smart contracts before deployment.

## 🚀 Quick Start

### Run All Tests (Recommended First)

```bash
cd /Users/castro/koen/koen-protocol
npm test
```

**Expected Result:** All 198+ tests should pass ✅

---

## 📋 Test Suite Overview

You have **6 test files** covering all contracts:

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `p2p-marketplace.test.ts` | 183 tests | Core marketplace functionality |
| `slippage-protection.test.ts` | 15 tests | Hybrid slippage protection |
| `reputation-sbt.test.ts` | ~30 tests | Reputation system |
| `kusd-token.test.ts` | ~12 tests | kUSD token |
| `sbtc-token.test.ts` | ~8 tests | sBTC token |
| `oracle.test.ts` | ~12 tests | Price oracle |
| **TOTAL** | **~260 tests** | **Complete coverage** |

---

## 🧪 Running Tests

### 1. Run All Tests

```bash
npm test
```

### 2. Run Specific Test File

```bash
# Test marketplace only
npm test -- p2p-marketplace

# Test slippage protection only
npm test -- slippage-protection

# Test reputation system only
npm test -- reputation-sbt

# Test kUSD token only
npm test -- kusd-token

# Test sBTC token only
npm test -- sbtc-token

# Test oracle only
npm test -- oracle
```

### 3. Run Tests in Watch Mode (Recommended During Development)

```bash
npm test -- --watch
```

This will automatically re-run tests when you save files.

### 4. Run Tests with Coverage Report

```bash
npm test -- --coverage
```

This shows which lines of code are tested.

### 5. Run Specific Test by Name

```bash
# Run only tests matching "slippage"
npm test -- -t "slippage"

# Run only tests matching "liquidation"
npm test -- -t "liquidation"

# Run only tests matching "reputation"
npm test -- -t "reputation"
```

---

## ✅ What to Verify Before Deployment

### Critical Tests to Check:

#### 1. **Slippage Protection (CRITICAL)**

Run:
```bash
npm test -- slippage-protection
```

**What it tests:**
- ✓ Layer 1: Authorization (only lender/borrower can match)
- ✓ Layer 2: Age limits (offers/requests expire after 10 days)
- ✓ Layer 3: Price deviation (rejects if >10% price change)
- ✓ Boundary conditions (exactly 10%, 10.01%, 0%)
- ✓ Defense in depth (multiple layers work together)

**Expected:** 15/15 tests pass ✅

#### 2. **Marketplace Core Functions**

Run:
```bash
npm test -- p2p-marketplace
```

**What it tests:**
- ✓ Creating lending offers
- ✓ Creating borrow requests
- ✓ Matching offers to requests
- ✓ Loan repayment
- ✓ Liquidations
- ✓ Interest calculations
- ✓ Health factor calculations
- ✓ All error codes (401-524)

**Expected:** 183/183 tests pass ✅

#### 3. **Reputation System**

Run:
```bash
npm test -- reputation-sbt
```

**What it tests:**
- ✓ Minting reputation SBTs
- ✓ Tier calculations (Bronze/Silver/Gold)
- ✓ APR multipliers (0%, 10%, 20% discounts)
- ✓ Reputation updates
- ✓ Non-transferability (soulbound)
- ✓ Burn cooldown (1 year)

**Expected:** All tests pass ✅

#### 4. **Token Contracts**

Run:
```bash
npm test -- kusd-token
npm test -- sbtc-token
```

**What it tests:**
- ✓ Minting and burning
- ✓ Transfers
- ✓ Balance queries
- ✓ Approval mechanisms
- ✓ SIP-010 compliance

**Expected:** All tests pass ✅

#### 5. **Price Oracle**

Run:
```bash
npm test -- oracle
```

**What it tests:**
- ✓ Price updates
- ✓ Price bounds (min $10k, max $150k)
- ✓ Rate limiting (max 20% change per update)
- ✓ Staleness checks (24 hour limit)
- ✓ Price conversions (USD ↔ sBTC)

**Expected:** All tests pass ✅

---

## 🔍 Test Output Examples

### ✅ Successful Test Run

```
 PASS  tests/slippage-protection.test.ts (15.2s)
  Slippage Protection - Layer 1: Authorization
    ✓ should allow lender to match their own offer (245ms)
    ✓ should allow borrower to match request (198ms)
    ✓ should reject match from unauthorized third party (156ms)

  Slippage Protection - Layer 2: Age Limits
    ✓ should allow match within age limit (234ms)
    ✓ should reject match when offer is expired (189ms)
    ✓ should reject match when request is expired (176ms)

  Slippage Protection - Layer 3: Price Deviation
    ✓ should allow match with 0% price change (234ms)
    ✓ should allow match with 9% price change (198ms)
    ✓ should allow match at exact 10% boundary (212ms)
    ✓ should reject match just over 10% boundary (187ms)
    ✓ should reject match with 20% price change (165ms)

 Test Suites: 1 passed, 1 total
 Tests:       15 passed, 15 total
```

### ❌ Failed Test Example

```
 FAIL  tests/slippage-protection.test.ts
  ● Slippage Protection › should reject match with >10% deviation

    expect(received).toBeErr(expected)

    Expected: Cl.uint(524)
    Received: Cl.ok(Cl.uint(1))

      at Object.<anonymous> (tests/slippage-protection.test.ts:156:20)
```

If you see this, it means the test expected error 524 (price deviation too large) but got success instead.

---

## 🐛 Troubleshooting

### Issue 1: Tests Fail with Oracle Errors

**Problem:** `ERR_STALE_PRICE (u520)` errors

**Solution:** Oracle price might be old. The tests should handle this, but if not:
```bash
# Check oracle tests specifically
npm test -- oracle
```

### Issue 2: Tests Fail with "Contract Not Found"

**Problem:** Contract names don't match

**Solution:** Verify contract names in test files match your actual contract files:
```bash
ls contracts/
```

Should show:
- `p2p-marketplace.clar`
- `kusd-token.clar`
- `sbtc-token.clar`
- `reputation-sbt.clar`
- `oracle.clar`

### Issue 3: Some Tests Pass, Some Fail

**Problem:** Intermittent failures

**Solution:** Run the specific failing test in isolation:
```bash
npm test -- -t "name of failing test"
```

### Issue 4: Tests Take Too Long

**Problem:** Tests running slowly

**Solution:** Run tests in parallel (default) or run specific suites:
```bash
# Run only critical tests
npm test -- slippage-protection
npm test -- p2p-marketplace
```

---

## 📊 Test Coverage Report

Generate a detailed coverage report:

```bash
npm test -- --coverage
```

**What to look for:**
- **Statements:** Should be >90%
- **Branches:** Should be >80%
- **Functions:** Should be >90%
- **Lines:** Should be >90%

Example output:
```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   94.23 |    87.45 |   92.67 |   94.11 |
 p2p-marketplace    |   95.12 |    89.34 |   94.23 |   95.45 |
 kusd-token         |   98.45 |    92.11 |   97.89 |   98.67 |
 reputation-sbt     |   91.23 |    83.45 |   89.12 |   90.89 |
--------------------|---------|----------|---------|---------|
```

---

## ✔️ Pre-Deployment Checklist

Before deploying to testnet or mainnet:

- [ ] **All tests pass** - Run `npm test` and verify 0 failures
- [ ] **Slippage protection works** - Run `npm test -- slippage-protection`
- [ ] **Liquidation tests pass** - Check marketplace tests
- [ ] **Reputation system works** - Run `npm test -- reputation-sbt`
- [ ] **Oracle bounds enforced** - Run `npm test -- oracle`
- [ ] **No console errors** - Check test output for warnings
- [ ] **Coverage >90%** - Run `npm test -- --coverage`

---

## 🚀 After Tests Pass

Once all tests pass, you're ready to deploy!

### Deployment Steps:

1. **Deploy to Devnet (Local Testing)**
   ```bash
   clarinet integrate
   ```

2. **Deploy to Testnet**
   ```bash
   clarinet deploy --testnet
   ```

3. **Verify on Testnet Explorer**
   - Check contracts deployed successfully
   - Test with real wallet interactions
   - Verify all functions work

4. **Deploy to Mainnet** (Only after thorough testnet testing)
   ```bash
   clarinet deploy --mainnet
   ```

---

## 📝 Test Scenarios to Manually Verify

After automated tests pass, manually test these scenarios:

### Scenario 1: Happy Path - Complete Loan Lifecycle
1. Create lending offer (5000 kUSD, 5.8% APR, 90 days)
2. Create borrow request (5000 kUSD, 6% max APR, 90 days, 0.3 sBTC collateral)
3. Match offer to request
4. Wait some blocks
5. Repay loan
6. Verify collateral returned

### Scenario 2: Slippage Protection
1. Create offer at $40k sBTC
2. Wait 1000 blocks
3. Update oracle to $45k (12.5% change)
4. Try to match → Should fail with error 524

### Scenario 3: Liquidation
1. Create and match a loan with 120% collateral
2. Drop sBTC price significantly
3. Health factor drops below 80%
4. Liquidate loan
5. Verify 5% bonus received

---

## 🎯 Quick Command Reference

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Specific file
npm test -- slippage-protection

# With coverage
npm test -- --coverage

# Specific test name
npm test -- -t "should reject expired offer"

# Verbose output
npm test -- --verbose

# Run tests in CI mode (no watch, coverage)
npm test -- --coverage --ci
```

---

## 📞 Need Help?

If tests are failing:

1. **Check the error message** - It usually tells you exactly what's wrong
2. **Run the specific failing test** - `npm test -- -t "test name"`
3. **Check test file** - Look at the test code to understand what it expects
4. **Verify contract code** - Make sure contract matches test expectations

---

## 🎉 Success Criteria

You're ready to deploy when:

✅ All 198+ tests pass
✅ No console errors or warnings
✅ Coverage is >90%
✅ Slippage protection tests pass
✅ Liquidation tests pass
✅ All edge cases covered

**Current Status:** Your contracts have comprehensive test coverage with all security features tested!

---

**Last Updated:** After implementing hybrid slippage protection (198 tests passing)
