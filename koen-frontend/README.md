# Kōen Protocol - P2P Lending Marketplace Frontend

A decentralized peer-to-peer lending marketplace built on Stacks blockchain with hybrid slippage protection and reputation-based matching.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Stacks wallet (Leather or Xverse)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚙️ Setup & Configuration

### 1. Update Contract Addresses

**⚠️ IMPORTANT:** Before running the application, update the deployed contract addresses in `lib/constants.ts`:

```typescript
// lib/constants.ts
export const CONTRACTS = {
  P2P_MARKETPLACE: 'YOUR_DEPLOYER.p2p-marketplace',
  KUSD_TOKEN: 'YOUR_DEPLOYER.kusd-token',
  SBTC_TOKEN: 'YOUR_DEPLOYER.sbtc-token',
  REPUTATION_SBT: 'YOUR_DEPLOYER.reputation-sbt',
  ORACLE: 'YOUR_DEPLOYER.oracle',
};
```

### 2. Configure Network

Set the network environment variable:

```bash
# .env.local
NEXT_PUBLIC_STACKS_NETWORK=testnet  # or 'mainnet'
```

---

## 📁 Project Structure

```
koen-frontend/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # React Query & Toast providers
│   └── dashboard/                # Dashboard pages
│       ├── page.tsx              # Main dashboard
│       ├── marketplace/          # Browse offers/requests
│       ├── create/               # Create offers/requests
│       ├── loans/                # My active loans
│       └── liquidation/          # Liquidation monitor
│
├── components/                   # React components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── layout/                   # Dashboard layout components
│   └── dashboard/                # Dashboard-specific components
│
├── lib/                          # Contract integration layer
│   ├── constants.ts              # Contract addresses & constants
│   ├── contracts/                # Smart contract interfaces
│   │   ├── p2p-marketplace.ts    # Marketplace contract
│   │   ├── kusd-token.ts         # kUSD token
│   │   ├── sbtc-token.ts         # sBTC token
│   │   ├── reputation-sbt.ts     # Reputation system
│   │   └── oracle.ts             # Price oracle
│   └── utils/
│       └── format-helpers.ts     # Utility functions
│
├── hooks/                        # Custom React hooks (to be created)
├── public/                       # Static assets
└── styles/                       # Global styles
```

---

## 🔧 Contract Integration Layer

The application uses a comprehensive contract integration layer located in `lib/` directory.

### Available Contracts

#### 1. **P2P Marketplace** (`lib/contracts/p2p-marketplace.ts`)

Main marketplace contract for creating offers, requests, and managing loans.

**Read Functions:**
- `getLendingOffer(offerId, network)` - Get offer details
- `getBorrowRequest(requestId, network)` - Get request details
- `getActiveLoan(loanId, network)` - Get loan details
- `getMarketplaceStats(network)` - Protocol statistics
- `getLoanHealthFactor(loanId, network)` - Calculate health factor
- `isLoanLiquidatable(loanId, network)` - Check liquidation eligibility
- `getLoanCurrentDebt(loanId, network)` - Total debt amount
- `getUserActiveLoans(address, network)` - User's loan IDs

**Write Functions:**
- `createLendingOffer({ amount, apr, duration, minReputation, collateralRatio })`
- `createBorrowRequest({ amount, maxApr, duration, collateralAmount })`
- `matchOfferToRequest(offerId, requestId)`
- `cancelLendingOffer(offerId)` / `cancelBorrowRequest(requestId)`
- `repayLoan(loanId)` / `liquidateLoan(loanId)`

#### 2. **Token Contracts** (`kusd-token.ts`, `sbtc-token.ts`)

SIP-010 fungible token implementations.

**Functions:**
- `getKusdBalance(address, network)` / `getSbtcBalance(address, network)`
- `transferKusd({ amount, recipient })` / `transferSbtc({ amount, recipient })`
- `requestKusdFaucet()` / `requestSbtcFaucet()` - Testnet faucets

#### 3. **Reputation System** (`reputation-sbt.ts`)

Soulbound tokens for user reputation.

**Functions:**
- `getReputation(address, network)` - Full reputation data
- `getReputationScore(address, network)` - Score only
- `getReputationTier(address, network)` - Bronze/Silver/Gold
- `calculateAprDiscount(baseApr, tier)` - Calculate effective APR

**Reputation Tiers:**
- **Bronze** (0-499): 0% APR discount
- **Silver** (500-999): 10% APR discount
- **Gold** (1000+): 20% APR discount

#### 4. **Price Oracle** (`oracle.ts`)

sBTC price feed for collateral calculations.

**Functions:**
- `getSbtcPrice(network)` - Current price
- `getSbtcValueInUsd(sbtcAmount, network)` - Convert sBTC → USD
- `getSbtcAmountForUsd(usdValue, network)` - Convert USD → sBTC
- `isPriceFresh(network)` - Check if price is recent

---

## 🛠️ Utility Functions

### Format Helpers (`lib/utils/format-helpers.ts`)

**Time Conversions:**
- `blocksToDays(blocks)` / `daysToBlocks(days)`
- `formatTimeRemaining(blocksRemaining)` - Human-readable time

**Currency Conversions:**
- `microKusdToKusd(micro)` / `kusdToMicroKusd(kusd)` - kUSD conversions (6 decimals)
- `satoshisToSbtc(sats)` / `sbtcToSatoshis(sbtc)` - sBTC conversions (8 decimals)
- `bpsToPercentage(bps)` / `percentageToBps(percentage)` - Basis points

**Formatting:**
- `formatUsd(amount)` → `"$1,234.56"`
- `formatPercentage(pct)` → `"5.8%"`
- `formatAddress(address)` → `"SP4F3...8KL2"`

**Calculations:**
- `calculateHealthFactor(collateralValue, debtAmount)`
- `calculateInterest(principal, apr, blocksElapsed)`
- `calculateTotalRepayment(principal, apr, duration)`
- `calculateEffectiveApr(baseApr, reputationBonus)`

**Validation:**
- `validateLoanParams({ amount, apr, duration, collateralRatio })`
- `isExpired(createdAt, currentBlock)`

---

## 🔐 Security Features

### Hybrid Slippage Protection

The marketplace implements three-layer protection for all matches:

1. **Authorization Layer**
   - Only the lender OR borrower can execute a match
   - Prevents third-party griefing attacks

2. **Age Limits**
   - Offers expire after 1440 blocks (~10 days)
   - Requests expire after 1440 blocks (~10 days)
   - Prevents exploitation of stale offers/requests

3. **Price Deviation Protection**
   - Captures sBTC price at offer/request creation
   - Rejects matches if price moved >10% from snapshot
   - Protects both parties from slippage

**Error Codes:**
- `522` - Offer expired (>10 days old)
- `523` - Request expired (>10 days old)
- `524` - Price deviation too large (>10%)

### Data Validation

All transactions validate inputs:
- Amount must be > 0
- APR must be 0-100%
- Duration within protocol limits
- Collateral ratio ≥ 100%

---

## 📝 Usage Examples

### Example 1: Fetch and Display Offers

```typescript
import { getLendingOffer } from '@/lib/contracts';
import { formatUsd, formatPercentage, blocksToDays } from '@/lib/utils/format-helpers';
import { STACKS_TESTNET } from '@stacks/network';

// Fetch offers
const offers = [];
for (let i = 1; i <= 20; i++) {
  const offer = await getLendingOffer(i, STACKS_TESTNET);
  if (offer && offer.status === 'open') {
    offers.push({
      id: offer.offerId,
      amount: formatUsd(offer.amount),
      apr: formatPercentage(offer.apr),
      duration: `${blocksToDays(offer.duration)} days`,
    });
  }
}
```

### Example 2: Create Lending Offer

```typescript
import { createLendingOffer } from '@/lib/contracts';
import { validateLoanParams } from '@/lib/utils/format-helpers';
import toast from 'react-hot-toast';

async function handleCreateOffer(formData) {
  // Validate
  const validation = validateLoanParams(formData);
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  try {
    await createLendingOffer({
      amount: parseFloat(formData.amount),
      apr: parseFloat(formData.apr),
      duration: parseInt(formData.duration),
      minReputation: 500, // Silver+
      collateralRatio: 150,
    });
    toast.success('Offer created!');
  } catch (error) {
    toast.error(error.message);
  }
}
```

### Example 3: Calculate Borrowing Cost with Reputation

```typescript
import { getReputation } from '@/lib/contracts';
import { calculateEffectiveApr, calculateTotalRepayment } from '@/lib/utils/format-helpers';

async function calculateCost(userAddress, baseApr, amount, duration) {
  const reputation = await getReputation(userAddress, network);

  // Apply reputation discount
  const bonus = reputation?.tier === 'gold' ? 0.20 :
                reputation?.tier === 'silver' ? 0.10 : 0;

  const effectiveApr = calculateEffectiveApr(baseApr, bonus);
  const totalRepayment = calculateTotalRepayment(amount, effectiveApr, duration);

  return {
    effectiveApr,
    discount: `${(bonus * 100)}%`,
    totalRepayment,
  };
}
```

### Example 4: Monitor Loan Health

```typescript
import { getLoanHealthFactor } from '@/lib/contracts';
import { getHealthStatus } from '@/lib/utils/format-helpers';

async function checkHealth(loanId) {
  const health = await getLoanHealthFactor(loanId, network);
  const status = getHealthStatus(health);

  // status.status: 'critical' | 'warning' | 'safe'
  // status.color: '#F6465D' | '#F0B90B' | '#0ECB81'

  return status;
}
```

---

## 📊 Protocol Constants

Key constants from `lib/constants.ts`:

```typescript
BLOCKS_PER_DAY: 144                    // ~10 min per block
MAX_OFFER_AGE_BLOCKS: 1440             // ~10 days expiration
MAX_PRICE_DEVIATION_BPS: 1000          // 10% max price change
LIQUIDATION_THRESHOLD: 8000            // 80% health = liquidatable
LIQUIDATION_BONUS: 500                 // 5% liquidator bonus
MAX_LOAN_DURATION: 262800              // ~5 years maximum
```

---

## 🧪 Development Workflow

### Step 1: Install Dependencies

```bash
npm install @stacks/transactions @stacks/connect @stacks/network @tanstack/react-query react-hot-toast date-fns
```

### Step 2: Update Contract Addresses

Edit `lib/constants.ts` with your deployed contract addresses.

### Step 3: Test on Testnet

Always test on testnet before mainnet deployment:
1. Connect wallet to Stacks testnet
2. Get testnet tokens from faucets
3. Test all contract interactions
4. Verify error handling

### Step 4: Run Development Server

```bash
npm run dev
```

---

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Blockchain:** Stacks (Clarity smart contracts)
- **Wallet Integration:** @stacks/connect (Leather, Xverse)
- **State Management:** @tanstack/react-query
- **Animations:** Framer Motion
- **Notifications:** react-hot-toast

---

## 📖 Additional Resources

- **Stacks Documentation:** [docs.stacks.co](https://docs.stacks.co)
- **Clarity Language:** [docs.stacks.co/clarity](https://docs.stacks.co/clarity)
- **Stacks.js:** [github.com/hirosystems/stacks.js](https://github.com/hirosystems/stacks.js)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)

---

## 🚦 Current Status

✅ **Completed:**
- Contract integration layer built
- All 5 smart contracts wrapped
- Utility functions created
- Type definitions complete
- Error handling implemented

⏳ **In Progress:**
- Installing React Query dependencies
- Setting up data fetching hooks
- Integrating real contract data into pages

❌ **Not Started:**
- React Query provider setup
- Custom hooks for data fetching
- Page updates with real data
- Transaction flow implementations

---

## 📝 Next Steps

1. **Install Dependencies:**
   ```bash
   npm install @stacks/transactions @stacks/connect @stacks/network @tanstack/react-query react-hot-toast date-fns
   ```

2. **Setup Providers:**
   - Create `app/providers.tsx` with React Query
   - Wrap application with providers

3. **Create Hooks:**
   - `useMarketplaceOffers()` - Fetch offers
   - `useMarketplaceRequests()` - Fetch requests
   - `useUserLoans()` - Fetch user loans
   - `useReputation()` - Fetch reputation

4. **Update Pages:**
   - Replace mock data with real contract calls
   - Implement transaction flows
   - Add loading and error states

---

## 📄 License

This project is part of the Kōen Protocol ecosystem.

---

## 🤝 Contributing

For development questions or contributions, please refer to the contract integration documentation in `lib/` directory.

---

**Built with ❤️ on Stacks**
