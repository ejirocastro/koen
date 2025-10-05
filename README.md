# KMen Protocol

> Your Bitcoin Activity Is Your Credit Score

KMen is a reputation-based DeFi lending protocol built on Bitcoin and Stacks. Users can leverage their on-chain reputation to access higher credit limits beyond traditional collateralization ratios.

## <¯ Core Concept

Traditional DeFi lending requires over-collateralization (e.g., 150% collateral for a loan). KMen introduces **reputation-based credit multipliers** that reward users with proven on-chain activity, enabling up to 15x additional borrowing power.

## <× Architecture

### Frontend (`koen-frontend/`)
- **Framework**: Next.js 15.5.4 with React 19
- **Styling**: Tailwind CSS v4
- **Features**:
  - Modern dark-themed landing page with product mockup
  - iPhone app interface showcase
  - Reputation tier visualization (Bronze, Silver, Gold)
  - Responsive design with Web3 aesthetics

### Smart Contracts (`koen-protocol/`)
- **Language**: Clarity (Stacks blockchain)
- **Contracts**:
  - Reputation SBT (Soulbound NFT)
  - Lending Pool
  - kUSD Stablecoin

## =Ž Reputation Tiers

| Tier   | Score Range | Credit Multiplier |
|--------|-------------|-------------------|
| >I Bronze | 0-300      | 5x                |
| >H Silver | 301-600    | 10x               |
| >G Gold   | 601-1000   | 15x               |

**Example**: A Gold tier user with $1,000 in sBTC collateral can borrow:
- Base (50% LTV): $500
- Reputation bonus (750 × $15): $11,250
- **Total credit limit**: $11,750

## =€ Getting Started

### Frontend Development
```bash
cd koen-frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Smart Contract Development
```bash
cd koen-protocol
npm install
clarinet test
```

## <¨ Landing Page Features

-  Nexo-inspired professional design
-  Animated iPhone mockup with live app interface
-  Floating notification cards for social proof
-  Trust signals (Operating since 2024, 24/7 support)
-  Full responsive layout
-  Custom animations and glow effects

## =Ë Status

**Current Phase**: MVP Development
- [x] Project setup
- [x] Landing page design
- [ ] Smart contract implementation
- [ ] Wallet integration (Hiro)
- [ ] Testnet deployment

## =à Tech Stack

- **Blockchain**: Stacks (Bitcoin L2)
- **Smart Contracts**: Clarity
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Testing**: Vitest
- **Deployment**: Vercel (frontend), Stacks Testnet (contracts)

## =Ä License

MIT
