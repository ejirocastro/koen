# Kōen Protocol - Decentralized P2P Lending Marketplace

> **Your Bitcoin Activity is Your Credit Score**

A fully decentralized peer-to-peer lending marketplace built on Stacks blockchain, featuring reputation-based matching, hybrid slippage protection, and on-chain interest accrual.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stacks](https://img.shields.io/badge/Stacks-Testnet-purple)](https://www.stacks.co/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

---

## 🌟 Features

- **🤝 Peer-to-Peer Lending**: Direct lender-to-borrower matching without intermediaries
- **🏆 Reputation System**: Soulbound NFT-based reputation with APR discounts (0-20%)
- **🛡️ Slippage Protection**: Three-layer hybrid protection (authorization + age limits + price deviation)
- **📈 On-Chain Interest**: Real-time interest accrual calculated on-chain
- **⚡ sBTC Collateral**: Bitcoin-backed loans using official sBTC on Stacks
- **🔒 Liquidation Engine**: Automated liquidation system with 5% bonus for liquidators
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Stacks Wallet** ([Leather](https://leather.io/) or [Xverse](https://www.xverse.app/))
- **Testnet STX** ([Get from faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/koen-protocol.git
cd koen-protocol/koen-frontend

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

## ⚙️ Configuration

### 1. Contract Addresses

Update deployed contract addresses in `lib/constants.ts`:

```typescript
export const CONTRACTS = {
  P2P_MARKETPLACE: 'ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.p2p-marketplace-v4',
  KUSD_TOKEN: 'ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.kusd-token',
  REPUTATION_SBT: 'ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.reputation-sbt-v2',
  ORACLE: 'ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.oracle',
};
```

### 2. Network Configuration

Create `.env.local`:

```bash
NEXT_PUBLIC_STACKS_NETWORK=testnet  # or 'mainnet'
```

### 3. Oracle Price Update (Testnet Only)

**⚠️ IMPORTANT**: Before creating offers on testnet, update the oracle price:

1. Navigate to `/dashboard/create`
2. Click the yellow "Update Oracle Price ($96,420)" button
3. Wait for transaction confirmation (~30 seconds)
4. Now you can create lending offers

---

## 📁 Project Structure

```
koen-protocol/
├── koen-frontend/                 # Next.js Frontend
│   ├── app/                       # Next.js 15 App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── globals.css           # Global styles
│   │   └── dashboard/            # Dashboard pages
│   │       ├── page.tsx          # Main dashboard
│   │       ├── marketplace/      # Browse offers/requests
│   │       ├── create/           # Create offers/requests
│   │       ├── loans/            # My active loans
│   │       └── liquidation/      # Liquidation monitor
│   │
│   ├── components/               # React components
│   │   ├── layout/               # Layout components (Sidebar, TopBar)
│   │   ├── Navbar.tsx            # Landing page navbar
│   │   ├── Hero.tsx              # Hero section
│   │   └── Features.tsx          # Features showcase
│   │
│   ├── lib/                      # Core library
│   │   ├── constants.ts          # Contract addresses & constants
│   │   ├── network.ts            # Network configuration
│   │   ├── auth.ts               # Wallet authentication
│   │   ├── contracts/            # Smart contract interfaces
│   │   │   ├── p2p-marketplace.ts    # Marketplace contract
│   │   │   ├── kusd-token.ts         # kUSD stablecoin
│   │   │   ├── reputation-sbt.ts     # Reputation system
│   │   │   └── oracle.ts             # Price oracle
│   │   ├── hooks/                # React hooks
│   │   │   ├── useWallet.ts      # Wallet connection hook
│   │   │   └── useMarketplace.ts # Data fetching hooks
│   │   ├── utils/                # Utility functions
│   │   │   └── format-helpers.ts # Formatting & calculations
│   │   ├── providers/            # React context providers
│   │   │   ├── connect-provider.tsx  # Stacks Connect wrapper
│   │   │   └── query-provider.tsx    # React Query wrapper
│   │   └── network/              # Network utilities
│   │       └── api-client.ts     # API client with retry logic
│   │
│   ├── wallet-service.ts         # Wallet service layer
│   ├── wallet.ts                 # Wallet types
│   └── public/                   # Static assets
│
└── koen-protocol/                # Smart Contracts
    ├── contracts/                # Clarity smart contracts
    │   ├── p2p-marketplace.clar  # Main marketplace logic
    │   ├── kusd-token.clar       # kUSD stablecoin
    │   ├── reputation-sbt.clar   # Reputation SBT
    │   └── oracle.clar           # sBTC price oracle
    ├── tests/                    # Contract tests
    └── deployments/              # Deployment configs
```

---

## 🔧 Smart Contract Integration

### P2P Marketplace (`p2p-marketplace.ts`)

Main marketplace contract for creating offers, requests, and managing loans.

#### Read Functions

```typescript
// Fetch offer details
const offer = await getLendingOffer(offerId, network);
// Returns: { offerId, lender, amount, apr, duration, status, ... }

// Fetch request details
const request = await getBorrowRequest(requestId, network);

// Get active loan
const loan = await getActiveLoan(loanId, network);

// Get marketplace statistics
const stats = await getMarketplaceStats(network);
// Returns: { totalOffersCreated, totalLoansCreated, totalVolumeLent, ... }

// Check loan health
const healthFactor = await getLoanHealthFactor(loanId, network);
// Returns: number (> 100 = healthy, < 80 = liquidatable)

// Get user's active loans
const loanIds = await getUserActiveLoans(userAddress, network);
```

#### Write Functions

```typescript
// Create lending offer
await createLendingOffer({
  amount: 1000,              // kUSD amount
  apr: 5.8,                  // Annual percentage rate
  duration: 90,              // Days
  minReputation: 500,        // Minimum borrower reputation
  collateralRatio: 150,      // Required collateral (150%)
});

// Create borrow request
await createBorrowRequest({
  amount: 1000,              // kUSD amount needed
  maxApr: 7.5,               // Maximum APR willing to pay
  duration: 90,              // Days
  collateralAmount: 0.015,   // sBTC collateral amount
});

// Match offer to request
await matchOfferToRequest(offerId, requestId);

// Repay loan
await repayLoan(loanId);

// Liquidate undercollateralized loan
await liquidateLoan(loanId);
```

### Reputation System (`reputation-sbt.ts`)

Soulbound NFT-based reputation system with tiered benefits.

```typescript
// Get user reputation
const reputation = await getReputation(userAddress, network);
// Returns: { score, tier, tokenId, lastUpdated, ... }

// Reputation tiers and APR discounts
Bronze (0-300):   0% APR discount
Silver (301-700): 10% APR discount
Gold (701-1000):  20% APR discount

// Calculate effective APR with reputation
const effectiveApr = calculateEffectiveApr(5.8, 0.10); // 5.22% for Silver tier
```

### Token Contracts (`kusd-token.ts`)

SIP-010 compliant fungible token.

```typescript
// Get balance
const balance = await getKusdBalance(userAddress, network);

// Transfer tokens
await transferKusd({
  amount: 100,
  recipient: 'ST1234...',
});

// Get test tokens (testnet only)
await requestKusdFaucet(); // Mints 1000 kUSD
```

### Price Oracle (`oracle.ts`)

sBTC price feed for collateral calculations.

```typescript
// Get current sBTC price
const price = await getSbtcPrice(network); // Returns: 96420 ($96,420)

// Convert sBTC to USD
const usdValue = await getSbtcValueInUsd(0.1, network);

// Update price (admin only - testnet)
await updateSbtcPrice(96420);

// Check if price is fresh (< 144 blocks old)
const isFresh = await isPriceFresh(network);
```

---

## 🛠️ Utility Functions

### Currency Conversions

```typescript
import { microKusdToKusd, satoshisToSbtc, percentageToBps } from '@/lib/utils/format-helpers';

// kUSD conversions (6 decimals)
const kusd = microKusdToKusd(1000000); // 1
const micro = kusdToMicroKusd(1); // 1000000

// sBTC conversions (8 decimals)
const sbtc = satoshisToSbtc(100000000); // 1
const sats = sbtcToSatoshis(1); // 100000000

// Basis points
const bps = percentageToBps(5.8); // 580
const pct = bpsToPercentage(580); // 5.8
```

### Formatting

```typescript
import { formatUsd, formatPercentage, formatAddress } from '@/lib/utils/format-helpers';

formatUsd(1234.56);           // "$1,234.56"
formatPercentage(5.8);        // "5.8%"
formatAddress('SP4F3...8KL2'); // "SP4F3...8KL2"
```

### Calculations

```typescript
import { calculateInterest, calculateHealthFactor } from '@/lib/utils/format-helpers';

// Calculate interest
const interest = calculateInterest(
  1000,      // principal
  5.8,       // APR
  12960      // blocks elapsed (90 days)
);

// Calculate health factor
const health = calculateHealthFactor(
  1500,      // collateral value in USD
  1000       // debt amount
); // Returns: 150 (150% healthy)
```

---

## 🔐 Security Features

### 1. Hybrid Slippage Protection

Three-layer protection system for all loan matches:

#### Authorization Layer
- Only the lender **OR** borrower can execute a match
- Prevents third-party griefing attacks

#### Age Limits
- Offers expire after **1,440 blocks** (~10 days)
- Requests expire after **1,440 blocks** (~10 days)
- Prevents exploitation of stale offers

#### Price Deviation Protection
- Captures sBTC price at offer/request creation
- Rejects matches if price moved **>10%** from snapshot
- Protects both parties from price slippage

**Error Codes:**
- `ERR_OFFER_EXPIRED (u522)` - Offer too old
- `ERR_REQUEST_EXPIRED (u523)` - Request too old
- `ERR_PRICE_DEVIATION_TOO_LARGE (u524)` - Price moved >10%

### 2. Liquidation Mechanics

- Loans become liquidatable when health factor drops below **80%**
- Liquidators receive **5% bonus** from collateral
- Automated health monitoring prevents undercollateralized loans

### 3. On-Chain Interest Accrual

- Interest calculated on-chain in real-time
- Formula: `interest = (principal × APR × blocks) / (52,560 × 10,000)`
- No off-chain dependencies

---

## 📊 Protocol Constants

```typescript
// Time
BLOCKS_PER_DAY: 144                  // ~10 min per block
BLOCKS_PER_YEAR: 52,560              // ~365 days

// Security
MAX_OFFER_AGE_BLOCKS: 1,440          // ~10 days expiration
MAX_PRICE_DEVIATION_BPS: 1,000       // 10% max price change
MAX_LOAN_DURATION: 262,800           // ~5 years maximum

// Liquidation
LIQUIDATION_THRESHOLD: 8,000         // 80% health = liquidatable
LIQUIDATION_BONUS: 500               // 5% liquidator bonus

// Reputation
BRONZE_MIN_SCORE: 0                  // 0% APR discount
SILVER_MIN_SCORE: 301                // 10% APR discount
GOLD_MIN_SCORE: 701                  // 20% APR discount
```

---

## 🧪 Development Workflow

### Step 1: Setup Environment

```bash
# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_STACKS_NETWORK=testnet" > .env.local
```

### Step 2: Update Contract Addresses

Edit `lib/constants.ts` with your deployed contract addresses.

### Step 3: Test on Testnet

1. **Connect Wallet**
   - Use Leather or Xverse
   - Switch to Stacks Testnet

2. **Get Test Tokens**
   - Click "Get Test Tokens (1000 kUSD)" button
   - Wait for transaction confirmation

3. **Update Oracle Price**
   - Click "Update Oracle Price" button
   - Wait ~30 seconds for confirmation

4. **Test Transactions**
   - Create lending offer
   - Create borrow request
   - Match offers/requests
   - Monitor loan health

### Step 4: Deploy to Production

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to any Node.js hosting
npm start
```

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **State Management**: @tanstack/react-query
- **Notifications**: react-hot-toast

### Blockchain
- **Platform**: Stacks Blockchain
- **Smart Contracts**: Clarity
- **Wallet Integration**: @stacks/connect
- **Collateral**: Official sBTC (SM3VDXK...SQ8QYGFGHN3)

### Infrastructure
- **Hosting**: Vercel
- **API**: Hiro API (with retry logic and fallbacks)
- **Network**: Testnet (ready for mainnet)

---

## 🚦 Current Status

### ✅ Completed

- ✅ Smart contract deployment on testnet
- ✅ Complete frontend integration
- ✅ Wallet connectivity (Leather & Xverse)
- ✅ Real-time data fetching with React Query
- ✅ Transaction handling with proper error states
- ✅ Responsive mobile design
- ✅ Oracle price management
- ✅ Reputation system integration
- ✅ Liquidation monitoring
- ✅ Production build optimizations

### ⚠️ Known Issues

1. **kUSD Transfer Authorization** (Requires Contract Redeployment)
   - Current kUSD contract needs update to allow marketplace transfers
   - Fix implemented in code, pending redeployment
   - Workaround: Update oracle price before creating offers

### 🔮 Roadmap

- [ ] Mainnet deployment
- [ ] Advanced filtering and search
- [ ] Loan history and analytics
- [ ] Email/SMS notifications
- [ ] Multi-collateral support
- [ ] Governance token integration

---

## 📖 API Reference

### Read-Only Functions

All read-only functions are free and don't require wallet signatures.

```typescript
// Marketplace
getLendingOffer(offerId, network)
getBorrowRequest(requestId, network)
getActiveLoan(loanId, network)
getMarketplaceStats(network)
getLoanHealthFactor(loanId, network)
isLoanLiquidatable(loanId, network)
getUserActiveLoans(address, network)

// Tokens
getKusdBalance(address, network)
getSbtcBalance(address, network)

// Reputation
getReputation(address, network)
getReputationScore(address, network)
getReputationTier(address, network)

// Oracle
getSbtcPrice(network)
isPriceFresh(network)
```

### Write Functions

All write functions require wallet signature and pay transaction fees.

```typescript
// Marketplace
createLendingOffer(params)
createBorrowRequest(params)
matchOfferToRequest(offerId, requestId)
repayLoan(loanId)
liquidateLoan(loanId)
cancelLendingOffer(offerId)
cancelBorrowRequest(requestId)

// Tokens
transferKusd(params)
requestKusdFaucet() // Testnet only

// Oracle
updateSbtcPrice(price) // Admin only
```

---

## 🐛 Troubleshooting

### Error: "ERR_STALE_PRICE (u520)"

**Solution**: Update the oracle price
1. Go to `/dashboard/create`
2. Click "Update Oracle Price" button
3. Wait for confirmation
4. Try creating offer again

### Error: "Transaction cancelled by user"

**Solution**: Approve the transaction in your wallet extension

### Error: "Insufficient balance"

**Solution**: Get test tokens
1. Click "Get Test Tokens (1000 kUSD)" button
2. Wait for confirmation
3. Balance will update automatically

### Wallet not connecting

**Solution**:
1. Ensure wallet extension is installed
2. Switch wallet to Stacks Testnet
3. Refresh the page
4. Click "Connect Wallet" again

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📬 Contact & Support

- **Documentation**: [https://docs.koen.finance](https://docs.koen.finance)
- **GitHub Issues**: [https://github.com/your-username/koen-protocol/issues](https://github.com/your-username/koen-protocol/issues)
- **Discord**: [Join our community](https://discord.gg/koen-protocol)
- **Twitter**: [@KoenProtocol](https://twitter.com/KoenProtocol)

---

## 🙏 Acknowledgments

- Built on [Stacks Blockchain](https://www.stacks.co/)
- Powered by [Official sBTC](https://www.sbtc.tech/)
- UI inspired by [Binance](https://www.binance.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Built with ❤️ for the Stacks ecosystem**

*Making Bitcoin DeFi accessible to everyone*
