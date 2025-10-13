# Quick Start Guide - Test Your Deployment

Your contracts are live on testnet! Here's how to test them quickly.

---

## 🚀 Step 1: Start Your Frontend

```bash
cd /Users/castro/koen/koen-frontend
npm run dev
```

Open: http://localhost:3000

---

## 🔗 Step 2: Connect Your Wallet

1. Install **Leather Wallet** or **Xverse Wallet** browser extension
2. Switch wallet to **Testnet Mode**
3. Import your testnet account (using your seed phrase)
4. Connect wallet to your app

**Your testnet address:** `ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3`

---

## 💰 Step 3: Get Test Tokens

### Get Testnet kUSD (Easy!)
Your kUSD contract has a faucet:

**Via Explorer:**
1. Go to: https://explorer.hiro.so/txid/ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.kusd-token?chain=testnet
2. Click "Call Function"
3. Select `faucet`
4. Click "Submit"
5. Confirm in wallet

**Result:** You'll get 1,000 kUSD (test tokens)

### Get Testnet sBTC (Required for Borrowing)
Official sBTC is harder to get on testnet:

**Option 1: Discord Faucet**
1. Join Stacks Discord: https://discord.gg/stacks
2. Go to #testnet channel
3. Ask: "Can someone send testnet sBTC to ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3?"

**Option 2: sBTC Bridge**
- Check if testnet bridge is available: https://bridge.sbtc.tech

---

## 🧪 Step 4: Test Basic Functions

### Test 1: Check Marketplace Stats
```
Contract: ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.p2p-marketplace
Function: get-marketplace-stats
```

**Expected Result:**
```json
{
  "total-offers-created": 0,
  "total-requests-created": 0,
  "total-loans-created": 0,
  "total-volume-lent": 0,
  "total-interest-earned": 0
}
```

### Test 2: Check Oracle Price
```
Contract: ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.oracle
Function: get-sbtc-price
```

**Expected Result:** Something like `40000000000` (= $40,000 in 6 decimals)

### Test 3: Check Your kUSD Balance
```
Contract: ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.kusd-token
Function: get-balance
Parameter: YOUR_ADDRESS
```

---

## 🎯 Step 5: Create Your First Borrow Request

**Prerequisites:**
- ✅ Have testnet sBTC (collateral)
- ✅ Connected wallet

**Steps:**

1. **Go to Borrow Page** in your frontend
2. **Fill in the form:**
   - Amount: 1000 kUSD (= 1,000,000,000 micro-kUSD)
   - Max APR: 800 (= 8%)
   - Duration: 26280 blocks (≈ 6 months)
   - Collateral: 0.05 sBTC (= 5,000,000 satoshis)

3. **Submit Transaction**
4. **Confirm in Wallet**
5. **Wait for Confirmation** (~30 seconds)

**Check on Explorer:**
```
https://explorer.hiro.so/address/ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3?chain=testnet
```

---

## 💸 Step 6: Create Your First Lending Offer

**Prerequisites:**
- ✅ Have testnet kUSD (use faucet if needed)
- ✅ Connected wallet

**Steps:**

1. **Go to Lend Page** in your frontend
2. **Fill in the form:**
   - Amount: 2000 kUSD
   - Min APR: 600 (= 6%)
   - Max Duration: 52560 blocks (≈ 1 year)
   - Min Reputation: 0 (accept any borrower)
   - Min Collateral: 15000 (= 150%)

3. **Submit Transaction**
4. **Confirm in Wallet**
5. **Wait for Confirmation**

---

## 🤝 Step 7: Match Offer to Request

If you created both an offer and request that are compatible:

**Steps:**

1. **Go to Marketplace** in your frontend
2. **Find your offer and request**
3. **Click "Match"**
4. **Confirm transaction**

**What happens:**
- kUSD transfers from lender to borrower
- sBTC collateral locked in marketplace
- Active loan created
- Both offer and request marked as "matched"

---

## 📊 Step 8: Monitor Your Loan

### Check Loan Health
```
Contract: ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.p2p-marketplace
Function: get-loan-health-factor
Parameter: loan-id (e.g., 1)
```

**Health Factor Guide:**
- **> 150%:** Safe (green)
- **120-150%:** Healthy (yellow)
- **100-120%:** At Risk (orange)
- **< 100%:** Liquidatable (red)

### Check Current Debt
```
Function: get-loan-current-debt
Parameter: loan-id
```

Shows: Principal + accrued interest

---

## 🔄 Step 9: Repay Loan

When you're ready to close the loan:

**Steps:**

1. **Go to My Loans** page
2. **Find your active loan**
3. **Click "Repay"**
4. **Confirm transaction**

**What happens:**
- Debt + interest paid to lender
- Collateral returned to borrower
- Loan marked as "repaid"

---

## ⚡ Step 10: Test Liquidation (Advanced)

To test liquidation, you need to simulate a price drop:

**Warning:** This requires contract owner privileges to update oracle price.

**Steps:**

1. **Create loan with minimal collateral** (110%)
2. **Simulate price drop** (update oracle to lower sBTC price)
3. **Check health factor** (should drop below 100%)
4. **Call liquidate-loan** function
5. **Verify collateral transferred to lender**

---

## 🎨 Frontend Pages to Test

### 1. Home Page
- View marketplace overview
- See total stats
- Check featured offers/requests

### 2. Lend Page
- Create lending offers
- View your active offers
- Cancel offers

### 3. Borrow Page
- Create borrow requests
- View your active requests
- Cancel requests

### 4. Marketplace Page
- Browse all offers
- Browse all requests
- Match offers to requests

### 5. My Loans Page
- View active loans
- Monitor health factors
- Repay loans

### 6. Profile Page
- View reputation
- Check tier status
- See borrowing history

---

## 🔍 Verification Checklist

- [ ] Frontend runs on localhost:3000
- [ ] Wallet connects successfully (testnet mode)
- [ ] Can get kUSD from faucet
- [ ] Can check marketplace stats
- [ ] Can check oracle price
- [ ] Can create borrow request
- [ ] Can create lending offer
- [ ] Can match offer to request
- [ ] Can view active loans
- [ ] Can repay loans

---

## 🐛 Common Issues

### Issue: Wallet won't connect
**Solution:** Make sure wallet is in testnet mode, not mainnet

### Issue: "Insufficient funds" error
**Solution:** Get more kUSD from faucet or testnet STX for gas

### Issue: "Contract not found"
**Solution:** Check you're using testnet API, not mainnet

### Issue: Transaction fails
**Solution:** Check console logs, verify all parameters are correct

### Issue: Can't see my tokens
**Solution:** Wait ~30-60 seconds for blockchain confirmation

---

## 📱 Testing on Mobile

1. **Install Xverse Wallet** on mobile
2. **Switch to testnet**
3. **Import your account**
4. **Visit your deployed frontend URL**
5. **Connect wallet and test**

---

## 🎯 Success Criteria

You'll know everything is working when:
- ✅ You can create offers and requests
- ✅ You can match them to create loans
- ✅ Health factors calculate correctly
- ✅ Loans can be repaid successfully
- ✅ All transactions confirm on explorer

---

## 🚀 Next: Production Deployment

Once testnet testing is complete:

1. **Test extensively** (all features, edge cases)
2. **Get security audit** (recommended for mainnet)
3. **Deploy to mainnet** (same process, different network)
4. **Update contract addresses** to mainnet
5. **Launch!** 🎉

---

**Happy Testing!** 🧪

If you encounter any issues, check:
- [TESTNET-DEPLOYMENT.md](./TESTNET-DEPLOYMENT.md) - Deployment info
- [CONSOLE-TESTING.md](./koen-protocol/CONSOLE-TESTING.md) - Console testing guide
- [Stacks Explorer](https://explorer.hiro.so/?chain=testnet) - View transactions
