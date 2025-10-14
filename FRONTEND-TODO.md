# Frontend Implementation TODO

**Analysis Date:** October 13, 2025
**Current Status:** UI Complete (Mock Data) | Smart Contract Integration: **NOT STARTED**
**Testnet Contracts:** ✅ Deployed
**Frontend Status:** ⚠️ **Needs Contract Integration**

---

## 🎯 Executive Summary

Your frontend has **beautiful UI/UX** with all pages designed, but it's currently using **mock/hardcoded data**. None of the pages are connected to your deployed testnet smart contracts. You need to implement:

1. **Wallet Integration** - Connect Leather/Xverse wallets
2. **Contract Calls** - Fetch real data from testnet contracts
3. **Transaction Handling** - Enable users to create offers, requests, loans
4. **Real-time Updates** - Fetch and display live blockchain data

---

## 📊 Current Frontend State

### ✅ **What's Complete (UI)**

| Page | Route | UI Status | Data Source |
|------|-------|-----------|-------------|
| **Home/Landing** | `/` | ✅ Complete | Static |
| **Dashboard** | `/dashboard` | ✅ Complete | Mock Data |
| **Marketplace** | `/dashboard/marketplace` | ✅ Complete | Mock Data (hardcoded offers/requests) |
| **Create Offer/Request** | `/dashboard/create` | ✅ Complete | Mock Data (no real transactions) |
| **My Loans** | `/dashboard/loans` | ✅ Complete | Mock Data (hardcoded loans) |
| **Liquidation Monitor** | `/dashboard/liquidation` | ❓ Unknown | Need to check |

### ❌ **What's Missing (Functionality)**

| Feature | Status | Priority |
|---------|--------|----------|
| **Wallet Connection** | ❌ Not Implemented | 🔴 Critical |
| **Read Contract Data** | ❌ Not Implemented | 🔴 Critical |
| **Write Contract Transactions** | ❌ Not Implemented | 🔴 Critical |
| **Real-time Balance Updates** | ❌ Not Implemented | 🟡 High |
| **Transaction History** | ❌ Not Implemented | 🟡 High |
| **Error Handling** | ❌ Not Implemented | 🟡 High |
| **Loading States** | ⚠️ Partial | 🟢 Medium |

---

## 🔧 Detailed Implementation Needs

### **1. Wallet Integration (Critical Priority)**

#### Current State:
- `wallet.ts` - Only has TypeScript interfaces
- `wallet-service.ts` - Unknown implementation status
- No visible "Connect Wallet" button in dashboard
- No authentication state management

#### What You Need:

**A. Install Stacks Connect**
```bash
cd /Users/castro/koen/koen-frontend
npm install @stacks/connect @stacks/wallet-sdk
```

**B. Create Wallet Context/Hook**
File: `lib/hooks/useWallet.ts`
```typescript
- connectWallet()
- disconnectWallet()
- getAddress()
- getBalance()
- signTransaction()
```

**C. Add Connect Wallet UI**
- Button in Navbar/TopBar
- Wallet connection modal
- Account display with address + balance
- Network indicator (testnet/mainnet)

---

### **2. Contract Integration - Read Functions**

#### Files to Update:

**A. Marketplace Page** (`/dashboard/marketplace/page.tsx`)

**Current:** Shows hardcoded offers/requests
```typescript
const offers = [
  { id: '#L001', lender: 'SP4F3...8KL2', amount: '5,000', ... },
  // More hardcoded data
];
```

**Needs:** Real blockchain data
```typescript
// Fetch real offers from contract
const { data: offers } = useQuery(['offers'], async () => {
  return await getAllActiveOffers(network);
});

// Fetch real requests
const { data: requests } = useQuery(['requests'], async () => {
  return await getAllActiveRequests(network);
});
```

**Contract Functions Needed:**
- `get-lending-offer` (for each offer ID)
- `get-borrow-request` (for each request ID)
- `get-offer-status`
- `get-request-status`
- `get-marketplace-stats`

---

**B. My Loans Page** (`/dashboard/loans/page.tsx`)

**Current:** Shows hardcoded loans
```typescript
const lenderLoans = [
  { id: '#1234', borrower: 'SP3D6P...ABC', amount: '2,000', ... },
];
```

**Needs:** User's actual loans
```typescript
const { data: myLoans } = useQuery(['my-loans', address], async () => {
  return await getUserActiveLoans(address, network);
});

const { data: loanHealth } = useQuery(['loan-health', loanId], async () => {
  return await getLoanHealthFactor(loanId, network);
});
```

**Contract Functions Needed:**
- `get-user-active-loans`
- `get-active-loan`
- `get-loan-health-factor`
- `get-loan-current-debt`
- `get-loan-health-status`

---

**C. Dashboard Page** (`/dashboard/page.tsx`)

**Current:** Shows static stats
**Needs:**
- User's total lent/borrowed
- Active loans count
- Interest earned
- Reputation score
- Borrowing power

**Contract Functions Needed:**
- `get-marketplace-stats`
- `get-user-borrowing-power`
- `get-reputation` (from reputation-sbt)
- Token balances (kUSD, sBTC)

---

### **3. Contract Integration - Write Functions**

#### **A. Create Offer/Request Page** (`/dashboard/create/page.tsx`)

**Current:** Form with "Create" button (does nothing)

**Needs:** Actual transaction submission
```typescript
const handleCreateOffer = async () => {
  try {
    // 1. Validate inputs
    // 2. Convert to contract format (basis points, micro-units)
    // 3. Call contract
    const txId = await createLendingOffer({
      amount: microKusdAmount,
      apr: aprInBasisPoints,
      duration: durationInBlocks,
      minReputation: minReputationScore,
      collateralRatio: ratioInBasisPoints,
    });

    // 4. Wait for confirmation
    // 5. Show success message
    // 6. Redirect to marketplace
  } catch (error) {
    // Handle errors
  }
};
```

**Contract Functions Needed:**
- `create-lending-offer` (write)
- `create-borrow-request` (write)
- `get-sbtc-price` (read - for preview calculations)
- `calculate-max-borrow-amount` (read)

**Additional Requirements:**
- Input validation
- Unit conversion (dollars → micro-kUSD, days → blocks, % → basis points)
- Approval flow (kUSD/sBTC token approvals)
- Transaction confirmation UI
- Error handling for all 25 error codes

---

#### **B. Marketplace Page - Match Action**

**Current:** "Borrow" and "Lend" buttons (do nothing)

**Needs:** Match offers to requests
```typescript
const handleMatchOfferToRequest = async (offerId: number, requestId: number) => {
  try {
    const txId = await matchOfferToRequest(offerId, requestId);
    // Wait for confirmation
    // Show success
    // Refresh marketplace
  } catch (error) {
    // Handle slippage protection errors (522, 523, 524)
  }
};
```

**Contract Functions Needed:**
- `match-offer-to-request` (write)
- `check-offer-filters` (read - validate before matching)
- Slippage protection error handling

---

#### **C. My Loans Page - Repay Action**

**Current:** "Repay" button (does nothing)

**Needs:** Loan repayment
```typescript
const handleRepayLoan = async (loanId: number) => {
  // 1. Calculate total debt (principal + interest)
  const debt = await getLoanCurrentDebt(loanId);

  // 2. Check user has enough kUSD
  const balance = await getKusdBalance(userAddress);

  // 3. Repay loan
  const txId = await repayLoan(loanId);

  // 4. Confirm and show success
};
```

**Contract Functions Needed:**
- `repay-loan` (write)
- `get-loan-current-debt` (read)
- `get-balance` from kUSD token (read)

---

#### **D. Liquidation Page**

**Status:** Need to check if it exists

**Should Have:**
- List of at-risk loans (health factor < 120%)
- List of liquidatable loans (health factor < 100%)
- "Liquidate" button for eligible loans
- Liquidation bonus calculator
- Real-time health factor monitoring

**Contract Functions Needed:**
- `get-user-at-risk-loans` (read)
- `is-loan-liquidatable` (read)
- `liquidate-loan` (write)
- `get-loan-health-status` (read)

---

## 📦 Missing Infrastructure

### **1. React Query Setup**

**File:** `lib/providers/query-provider.tsx` (doesn't exist)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: 30000, // 30 seconds
    },
  },
});

export function QueryProvider({ children }: { children: React.Node }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Install:**
```bash
npm install @tanstack/react-query
```

---

### **2. Network Configuration**

**File:** `lib/network.ts` (doesn't exist)

```typescript
import { StacksTestnet, StacksMainnet } from '@stacks/network';

export function getNetwork() {
  const isTestnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'testnet';
  return isTestnet ? new StacksTestnet() : new StacksMainnet();
}
```

---

### **3. Custom Hooks**

**Files Needed:**

**A.** `lib/hooks/useMarketplace.ts`
```typescript
- useActiveOffers()
- useActiveRequests()
- useMarketplaceStats()
- useCreateOffer()
- useCreateRequest()
- useMatchOfferToRequest()
```

**B.** `lib/hooks/useLoans.ts`
```typescript
- useUserLoans()
- useLoanHealth()
- useRepayLoan()
- useLiquidateLoan()
```

**C.** `lib/hooks/useTokens.ts`
```typescript
- useKusdBalance()
- useSbtcBalance()
- useTransferKusd()
- useRequestFaucet()
```

**D.** `lib/hooks/useReputation.ts`
```typescript
- useUserReputation()
- useReputationTier()
- useAprDiscount()
```

**E.** `lib/hooks/useOracle.ts`
```typescript
- useSbtcPrice()
- useIsPriceFresh()
- useSbtcValue()
```

---

## 🔄 Data Flow Architecture

### **Current (Mock):**
```
UI Component → Hardcoded Array → Render
```

### **Needed (Real):**
```
UI Component
  → React Query Hook
    → Contract Function (/lib/contracts/)
      → Stacks Network
        → Smart Contract (Testnet)
          → Return Data
            → Cache in React Query
              → Render in UI
```

---

## 🚨 Critical Missing Features

### **1. Unit Conversions**

Your contracts use specific units:
- **kUSD:** 6 decimals (1 kUSD = 1,000,000 micro-kUSD)
- **sBTC:** 8 decimals (1 sBTC = 100,000,000 satoshis)
- **APR:** Basis points (5.8% = 580 bps)
- **Duration:** Blocks (90 days = 12,960 blocks)

**You need helper functions:**
```typescript
// Already in lib/utils/format-helpers.ts
- microKusdToKusd()
- kusdToMicroKusd()
- satoshisToSbtc()
- sbtcToSatoshis()
- percentToBasisPoints()
- basisPointsToPercent()
- daysToBlocks()
- blocksToDays()
```

**But they're not being used in UI!**

---

### **2. Error Handling**

Your contracts return 25+ error codes. You need to:
- Catch transaction errors
- Parse error codes
- Display user-friendly messages

**Already Have:**
```typescript
// In lib/constants.ts
ERROR_CODES[522] = 'Offer expired - Offer is older than 10 days...'
getErrorMessage(errorCode) // Returns friendly message
```

**Need to Use:**
```typescript
try {
  await createLendingOffer(...);
} catch (error) {
  const errorCode = parseContractError(error);
  const message = getErrorMessage(errorCode);
  toast.error(message); // Show to user
}
```

---

### **3. Loading & Transaction States**

**Need to Add:**
- Loading spinners during contract calls
- Transaction pending states
- Success confirmations
- Transaction explorer links

**Example:**
```typescript
const [isCreating, setIsCreating] = useState(false);
const [txId, setTxId] = useState<string | null>(null);

const handleCreate = async () => {
  setIsCreating(true);
  try {
    const result = await createLendingOffer(...);
    setTxId(result.txId);
    // Show success with explorer link
  } catch (error) {
    // Show error
  } finally {
    setIsCreating(false);
  }
};
```

---

## 📝 Implementation Roadmap

### **Phase 1: Wallet Integration (Week 1)**

**Priority:** 🔴 Critical

1. Install `@stacks/connect`
2. Create `useWallet` hook
3. Add "Connect Wallet" button to Navbar
4. Test wallet connection (Leather/Xverse on testnet)
5. Display user address and balance

**Success Criteria:**
- ✅ User can connect Leather wallet
- ✅ Address displays in UI
- ✅ STX balance shows correctly
- ✅ Wallet state persists on refresh

---

### **Phase 2: Read-Only Integration (Week 1-2)**

**Priority:** 🔴 Critical

**2.1 Marketplace Page**
- Fetch real offers from contract
- Fetch real requests from contract
- Display marketplace stats
- Show actual data instead of mock

**2.2 Dashboard Page**
- Fetch user's reputation
- Display real token balances (kUSD, sBTC)
- Show actual marketplace stats
- Calculate borrowing power

**2.3 My Loans Page**
- Fetch user's active loans
- Calculate real loan health factors
- Display actual repayment amounts
- Show real interest accrued

**Success Criteria:**
- ✅ All pages show real testnet data
- ✅ No more hardcoded mock arrays
- ✅ Data updates when blockchain changes

---

### **Phase 3: Write Operations (Week 2-3)**

**Priority:** 🔴 Critical

**3.1 Create Page**
- Implement `create-lending-offer`
- Implement `create-borrow-request`
- Add input validation
- Add unit conversions
- Show transaction confirmations

**3.2 Marketplace Page**
- Implement `match-offer-to-request`
- Add authorization checks
- Handle slippage protection errors
- Show transaction status

**3.3 My Loans Page**
- Implement `repay-loan`
- Calculate repayment amounts
- Check user balances
- Handle insufficient funds

**Success Criteria:**
- ✅ Users can create offers/requests
- ✅ Transactions broadcast to testnet
- ✅ Confirmations display correctly
- ✅ Loans can be repaid

---

### **Phase 4: Advanced Features (Week 3-4)**

**Priority:** 🟡 High

**4.1 Liquidation System**
- Build liquidation monitor page
- List at-risk loans
- Implement liquidate function
- Calculate liquidation bonuses

**4.2 Real-time Updates**
- WebSocket for live data
- Auto-refresh loan health
- Price update notifications
- New offer/request alerts

**4.3 Transaction History**
- Fetch user's past transactions
- Display transaction timeline
- Link to block explorer
- Export functionality

**Success Criteria:**
- ✅ Liquidations work correctly
- ✅ Data updates in real-time
- ✅ Full transaction history visible

---

### **Phase 5: Polish & Testing (Week 4-5)**

**Priority:** 🟢 Medium

**5.1 Error Handling**
- Implement all error codes
- User-friendly error messages
- Retry mechanisms
- Fallback states

**5.2 Loading States**
- Skeleton loaders
- Transaction progress
- Success animations
- Error animations

**5.3 Testing**
- Test all contract interactions
- Test error scenarios
- Test edge cases
- User acceptance testing

**Success Criteria:**
- ✅ Smooth user experience
- ✅ All errors handled gracefully
- ✅ No bugs in critical flows

---

## 📋 Quick Start Checklist

Want to start implementing? Here's your checklist:

### **Day 1: Setup**
- [ ] Install dependencies: `@stacks/connect`, `@tanstack/react-query`
- [ ] Create `QueryProvider` and wrap app
- [ ] Create `useWallet` hook
- [ ] Add "Connect Wallet" button to Navbar

### **Day 2: Wallet Connection**
- [ ] Test wallet connection with Leather
- [ ] Display user address
- [ ] Fetch and display STX balance
- [ ] Test on testnet

### **Day 3: First Contract Call**
- [ ] Fetch marketplace stats in Dashboard
- [ ] Replace hardcoded stats with real data
- [ ] Add loading state
- [ ] Test on testnet

### **Day 4: Marketplace Data**
- [ ] Fetch active offers
- [ ] Fetch active requests
- [ ] Replace mock data in Marketplace page
- [ ] Add error handling

### **Day 5: First Transaction**
- [ ] Implement create-lending-offer
- [ ] Test creating an offer on testnet
- [ ] Verify offer appears in marketplace
- [ ] Celebrate! 🎉

---

## 🔗 Resources

**Your Contract Integration Layer:**
- `/lib/contracts/` - All contract functions ready to use!
- `/lib/constants.ts` - Contract addresses, error codes
- `/lib/utils/format-helpers.ts` - Unit conversion helpers

**Stacks Documentation:**
- Stacks Connect: https://docs.hiro.so/stacks/connect
- React Query: https://tanstack.com/query/latest
- Your Testnet Deployment: [TESTNET-DEPLOYMENT.md](./TESTNET-DEPLOYMENT.md)

**Testing:**
- Your testnet contracts: `ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3`
- Explorer: https://explorer.hiro.so/?chain=testnet
- Quick Start: [QUICK-START.md](./QUICK-START.md)

---

## 💡 Pro Tips

1. **Start Small** - Get one page working end-to-end before moving to next
2. **Use React Query** - It handles caching, loading, errors automatically
3. **Test Incrementally** - Test each function on testnet as you build
4. **Check Contract Docs** - Your `/lib/contracts/` files have great examples
5. **Handle Errors** - Use the ERROR_CODES mapping for user-friendly messages

---

## ❓ Need Help?

**Common Issues:**
- Wallet won't connect? → Make sure wallet is on testnet
- Transaction fails? → Check you have testnet STX for gas
- Data not loading? → Verify contract addresses in constants.ts
- Numbers look wrong? → Check unit conversions (decimals!)

---

**Your frontend UI is beautiful! Now let's connect it to the blockchain and bring it to life! 🚀**

*Last Updated: October 13, 2025*
