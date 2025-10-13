# Kōen Protocol - Testnet Deployment

**Deployment Date:** October 13, 2025
**Network:** Stacks Testnet
**Total Cost:** 193.313747 STX
**Status:** ✅ Successfully Deployed

---

## 📝 Deployed Contracts

**Deployer Address:** `ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3`

| Contract | Address |
|----------|---------|
| **P2P Marketplace** | `ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.p2p-marketplace` |
| **kUSD Token** | `ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.kusd-token` |
| **Oracle** | `ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.oracle` |
| **Reputation SBT** | `ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.reputation-sbt` |
| **Official sBTC** | `ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token` |

---

## 🔗 Explorer Links

**Your Contracts Dashboard:**
```
https://explorer.hiro.so/address/ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3?chain=testnet
```

**Individual Contracts:**
- [P2P Marketplace](https://explorer.hiro.so/txid/ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.p2p-marketplace?chain=testnet)
- [kUSD Token](https://explorer.hiro.so/txid/ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.kusd-token?chain=testnet)
- [Oracle](https://explorer.hiro.so/txid/ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.oracle?chain=testnet)
- [Reputation SBT](https://explorer.hiro.so/txid/ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.reputation-sbt?chain=testnet)

**Official sBTC:**
- [sBTC Token](https://explorer.hiro.so/txid/ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token?chain=testnet)

---

## 🎯 Frontend Configuration

### Updated Files:
1. ✅ `/koen-frontend/lib/constants.ts` - Contract addresses updated
2. ✅ `/koen-frontend/.env.local` - Environment variables configured

### Network Settings:
- **Network:** Testnet
- **API URL:** `https://api.testnet.hiro.so`
- **Explorer:** `https://explorer.hiro.so`

---

## 🧪 Testing Your Contracts

### Test kUSD Token
View on explorer or call functions:
```
Contract: ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.kusd-token

Functions to test:
- get-name (read-only)
- get-symbol (read-only)
- get-decimals (read-only)
- faucet (public - get test tokens)
```

### Test Oracle
```
Contract: ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.oracle

Functions to test:
- get-sbtc-price (read-only)
- is-price-fresh (read-only)
- get-decimals (read-only)
```

### Test Marketplace
```
Contract: ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.p2p-marketplace

Functions to test:
- get-marketplace-stats (read-only)
- is-marketplace-paused (read-only)
- is-oracle-price-valid (read-only)
```

---

## 🚀 Next Steps

### 1. Get Testnet sBTC
To test lending functionality, you need testnet sBTC:
- **Option A:** sBTC Bridge (when available): https://bridge.sbtc.tech
- **Option B:** Request from Stacks Discord #testnet channel
- **Option C:** Use testnet sBTC faucet (if available)

### 2. Update Frontend
Your frontend is now configured for testnet:
```bash
cd /Users/castro/koen/koen-frontend
npm run dev
```

### 3. Connect Wallet
Use a testnet-enabled wallet:
- Leather Wallet (testnet mode)
- Xverse Wallet (testnet mode)

Make sure your wallet is on **Stacks Testnet**, not mainnet!

### 4. Test Core Functions

#### Create Borrow Request:
1. Get testnet sBTC
2. Approve sBTC transfer
3. Call `create-borrow-request` with:
   - Amount: kUSD amount needed
   - Max APR: Maximum rate you'll pay
   - Duration: Loan duration in blocks
   - Collateral: sBTC collateral amount

#### Create Lending Offer:
1. Get testnet kUSD (using faucet)
2. Approve kUSD transfer
3. Call `create-lending-offer` with:
   - Amount: kUSD to lend
   - Min APR: Minimum rate you want
   - Duration: Maximum loan duration
   - Min reputation: Minimum borrower reputation
   - Collateral ratio: Required collateral percentage

#### Match Offer to Request:
1. Find compatible offer and request
2. Call `match-offer-to-request` with offer ID and request ID
3. Verify loan created successfully

---

## 💰 Wallet & Balance Info

**Deployer Address:** `ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3`

**Initial Balance:** 500 STX
**Deployment Cost:** 193.31 STX
**Remaining Balance:** ~307 STX

Check current balance:
```
https://explorer.hiro.so/address/ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3?chain=testnet
```

---

## 🔐 Security Notes

1. **Testnet Only:** These are testnet contracts - do NOT use for real funds
2. **Private Keys:** Keep your testnet seed phrase secure
3. **Official sBTC:** Your contracts use official testnet sBTC standard
4. **Slippage Protection:** Hybrid protection is active (authorization + age limits + price deviation)

---

## 📊 Contract Features

### P2P Marketplace
- ✅ Direct lender-to-borrower matching
- ✅ Custom loan terms (amount, APR, duration)
- ✅ Reputation-based system
- ✅ Hybrid slippage protection (3 layers)
- ✅ Liquidation mechanics
- ✅ Emergency pause functionality

### Slippage Protection Layers
1. **Authorization:** Only lender or borrower can execute matches
2. **Age Limits:** Offers/requests expire after 10 days (1440 blocks)
3. **Price Deviation:** Rejects matches if sBTC price moved >10% from snapshot

### Token Standards
- **kUSD:** Custom SIP-010 fungible token with faucet
- **sBTC:** Official testnet sBTC (SIP-010 compliant)
- **Reputation SBTs:** SIP-009 non-fungible soulbound tokens

---

## 🐛 Troubleshooting

### Issue: "Contract not found"
**Solution:** Double-check you're on testnet, not mainnet

### Issue: "Insufficient funds"
**Solution:** Get more testnet STX or sBTC from faucets

### Issue: "Price deviation too large"
**Solution:** Price moved >10% - create new offer/request

### Issue: "Offer expired"
**Solution:** Offer is >10 days old - create new offer

---

## 📚 Documentation

- **Protocol Docs:** `/koen-protocol/README.md`
- **Frontend Docs:** `/koen-frontend/README.md`
- **Console Testing Guide:** `/koen-protocol/CONSOLE-TESTING.md`
- **Testing Guide:** `/koen-protocol/TESTING.md`

---

## 🎉 Deployment Summary

✅ **All 4 contracts deployed successfully**
✅ **Official sBTC standard integrated**
✅ **Frontend configured for testnet**
✅ **Ready for testing**

**Your Kōen Protocol P2P Lending Marketplace is live on testnet!**

---

*Last Updated: October 13, 2025*
