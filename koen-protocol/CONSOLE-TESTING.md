# Console Testing Guide for Kōen Protocol

This guide provides comprehensive instructions for testing all smart contract functions interactively using the Clarinet console before deploying to testnet.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Testing Token Contracts](#testing-token-contracts)
3. [Testing Oracle](#testing-oracle)
4. [Testing Reputation System](#testing-reputation-system)
5. [Testing P2P Marketplace](#testing-p2p-marketplace)
6. [Complete End-to-End Scenarios](#complete-end-to-end-scenarios)
7. [Testing Slippage Protection](#testing-slippage-protection)
8. [Common Patterns & Tips](#common-patterns--tips)

---

## Getting Started

### Start Clarinet Console

```bash
cd koen-protocol
clarinet console
```

This opens an interactive Clarity REPL where you can call contract functions directly.

### Basic Console Commands

- **Call read-only functions**: `(contract-call? .contract-name function-name args...)`
- **Call public functions**: Same syntax, but modifies state
- **Check tx-sender**: `tx-sender` (returns current caller address)
- **Check block height**: `block-height`
- **Exit console**: `Ctrl+D` or `(exit)`

### Default Test Addresses

```clarity
;; Deployer (you)
'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

;; Test user addresses
'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
```

---

## Testing Token Contracts

### kUSD Token (Fungible Token)

#### 1. Check Token Metadata
```clarity
>> (contract-call? .kusd-token get-name)
(ok "Koen USD")

>> (contract-call? .kusd-token get-symbol)
(ok "kUSD")

>> (contract-call? .kusd-token get-decimals)
(ok u6)

>> (contract-call? .kusd-token get-token-uri)
(ok (some u"https://koen.finance/kusd.json"))
```

#### 2. Check Supply and Owner
```clarity
>> (contract-call? .kusd-token get-total-supply)
(ok u0)

>> (contract-call? .kusd-token get-contract-owner)
(ok 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

#### 3. Use Faucet to Get Test Tokens
```clarity
>> (contract-call? .kusd-token faucet)
;; Mints 1,000 kUSD (1,000,000,000 micro-kUSD)
(ok u1000000000)
```

#### 4. Check Balance
```clarity
>> (contract-call? .kusd-token get-balance tx-sender)
(ok u1000000000)

>> (contract-call? .kusd-token get-balance 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(ok u0)
```

#### 5. Transfer Tokens
```clarity
>> (contract-call? .kusd-token transfer
    u100000000                                    ;; 100 kUSD
    tx-sender                                     ;; From
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5  ;; To
    none)                                         ;; Memo
(ok true)
```

#### 6. Test Error Cases
```clarity
;; Try to transfer more than balance
>> (contract-call? .kusd-token transfer
    u999999999999
    tx-sender
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
    none)
(err u1)  ;; ERR_INSUFFICIENT_BALANCE
```

### sBTC Token (Collateral Token)

#### 1. Check Token Metadata
```clarity
>> (contract-call? .sbtc-token get-name)
(ok "Synthetic Bitcoin")

>> (contract-call? .sbtc-token get-symbol)
(ok "sBTC")

>> (contract-call? .sbtc-token get-decimals)
(ok u8)  ;; 8 decimals like Bitcoin
```

#### 2. Check Supply Limits
```clarity
>> (contract-call? .sbtc-token get-max-supply)
(ok u2100000000000000)  ;; 21M BTC with 8 decimals

>> (contract-call? .sbtc-token get-remaining-supply)
(ok u2100000000000000)

>> (contract-call? .sbtc-token get-total-supply)
(ok u0)
```

#### 3. Use Faucet
```clarity
>> (contract-call? .sbtc-token faucet)
;; Mints 1 sBTC (100,000,000 satoshis)
(ok u100000000)
```

#### 4. Mint Tokens (Owner Only)
```clarity
>> (contract-call? .sbtc-token mint
    u50000000                                     ;; 0.5 sBTC
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(ok u50000000)
```

#### 5. Transfer sBTC
```clarity
>> (contract-call? .sbtc-token transfer
    u10000000                                     ;; 0.1 sBTC
    tx-sender
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
    none)
(ok true)
```

---

## Testing Oracle

### 1. Check Oracle Metadata
```clarity
>> (contract-call? .oracle get-owner)
(ok 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

>> (contract-call? .oracle get-decimals)
(ok u6)  ;; Price in 6 decimals
```

### 2. Check Current Price
```clarity
>> (contract-call? .oracle get-sbtc-price)
(ok u40000000000)  ;; $40,000 with 6 decimals

>> (contract-call? .oracle get-last-update-block)
(ok u0)
```

### 3. Check Price Freshness
```clarity
>> (contract-call? .oracle is-price-fresh)
(ok true)  ;; Fresh if updated within 144 blocks (24 hours)
```

### 4. Calculate USD Value of sBTC
```clarity
>> (contract-call? .oracle get-sbtc-value u100000000)
;; 1 sBTC = $40,000
(ok u40000000000)
```

### 5. Calculate sBTC Amount from USD
```clarity
>> (contract-call? .oracle get-sbtc-amount u20000000000)
;; $20,000 worth of sBTC = 0.5 sBTC
(ok u50000000)
```

### 6. Update Price (Owner Only)
```clarity
>> (contract-call? .oracle set-sbtc-price u45000000000)
;; Updates price to $45,000
Events emitted
{"type":"contract_event","contract_event":{...,"value":"{ ..., event: \"price-update\", price: u45000000000 }"}}
(ok u45000000000)
```

### 7. Test Price Staleness
```clarity
;; Check if price is fresh (updated within 144 blocks)
>> (contract-call? .oracle is-price-fresh)
(ok true)  ;; Fresh immediately after update

;; Note: In console testing, price stays fresh because you're at low block heights
;; To test staleness, you would need to:
;; 1. Deploy to testnet and wait 144 blocks (~24 hours)
;; 2. Use automated tests that can advance block-height
;; 3. The price becomes stale when: (current-block - last-update-block) > 144

;; Example of stale price (after many blocks pass):
>> (contract-call? .oracle is-price-fresh)
(ok false)  ;; Would return false after 144+ blocks without update
```

---

## Testing Reputation System

### 1. Check Initial State
```clarity
>> (contract-call? .reputation-sbt get-last-token-id)
(ok u0)  ;; No tokens minted yet

>> (contract-call? .reputation-sbt has-sbt tx-sender)
false
```

### 2. Mint Reputation SBT
```clarity
>> (contract-call? .reputation-sbt mint-sbt
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5  ;; Recipient
    u500                                         ;; Score
    "silver")                                    ;; Tier
(ok u1)  ;; Token ID
```

### 3. Check User Reputation
```clarity
>> (contract-call? .reputation-sbt get-score
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(ok u500)

>> (contract-call? .reputation-sbt get-tier
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(ok "silver")
```

### 4. Check Multiplier (APR Discount)
```clarity
>> (contract-call? .reputation-sbt get-multiplier
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(ok u1000)  ;; 10% bonus (basis points)
```

### 5. Calculate Tier from Score
```clarity
>> (contract-call? .reputation-sbt calculate-tier-from-score u250)
"bronze"  ;; 0-499

>> (contract-call? .reputation-sbt calculate-tier-from-score u750)
"gold"  ;; 500-999

>> (contract-call? .reputation-sbt calculate-tier-from-score u1200)
"gold"  ;; 1000+
```

### 6. Update Reputation
```clarity
>> (contract-call? .reputation-sbt update-reputation
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
    u1100                                        ;; New score
    "gold")                                      ;; New tier
(ok true)
```

### 7. Check Tier Multipliers
```clarity
>> (contract-call? .reputation-sbt get-tier-multiplier "bronze")
u0  ;; 0% bonus

>> (contract-call? .reputation-sbt get-tier-multiplier "silver")
u1000  ;; 10% bonus

>> (contract-call? .reputation-sbt get-tier-multiplier "gold")
u2000  ;; 20% bonus
```

### 8. Test Soulbound Property (Non-Transferable)
```clarity
;; Try to transfer (should fail - soulbound tokens can't be transferred)
>> (contract-call? .reputation-sbt transfer
    u1
    tx-sender
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
(err u404)  ;; ERR_NOT_ALLOWED
```

---

## Testing P2P Marketplace

### 1. Check Marketplace Status
```clarity
>> (contract-call? .p2p-marketplace is-marketplace-paused)
(ok false)

>> (contract-call? .p2p-marketplace is-oracle-price-valid)
(ok true)
```

### 2. Check Initial Stats
```clarity
>> (contract-call? .p2p-marketplace get-marketplace-stats)
(ok {
  total-offers-created: u0,
  total-requests-created: u0,
  total-loans-created: u0,
  total-volume-lent: u0,
  total-interest-earned: u0
})
```

### 3. Create Borrow Request

**Setup: Get tokens and reputation first**
```clarity
>> (contract-call? .sbtc-token faucet)
(ok u100000000)  ;; Get 1 sBTC

>> (contract-call? .reputation-sbt mint-sbt tx-sender u600 "silver")
(ok u1)
```

**Create Request**
```clarity
>> (contract-call? .p2p-marketplace create-borrow-request
    u10000000000        ;; Amount: 10,000 kUSD (6 decimals)
    u800                ;; Max APR: 8% (basis points)
    u52560              ;; Duration: 1 year (blocks)
    u50000000)          ;; Collateral: 0.5 sBTC (8 decimals)
(ok u1)  ;; Request ID
```

**What Happens:**
- 0.5 sBTC is locked in the marketplace contract
- sBTC price snapshot is captured
- Request ID is assigned

### 4. Get Borrow Request Details
```clarity
>> (contract-call? .p2p-marketplace get-borrow-request u1)
(ok (some {
  borrower: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
  amount: u10000000000,
  collateral: u50000000,
  max-apr: u800,
  duration: u52560,
  sbtc-price-snapshot: u40000000000,
  created-at-block: u2,
  is-active: true
}))
```

### 5. Check Request Status
```clarity
>> (contract-call? .p2p-marketplace get-request-status u1)
(ok (some "active"))
```

### 6. Calculate Collateral Ratios
```clarity
>> (contract-call? .p2p-marketplace calculate-collateral-ratio-for-request u1)
(ok u200)  ;; 200% collateral ratio

>> (contract-call? .p2p-marketplace calculate-effective-collateral-ratio u1)
(ok u240)  ;; 240% with 20% silver tier bonus
```

### 7. Create Lending Offer

**Setup: Get kUSD tokens**
```clarity
>> (contract-call? .kusd-token faucet)
(ok u1000000000)  ;; Get 1,000 kUSD
```

**Create Offer**
```clarity
>> (contract-call? .p2p-marketplace create-lending-offer
    u20000000000        ;; Amount: 20,000 kUSD
    u600                ;; Min APR: 6%
    u52560              ;; Max Duration: 1 year
    u300                ;; Min Collateral Ratio: 300%
    u150)               ;; Max LTV: 150%
(ok u1)  ;; Offer ID
```

**What Happens:**
- 20,000 kUSD is locked in marketplace
- sBTC price snapshot captured
- Offer ID assigned

### 8. Get Lending Offer Details
```clarity
>> (contract-call? .p2p-marketplace get-lending-offer u1)
(ok (some {
  lender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
  amount: u20000000000,
  min-apr: u600,
  max-duration: u52560,
  min-collateral-ratio: u300,
  max-ltv: u150,
  sbtc-price-snapshot: u40000000000,
  created-at-block: u3,
  is-active: true
}))
```

### 9. Check Offer Status
```clarity
>> (contract-call? .p2p-marketplace get-offer-status u1)
(ok (some "active"))
```

### 10. Check Offer Filters
```clarity
>> (contract-call? .p2p-marketplace check-offer-filters
    u1                  ;; Offer ID
    u10000000000        ;; Requested amount
    u52560              ;; Duration
    u800)               ;; APR
(ok {
  matches: true,
  offer: (some {...})
})
```

### 11. Match Offer to Request

**Important:** Must be called by either lender or borrower (authorization layer)

```clarity
>> (contract-call? .p2p-marketplace match-offer-to-request
    u1                  ;; Offer ID
    u1)                 ;; Request ID
(ok u1)  ;; Loan ID
```

**What Happens:**
- Price deviation checked (<10%)
- Age limits verified (<1440 blocks)
- Authorization verified
- kUSD transferred to borrower
- Active loan created
- Offer and request marked as matched

### 12. Get Active Loan Details
```clarity
>> (contract-call? .p2p-marketplace get-active-loan u1)
(ok (some {
  lender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
  borrower: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
  principal: u10000000000,
  collateral: u50000000,
  apr: u800,
  start-block: u4,
  end-block: u52564,
  is-active: true
}))
```

### 13. Check Loan Health

**Calculate Current Debt**
```clarity
>> (contract-call? .p2p-marketplace get-loan-current-debt u1)
(ok u10000800000)  ;; Principal + accrued interest
```

**Check Health Factor**
```clarity
>> (contract-call? .p2p-marketplace get-loan-health-factor u1)
(ok u250)  ;; 250% (healthy)
```

**Check Health Status**
```clarity
>> (contract-call? .p2p-marketplace get-loan-health-status u1)
(ok "healthy")  ;; Can be: healthy, at-risk, liquidatable
```

**Check if At Risk**
```clarity
>> (contract-call? .p2p-marketplace is-loan-at-risk u1)
(ok false)  ;; True if health factor < 120%
```

**Check if Liquidatable**
```clarity
>> (contract-call? .p2p-marketplace is-loan-liquidatable u1)
(ok false)  ;; True if health factor < 100%
```

### 14. Get User's Loans
```clarity
>> (contract-call? .p2p-marketplace get-user-active-loans tx-sender)
(ok (list u1))  ;; List of loan IDs

>> (contract-call? .p2p-marketplace get-user-at-risk-loans tx-sender)
(ok (list))  ;; Empty if all healthy
```

### 15. Check Borrowing Power
```clarity
>> (contract-call? .p2p-marketplace get-user-borrowing-power
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
    u100000000)  ;; 1 sBTC collateral
(ok {
  user: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5,
  collateral-deposited: u100000000,
  collateral-value-usd: u40000000000,
  reputation-multiplier: u1000,  ;; 10% bonus
  effective-value-with-bonus: u44000000000,
  max-borrow-at-100-percent: u44000000000,
  max-borrow-at-120-percent: u36666666666,
  max-borrow-at-150-percent: u29333333333,
  max-borrow-at-200-percent: u22000000000
})
```

### 16. Calculate Max Borrow Amount
```clarity
>> (contract-call? .p2p-marketplace calculate-max-borrow-amount
    tx-sender
    u100000000          ;; 1 sBTC
    u150)               ;; 150% collateral ratio
(ok u29333333333)  ;; ~$29,333 max borrow
```

### 17. Repay Loan
```clarity
>> (contract-call? .p2p-marketplace repay-loan u1)
(ok true)
```

**What Happens:**
- Debt + interest calculated
- kUSD transferred from borrower to lender
- Collateral returned to borrower
- Loan marked inactive

### 18. Liquidate Loan (if health factor < 100%)
```clarity
>> (contract-call? .p2p-marketplace liquidate-loan u1)
(ok true)
```

**What Happens:**
- Health factor verified < 100%
- 5% liquidation bonus calculated
- Lender receives collateral + bonus
- Loan closed

### 19. Cancel Borrow Request
```clarity
>> (contract-call? .p2p-marketplace cancel-borrow-request u1)
(ok true)
```

**Requirements:**
- Must be borrower
- Request must be active
- Collateral returned

### 20. Cancel Lending Offer
```clarity
>> (contract-call? .p2p-marketplace cancel-lending-offer u1)
(ok true)
```

**Requirements:**
- Must be lender
- Offer must be active
- kUSD returned

### 21. Emergency Pause/Resume (Owner Only)
```clarity
>> (contract-call? .p2p-marketplace emergency-pause)
(ok true)

>> (contract-call? .p2p-marketplace is-marketplace-paused)
(ok true)

>> (contract-call? .p2p-marketplace emergency-resume)
(ok true)
```

---

## Complete End-to-End Scenarios

### Scenario 1: Successful Loan Lifecycle

```clarity
;; ===== SETUP =====
;; 1. Get tokens
>> (contract-call? .kusd-token faucet)
>> (contract-call? .sbtc-token faucet)

;; 2. Create reputation for better terms
>> (contract-call? .reputation-sbt mint-sbt tx-sender u800 "gold")

;; ===== BORROWER SIDE =====
;; 3. Create borrow request
>> (contract-call? .p2p-marketplace create-borrow-request
    u15000000000        ;; $15,000
    u700                ;; 7% max APR
    u26280              ;; 6 months
    u100000000)         ;; 1 sBTC collateral
(ok u1)

;; 4. Check request details
>> (contract-call? .p2p-marketplace get-borrow-request u1)

;; ===== LENDER SIDE =====
;; 5. Create lending offer
>> (contract-call? .kusd-token faucet)  ;; Get more kUSD
>> (contract-call? .p2p-marketplace create-lending-offer
    u20000000000        ;; $20,000
    u500                ;; 5% min APR
    u52560              ;; 1 year max
    u200                ;; 200% min collateral
    u150)               ;; 150% max LTV
(ok u1)

;; 6. Check offer details
>> (contract-call? .p2p-marketplace get-lending-offer u1)

;; ===== MATCHING =====
;; 7. Match offer to request
>> (contract-call? .p2p-marketplace match-offer-to-request u1 u1)
(ok u1)

;; 8. Verify loan created
>> (contract-call? .p2p-marketplace get-active-loan u1)

;; ===== MONITORING =====
;; 9. Check loan health
>> (contract-call? .p2p-marketplace get-loan-health-factor u1)
>> (contract-call? .p2p-marketplace get-loan-health-status u1)
>> (contract-call? .p2p-marketplace get-loan-current-debt u1)

;; ===== REPAYMENT =====
;; 10. Repay loan
>> (contract-call? .p2p-marketplace repay-loan u1)
(ok true)

;; 11. Verify loan closed
>> (contract-call? .p2p-marketplace get-active-loan u1)
(ok none)
```

### Scenario 2: Price Drop Leading to Liquidation

```clarity
;; ===== SETUP & CREATE LOAN =====
>> (contract-call? .kusd-token faucet)
>> (contract-call? .sbtc-token faucet)
>> (contract-call? .reputation-sbt mint-sbt tx-sender u300 "bronze")

;; Create request with minimal collateral (110%)
>> (contract-call? .p2p-marketplace create-borrow-request
    u36000000000        ;; $36,000
    u1000               ;; 10% APR
    u52560
    u100000000)         ;; 1 sBTC = $40,000 value, 111% ratio
(ok u1)

;; Create matching offer
>> (contract-call? .kusd-token faucet)
>> (contract-call? .p2p-marketplace create-lending-offer
    u40000000000
    u800
    u52560
    u100
    u100)
(ok u1)

;; Match
>> (contract-call? .p2p-marketplace match-offer-to-request u1 u1)
(ok u1)

;; ===== PRICE DROP SIMULATION =====
;; Simulate sBTC price dropping from $40,000 to $32,000
>> (contract-call? .oracle set-sbtc-price u32000000000)
(ok true)

;; ===== CHECK HEALTH =====
>> (contract-call? .p2p-marketplace get-loan-health-factor u1)
(ok u88)  ;; 88% - LIQUIDATABLE!

>> (contract-call? .p2p-marketplace get-loan-health-status u1)
(ok "liquidatable")

>> (contract-call? .p2p-marketplace is-loan-liquidatable u1)
(ok true)

;; ===== LIQUIDATE =====
>> (contract-call? .p2p-marketplace liquidate-loan u1)
(ok true)

;; Verify loan closed
>> (contract-call? .p2p-marketplace get-active-loan u1)
(ok none)
```

---

## Testing Slippage Protection

### Layer 1: Authorization Protection

```clarity
;; ===== SETUP =====
>> (contract-call? .kusd-token faucet)
>> (contract-call? .sbtc-token faucet)

;; Create offer as User A
>> (contract-call? .p2p-marketplace create-lending-offer
    u10000000000 u500 u52560 u150 u150)
(ok u1)

;; Create request as User A
>> (contract-call? .p2p-marketplace create-borrow-request
    u10000000000 u800 u52560 u100000000)
(ok u1)

;; ===== TEST AUTHORIZATION =====
;; Try to match as User A (lender = borrower, should work)
>> (contract-call? .p2p-marketplace match-offer-to-request u1 u1)
(ok u1)  ;; SUCCESS - authorized

;; Try to match someone else's offer/request as unauthorized user
;; Would return: (err u521)  ;; ERR_UNAUTHORIZED_MATCH
```

### Layer 2: Age Limit Protection

```clarity
;; ===== CREATE OLD OFFER =====
>> (contract-call? .kusd-token faucet)
>> (contract-call? .p2p-marketplace create-lending-offer
    u10000000000 u500 u52560 u150 u150)
(ok u1)

;; ===== SIMULATE TIME PASSING =====
;; In real testing, you'd need to advance the blockchain
;; by 1440+ blocks (10 days)

;; Try to match after expiration
>> (contract-call? .p2p-marketplace match-offer-to-request u1 u1)
(err u522)  ;; ERR_OFFER_EXPIRED

;; Same for requests
>> (contract-call? .sbtc-token faucet)
>> (contract-call? .p2p-marketplace create-borrow-request
    u10000000000 u800 u52560 u100000000)
(ok u2)

;; After 1440+ blocks
>> (contract-call? .p2p-marketplace match-offer-to-request u1 u2)
(err u523)  ;; ERR_REQUEST_EXPIRED
```

### Layer 3: Price Deviation Protection

```clarity
;; ===== CREATE OFFER & REQUEST =====
>> (contract-call? .kusd-token faucet)
>> (contract-call? .sbtc-token faucet)

;; Offer created when sBTC = $40,000
>> (contract-call? .p2p-marketplace create-lending-offer
    u10000000000 u500 u52560 u150 u150)
(ok u1)

;; Request created when sBTC = $40,000
>> (contract-call? .p2p-marketplace create-borrow-request
    u10000000000 u800 u52560 u100000000)
(ok u1)

;; ===== SIMULATE LARGE PRICE CHANGE =====
;; Price moves >10% to $45,000 (12.5% increase)
>> (contract-call? .oracle set-sbtc-price u45000000000)
(ok true)

;; ===== TRY TO MATCH =====
>> (contract-call? .p2p-marketplace match-offer-to-request u1 u1)
(err u524)  ;; ERR_PRICE_DEVIATION_TOO_LARGE

;; ===== VERIFY PROTECTION =====
>> (contract-call? .p2p-marketplace calculate-price-deviation
    u45000000000        ;; Current
    u40000000000)       ;; Snapshot
u1250  ;; 12.5% > 10% max allowed
```

---

## Common Patterns & Tips

### 1. Testing with Multiple Users

To test interactions between different users, you'll need to deploy and test on testnet or use Clarinet's advanced testing features with multiple principals.

**In console (limited):**
```clarity
;; You can only act as tx-sender
;; For multi-user scenarios, use automated tests
```

### 2. Checking Events

When functions execute successfully, you'll see event emissions:

```clarity
Events emitted
{"type":"ft_mint_event","ft_mint_event":{...}}
{"type":"contract_event","contract_event":{...}}
```

These confirm that actions were successful.

### 3. Understanding Error Codes

```clarity
(err u500) = ERR_NOT_AUTHORIZED
(err u501) = ERR_INVALID_AMOUNT
(err u502) = ERR_INVALID_COLLATERAL
(err u503) = ERR_MARKETPLACE_PAUSED
(err u504) = ERR_INSUFFICIENT_BALANCE_LENDER
(err u505) = ERR_OFFER_NOT_FOUND
(err u506) = ERR_REQUEST_NOT_FOUND
(err u507) = ERR_LOAN_NOT_FOUND
(err u508) = ERR_LOAN_ALREADY_ACTIVE
(err u509) = ERR_LOAN_NOT_ACTIVE
(err u510) = ERR_LOAN_NOT_LIQUIDATABLE
(err u511) = ERR_INSUFFICIENT_COLLATERAL
(err u512) = ERR_OFFER_REQUEST_MISMATCH
(err u513) = ERR_INVALID_DURATION
(err u514) = ERR_INVALID_APR
(err u515) = ERR_ORACLE_PRICE_INVALID
(err u516) = ERR_OFFER_NOT_ACTIVE
(err u517) = ERR_REQUEST_NOT_ACTIVE
(err u518) = ERR_ONLY_BORROWER
(err u519) = ERR_ONLY_LENDER
(err u520) = ERR_COLLATERAL_RATIO_TOO_LOW
(err u521) = ERR_UNAUTHORIZED_MATCH
(err u522) = ERR_OFFER_EXPIRED
(err u523) = ERR_REQUEST_EXPIRED
(err u524) = ERR_PRICE_DEVIATION_TOO_LARGE
```

### 4. Reading Complex Return Values

```clarity
;; When you see (ok (some {...}))
>> (contract-call? .p2p-marketplace get-active-loan u1)
(ok (some {
  lender: '...,
  borrower: '...,
  ...
}))
;; "ok" = success
;; "some" = value exists
;; {...} = the data

;; When you see (ok none)
>> (contract-call? .p2p-marketplace get-active-loan u999)
(ok none)
;; Success, but no data found
```

### 5. Quick Testing Workflow

**Fast iteration loop:**

```clarity
;; 1. Setup tokens
>> (contract-call? .kusd-token faucet)
>> (contract-call? .sbtc-token faucet)

;; 2. Test feature
>> (contract-call? .p2p-marketplace ...)

;; 3. Verify state
>> (contract-call? .p2p-marketplace get-marketplace-stats)

;; 4. If something fails, check balances and state
>> (contract-call? .kusd-token get-balance tx-sender)
>> (contract-call? .p2p-marketplace get-active-loan u1)
```

### 6. Resetting State

To reset and start fresh:
```bash
# Exit console
Ctrl+D

# Restart
clarinet console
```

### 7. Useful Helper Checks

```clarity
;; Check current block height
>> block-height
u42

;; Check your address
>> tx-sender
'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

;; Check all your balances at once
>> (contract-call? .kusd-token get-balance tx-sender)
>> (contract-call? .sbtc-token get-balance tx-sender)
>> (contract-call? .reputation-sbt has-sbt tx-sender)
```

---

## Next Steps

After thorough console testing:

1. **Run automated test suite**: `npm test`
2. **Deploy to testnet**: Follow testnet deployment guide
3. **Test on testnet**: Use actual wallet integrations
4. **Monitor contracts**: Check transaction explorer
5. **Deploy to mainnet**: Only after extensive testnet validation

---

## Troubleshooting

### Issue: "Contract not found"
**Solution:** Make sure you're in the `koen-protocol` directory and contracts are deployed in console.

### Issue: Insufficient balance errors
**Solution:** Use faucet functions to get test tokens:
```clarity
>> (contract-call? .kusd-token faucet)
>> (contract-call? .sbtc-token faucet)
```

### Issue: Authorization errors
**Solution:** Make sure you're calling functions with the right principal (tx-sender).

### Issue: Price deviation errors during testing
**Solution:** Refresh oracle price or reduce time between creating offer/request and matching:
```clarity
>> (contract-call? .oracle set-sbtc-price u40000000000)
```

---

**Ready to Test on Testnet?**

Once you've validated all functions work correctly in the console, you're ready to deploy to testnet. See the testnet deployment guide for next steps.
