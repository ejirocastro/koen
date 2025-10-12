1. User Dashboard Data
Profile/Wallet Section:
interface UserProfile {
  address: string;
  balances: {
    kUSD: number;  // from kusd-token.get-balance()
    sBTC: number;  // from sbtc-token.get-balance()
  };
  reputation: {
    hasNFT: boolean;
    tier: "bronze" | "silver" | "gold";  // from reputation-sbt.get-reputation()
    score: number;
    effectiveAPR: number;  // Calculated: bronze=7%, silver=6%, gold=4.9%
  } | null;
  activeLoansCount: number;  // from p2p-marketplace.get-user-active-loans().length
  canBorrowMore: boolean;  // activeLoansCount < 20
}
2. Marketplace Browse Page
Lending Offers List:
interface LendingOffer {
  offerId: number;
  lender: string;
  amount: number;  // kUSD (6 decimals)
  apr: number;  // basis points (500 = 5%)
  duration: number;  // blocks
  durationDays: number;  // Calculated: blocks / 144
  minReputation: number;
  collateralRatio: number;  // basis points (15000 = 150%)
  status: "open" | "matched" | "cancelled";
  createdAt: number;  // block height
  createdDate: Date;  // Backend converts block to timestamp
}

// Backend endpoint needed:
GET /api/offers?status=open&limit=50
// Response: { offers: LendingOffer[], nextId: number, total: number }
Borrow Requests List:
interface BorrowRequest {
  requestId: number;
  borrower: string;
  amount: number;  // kUSD
  maxAPR: number;  // basis points
  duration: number;  // blocks
  durationDays: number;
  collateralDeposited: number;  // sBTC (8 decimals)
  collateralRatio: number;  // Calculated from current BTC price
  reputationScore: number;
  reputationTier: string;
  status: "open" | "matched" | "cancelled";
  createdAt: number;
}

// Backend endpoint needed:
GET /api/requests?status=open&limit=50
3. Active Loans Page
User's Active Loans:
interface ActiveLoan {
  loanId: number;
  role: "lender" | "borrower";
  counterparty: string;  // borrower if you're lender, vice versa
  principalAmount: number;
  interestRate: number;  // APR in basis points
  startBlock: number;
  startDate: Date;
  endBlock: number;
  dueDate: Date;
  durationDays: number;
  collateralAmount: number;  // sBTC
  collateralValueUSD: number;  // Calculated with current price
  
  // Real-time calculated values:
  currentDebt: number;  // from p2p-marketplace.get-loan-current-debt()
  interestAccrued: number;
  healthFactor: number;  // from liquidation check
  isLiquidatable: boolean;  // from p2p-marketplace.is-loan-liquidatable()
  isOverdue: boolean;
  daysRemaining: number;
  blocksRemaining: number;
  
  status: "active" | "repaid" | "liquidated";
  offerId: number;
  requestId: number;
}

// Backend endpoints needed:
GET /api/loans/user/:address?role=all  // Gets all loans where user is lender or borrower
GET /api/loans/:loanId  // Get specific loan details
GET /api/loans/:loanId/health  // Get current health metrics
4. Create Offer/Request Forms
Form with Real-time Validation:
interface OfferFormData {
  amount: number;
  apr: number;
  duration: number;  // in days, convert to blocks (days * 144)
  minReputation: number;
  collateralRatio: number;  // percentage (150 = 150%)
}

interface RequestFormData {
  amount: number;
  maxAPR: number;
  duration: number;  // days
  collateralAmount: number;  // sBTC
  
  // Frontend calculates and displays:
  estimatedCollateralRatio: number;
  currentBTCPrice: number;
  totalRepayment: number;
  userReputation: UserReputation;
}

// Backend endpoints needed:
GET /api/oracle/price  // Get current sBTC price
GET /api/oracle/valid  // Check if price is fresh (< 24 hours)
POST /api/offers  // Submit offer (calls contract)
POST /api/requests  // Submit request (calls contract)
5. Matching Interface
Match Offers to Requests:
interface MatchingPair {
  offer: LendingOffer;
  request: BorrowRequest;
  isCompatible: boolean;
  compatibilityIssues: string[];  // ["Amount mismatch", "APR too high", etc.]
}

// Backend endpoint:
GET /api/matching/compatible?offerId=X&requestId=Y
// Returns compatibility check before user confirms match
6. Liquidation Dashboard
Liquidatable Loans (for liquidators):
interface LiquidatableLoan {
  loanId: number;
  borrower: string;
  lender: string;
  totalDebt: number;  // principal + interest
  collateralAmount: number;
  collateralValue: number;
  healthFactor: number;  // < 80% = liquidatable
  isOverdue: boolean;
  liquidationBonus: number;  // 5% of collateral
  estimatedProfit: number;  // Bonus in USD
  reasonForLiquidation: "overdue" | "undercollateralized" | "both";
}

// Backend endpoint:
GET /api/liquidation/opportunities
7. Statistics/Analytics
Marketplace Stats:
interface MarketplaceStats {
  totalOffersCreated: number;
  totalRequestsCreated: number;
  totalLoansCreated: number;
  totalVolumeLent: number;  // cumulative kUSD
  totalInterestEarned: number;
  activeOffers: number;
  activeRequests: number;
  activeLoans: number;
  averageAPR: number;
  averageCollateralRatio: number;
}

// Backend endpoint:
GET /api/stats/marketplace  // from p2p-marketplace.get-marketplace-stats()
8. Price Oracle Data
Oracle Information:
interface OracleData {
  sbtcPrice: number;  // micro-USD (6 decimals)
  sbtcPriceFormatted: number;  // USD
  lastUpdateBlock: number;
  lastUpdateTime: Date;
  ageInBlocks: number;
  isValid: boolean;  // < 144 blocks old
  staleness: "fresh" | "stale";
}

// Backend endpoint:
GET /api/oracle
9. Transaction History
User Activity Feed:
interface Transaction {
  txId: string;
  type: "offer-created" | "request-created" | "loan-created" | "loan-repaid" | "loan-liquidated" | "offer-cancelled" | "request-cancelled";
  timestamp: Date;
  blockHeight: number;
  details: {
    amount?: number;
    apr?: number;
    loanId?: number;
    offerId?: number;
    requestId?: number;
  };
  status: "success" | "pending" | "failed";
}

// Backend endpoint:
GET /api/transactions/:address?type=all&limit=50
10. WebSocket Real-time Updates
Live Data Streams:
// WebSocket messages frontend should listen for:
interface WebSocketMessage {
  type: "new-offer" | "new-request" | "loan-matched" | "loan-repaid" | "loan-liquidated" | "price-update";
  data: LendingOffer | BorrowRequest | ActiveLoan | OracleData;
}

// Connect to:
ws://backend/ws/marketplace
Backend Architecture Recommendations:
1. Indexer Service
Continuously monitors blockchain events
Indexes all contract events: offer-created, loan-created, etc.
Stores in database for fast queries
2. API Endpoints Structure
/api/v1/
  /offers
    GET / - list offers
    GET /:id - get offer
    POST / - create offer
    DELETE /:id - cancel offer
  
  /requests
    GET / - list requests
    GET /:id - get request
    POST / - create request
    DELETE /:id - cancel request
  
  /loans
    GET / - list loans
    GET /:id - get loan
    GET /user/:address - user's loans
    POST /match - match offer to request
    POST /:id/repay - repay loan
    POST /:id/liquidate - liquidate loan
  
  /oracle
    GET /price - current price
    GET /valid - price validity
  
  /reputation
    GET /:address - user reputation
  
  /stats
    GET /marketplace - marketplace stats
    GET /user/:address - user stats
3. Calculation Service
Backend should calculate:
Block height → Human-readable dates
Basis points → Percentages
Real-time interest accrual
Health factors
Collateral ratios at current prices
Days remaining on loans
4. Notification Service
Alert users when:
Loan is approaching due date
Health factor drops below 90%
New matching offer/request available
Liquidation imminent
Would you like me to create sample React components or API endpoint specifications for any specific section?