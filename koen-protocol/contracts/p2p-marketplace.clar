;; title: p2p-marketplace
;; version: 1.0.0
;; summary: Koen Protocol P2P Marketplace - Direct lender-to-borrower lending
;; description: Pure P2P lending marketplace with reputation-based matching, custom terms, and time-based interest

;; traits
;;

;; token definitions
;;

;; constants
(define-constant CONTRACT_OWNER tx-sender)

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_PAUSED (err u402))
(define-constant ERR_INVALID_AMOUNT (err u501))
(define-constant ERR_INVALID_APR (err u502))
(define-constant ERR_INVALID_DURATION (err u503))
(define-constant ERR_INVALID_COLLATERAL_RATIO (err u504))
(define-constant ERR_OFFER_NOT_FOUND (err u505))
(define-constant ERR_REQUEST_NOT_FOUND (err u506))
(define-constant ERR_LOAN_NOT_FOUND (err u507))
(define-constant ERR_OFFER_NOT_OPEN (err u508))
(define-constant ERR_REQUEST_NOT_OPEN (err u509))
(define-constant ERR_INSUFFICIENT_REPUTATION (err u510))
(define-constant ERR_INSUFFICIENT_COLLATERAL (err u511))
(define-constant ERR_APR_TOO_HIGH (err u512))
(define-constant ERR_TERMS_MISMATCH (err u513))
(define-constant ERR_LOAN_NOT_ACTIVE (err u514))
(define-constant ERR_NOT_LENDER (err u515))
(define-constant ERR_NOT_BORROWER (err u516))
(define-constant ERR_LOAN_NOT_DUE (err u517))
(define-constant ERR_NOT_LIQUIDATABLE (err u518))
(define-constant ERR_ORACLE_FAILURE (err u519))
(define-constant ERR_STALE_PRICE (err u520))
(define-constant ERR_BORROW_AMOUNT_EXCEEDS_LIMIT (err u521))
(define-constant ERR_OFFER_EXPIRED (err u522)) ;; SECURITY: Offer too old (age protection)
(define-constant ERR_REQUEST_EXPIRED (err u523)) ;; SECURITY: Request too old (age protection)
(define-constant ERR_PRICE_DEVIATION_TOO_LARGE (err u524)) ;; SECURITY: Price moved >10% (slippage protection)

;; Protocol parameters
(define-constant BLOCKS_PER_YEAR u52560) ;; ~10 min blocks = 52560 blocks/year
(define-constant MAX_APR u10000) ;; 100% maximum APR
(define-constant MIN_COLLATERAL_RATIO u10000) ;; 100% minimum collateral
(define-constant LIQUIDATION_THRESHOLD u8000) ;; 80% health factor for liquidation
(define-constant LIQUIDATION_BONUS u500) ;; 5% bonus for liquidator
(define-constant BLOCKS_PER_YEAR_BPS (* BLOCKS_PER_YEAR u10000)) ;; Gas optimization: pre-calculated
(define-constant MAX_PRICE_AGE_BLOCKS u144) ;; 24 hours max price staleness (~10 min blocks)
(define-constant MAX_LOAN_DURATION u262800) ;; SECURITY: ~5 years maximum loan duration (prevents permanent lockup)

;; SECURITY: Hybrid slippage protection parameters
(define-constant MAX_OFFER_AGE_BLOCKS u1440) ;; ~10 days max age for offers/requests
(define-constant MAX_PRICE_DEVIATION_BPS u1000) ;; 10% maximum price deviation from snapshot

;; Status constants
(define-constant STATUS_OPEN "open")
(define-constant STATUS_MATCHED "matched")
(define-constant STATUS_CANCELLED "cancelled")
(define-constant STATUS_ACTIVE "active")
(define-constant STATUS_REPAID "repaid")
(define-constant STATUS_LIQUIDATED "liquidated")
(define-constant STATUS_DEFAULTED "defaulted")

;; data vars

;; Emergency pause
(define-data-var is-paused bool false)

;; Counter for offers, requests, and loans
(define-data-var next-offer-id uint u1)
(define-data-var next-request-id uint u1)
(define-data-var next-loan-id uint u1)

;; Statistics
(define-data-var total-offers-created uint u0)
(define-data-var total-requests-created uint u0)
(define-data-var total-loans-created uint u0)
(define-data-var total-volume-lent uint u0)
(define-data-var total-interest-earned uint u0)

;; data maps

;; ============================================
;; PHASE 1: CORE DATA STRUCTURES
;; ============================================

;; Lending Offers - Lenders post terms they're willing to lend at
(define-map lending-offers
    uint ;; offer-id
    {
        lender: principal,
        amount: uint, ;; kUSD amount to lend
        apr: uint, ;; Annual percentage rate (basis points)
        duration: uint, ;; Loan duration in blocks
        min-reputation: uint, ;; Minimum borrower reputation score
        collateral-ratio: uint, ;; Required collateral ratio (basis points, e.g., 15000 = 150%)
        status: (string-ascii 10), ;; "open", "matched", "cancelled"
        created-at: uint, ;; Block height when created
        sbtc-price-snapshot: uint, ;; SECURITY: sBTC price at creation (for slippage protection)
    }
)

;; Borrow Requests - Borrowers post what they need
(define-map borrow-requests
    uint ;; request-id
    {
        borrower: principal,
        amount: uint, ;; kUSD amount needed
        max-apr: uint, ;; Maximum APR willing to pay
        duration: uint, ;; Desired loan duration in blocks
        collateral-deposited: uint, ;; sBTC amount locked as collateral
        reputation-score: uint, ;; Borrower's reputation at time of request
        status: (string-ascii 10), ;; "open", "matched", "cancelled"
        created-at: uint, ;; Block height when created
        sbtc-price-snapshot: uint, ;; SECURITY: sBTC price at creation (for slippage protection)
    }
)

;; Active Loans - Matched loans between lenders and borrowers
(define-map active-loans
    uint ;; loan-id
    {
        lender: principal,
        borrower: principal,
        principal-amount: uint, ;; Original loan amount
        interest-rate: uint, ;; Agreed APR (basis points)
        start-block: uint, ;; When loan started
        end-block: uint, ;; When loan is due
        collateral-amount: uint, ;; sBTC locked as collateral
        interest-accrued: uint, ;; Interest accumulated so far
        last-update-block: uint, ;; Last time interest was calculated
        status: (string-ascii 10), ;; "active", "repaid", "liquidated", "defaulted"
        offer-id: uint, ;; Reference to original offer
        request-id: uint, ;; Reference to original request
    }
)

;; Track user's active loans
(define-map user-active-loans
    principal
    (list 20 uint) ;; List of loan IDs (max 20 concurrent loans)
)

;; Track offer to loan mapping
(define-map offer-to-loan
    uint ;; offer-id
    uint ;; loan-id
)

;; Track request to loan mapping
(define-map request-to-loan
    uint ;; request-id
    uint ;; loan-id
)

;; public functions

;; ============================================
;; PHASE 1: OFFER MANAGEMENT
;; ============================================

;; Create a lending offer
(define-public (create-lending-offer
        (amount uint)
        (apr uint)
        (duration uint)
        (min-reputation uint)
        (collateral-ratio uint)
    )
    (begin
        (asserts! (not (var-get is-paused)) ERR_PAUSED)
        (let (
                (offer-id (var-get next-offer-id))
                ;; SECURITY: Capture current sBTC price for slippage protection
                (current-sbtc-price (try! (get-validated-sbtc-price)))
            )
            ;; Validations
            (asserts! (> amount u0) ERR_INVALID_AMOUNT)
            (asserts! (and (> apr u0) (<= apr MAX_APR)) ERR_INVALID_APR)
            ;; SECURITY: Validate duration is within reasonable bounds
            (asserts! (and (> duration u0) (<= duration MAX_LOAN_DURATION))
                ERR_INVALID_DURATION
            )
            (asserts! (>= collateral-ratio MIN_COLLATERAL_RATIO)
                ERR_INVALID_COLLATERAL_RATIO
            )

            ;; Lock lender's kUSD in contract
            (try! (contract-call? .kusd-token transfer amount tx-sender
                (as-contract tx-sender) none
            ))

            ;; Store offer with price snapshot
            (map-set lending-offers offer-id {
                lender: tx-sender,
                amount: amount,
                apr: apr,
                duration: duration,
                min-reputation: min-reputation,
                collateral-ratio: collateral-ratio,
                status: STATUS_OPEN,
                created-at: stacks-block-height,
                sbtc-price-snapshot: current-sbtc-price,
            })

            ;; Increment counters
            (var-set next-offer-id (+ offer-id u1))
            (var-set total-offers-created (+ (var-get total-offers-created) u1))

            (print {
                event: "offer-created",
                offer-id: offer-id,
                lender: tx-sender,
                amount: amount,
                apr: apr,
            })
            (ok offer-id)
        )
    )
)

;; Cancel a lending offer (only if not matched)
(define-public (cancel-lending-offer (offer-id uint))
    (begin
        (asserts! (not (var-get is-paused)) ERR_PAUSED)
        (let ((offer (unwrap! (map-get? lending-offers offer-id) ERR_OFFER_NOT_FOUND)))
            ;; Check authorization
            (asserts! (is-eq tx-sender (get lender offer)) ERR_UNAUTHORIZED)
            (asserts! (is-eq (get status offer) STATUS_OPEN) ERR_OFFER_NOT_OPEN)

            ;; Return kUSD to lender
            (try! (as-contract (contract-call? .kusd-token transfer (get amount offer) tx-sender
                (get lender offer) none
            )))

            ;; Update status
            (map-set lending-offers offer-id
                (merge offer { status: STATUS_CANCELLED })
            )

            (print {
                event: "offer-cancelled",
                offer-id: offer-id,
                lender: tx-sender,
            })
            (ok true)
        )
    )
)

;; ============================================
;; PHASE 1: REQUEST MANAGEMENT
;; ============================================

;; Create a borrow request
(define-public (create-borrow-request
        (amount uint)
        (max-apr uint)
        (duration uint)
        (collateral-amount uint)
    )
    (begin
        (asserts! (not (var-get is-paused)) ERR_PAUSED)
        (let (
                (request-id (var-get next-request-id))
                (reputation-response (contract-call? .reputation-sbt get-reputation tx-sender))
                (reputation-score (match reputation-response
                    success (get score success)
                    error
                    u0
                ))
                ;; SECURITY: Capture current sBTC price for slippage protection
                (current-sbtc-price (try! (get-validated-sbtc-price)))
            )
            ;; Validations
            (asserts! (> amount u0) ERR_INVALID_AMOUNT)
            (asserts! (and (> max-apr u0) (<= max-apr MAX_APR)) ERR_INVALID_APR)
            ;; SECURITY: Validate duration is within reasonable bounds
            (asserts! (and (> duration u0) (<= duration MAX_LOAN_DURATION))
                ERR_INVALID_DURATION
            )
            (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

            ;; CRITICAL: Validate that borrower's request doesn't exceed their max borrowing power
            ;; Use MIN_COLLATERAL_RATIO (100%) as baseline - if they can't meet this, they definitely
            ;; can't match with any lender (since lenders typically require 120-200%)
            (let ((max-possible-borrow (try! (calculate-max-borrow-amount tx-sender collateral-amount
                    MIN_COLLATERAL_RATIO
                ))))
                (asserts! (<= amount max-possible-borrow)
                    ERR_BORROW_AMOUNT_EXCEEDS_LIMIT
                )
            )

            ;; Lock borrower's sBTC collateral in contract
            (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer collateral-amount tx-sender
                (as-contract tx-sender) none
            ))

            ;; Store request with price snapshot
            (map-set borrow-requests request-id {
                borrower: tx-sender,
                amount: amount,
                max-apr: max-apr,
                duration: duration,
                collateral-deposited: collateral-amount,
                reputation-score: reputation-score,
                status: STATUS_OPEN,
                created-at: stacks-block-height,
                sbtc-price-snapshot: current-sbtc-price,
            })

            ;; Increment counters
            (var-set next-request-id (+ request-id u1))
            (var-set total-requests-created
                (+ (var-get total-requests-created) u1)
            )

            (print {
                event: "request-created",
                request-id: request-id,
                borrower: tx-sender,
                amount: amount,
                max-apr: max-apr,
            })
            (ok request-id)
        )
    )
)

;; Cancel a borrow request (only if not matched)
(define-public (cancel-borrow-request (request-id uint))
    (begin
        (asserts! (not (var-get is-paused)) ERR_PAUSED)
        (let ((request (unwrap! (map-get? borrow-requests request-id) ERR_REQUEST_NOT_FOUND)))
            ;; Check authorization
            (asserts! (is-eq tx-sender (get borrower request)) ERR_UNAUTHORIZED)
            (asserts! (is-eq (get status request) STATUS_OPEN)
                ERR_REQUEST_NOT_OPEN
            )

            ;; Return sBTC collateral to borrower
            (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
                (get collateral-deposited request) tx-sender
                (get borrower request) none
            )))

            ;; Update status
            (map-set borrow-requests request-id
                (merge request { status: STATUS_CANCELLED })
            )

            (print {
                event: "request-cancelled",
                request-id: request-id,
                borrower: tx-sender,
            })
            (ok true)
        )
    )
)

;; ============================================
;; PHASE 2: LOAN MATCHING & EXECUTION
;; ============================================

;; Match an offer to a request and create a loan
;; SECURITY: Implements hybrid slippage protection (authorization + age limits + price deviation)
(define-public (match-offer-to-request
        (offer-id uint)
        (request-id uint)
    )
    (begin
        (asserts! (not (var-get is-paused)) ERR_PAUSED)
        (let (
                (offer (unwrap! (map-get? lending-offers offer-id) ERR_OFFER_NOT_FOUND))
                (request (unwrap! (map-get? borrow-requests request-id)
                    ERR_REQUEST_NOT_FOUND
                ))
                (loan-id (var-get next-loan-id))
                ;; SECURITY: Get current price for slippage check
                (current-price (try! (get-validated-sbtc-price)))
            )
            ;; Verify both are open
            (asserts! (is-eq (get status offer) STATUS_OPEN) ERR_OFFER_NOT_OPEN)
            (asserts! (is-eq (get status request) STATUS_OPEN)
                ERR_REQUEST_NOT_OPEN
            )

            ;; ===================================================================
            ;; SECURITY: HYBRID SLIPPAGE PROTECTION (3 LAYERS)
            ;; ===================================================================

            ;; Layer 1: Authorization - Only lender or borrower can execute match
            (asserts!
                (or
                    (is-eq tx-sender (get lender offer))
                    (is-eq tx-sender (get borrower request))
                )
                ERR_UNAUTHORIZED
            )

            ;; Layer 2: Age limits - Reject stale offers/requests (>10 days old)
            (let (
                    (offer-age (- stacks-block-height (get created-at offer)))
                    (request-age (- stacks-block-height (get created-at request)))
                )
                (asserts! (< offer-age MAX_OFFER_AGE_BLOCKS) ERR_OFFER_EXPIRED)
                (asserts! (< request-age MAX_OFFER_AGE_BLOCKS)
                    ERR_REQUEST_EXPIRED
                )
            )

            ;; Layer 3: Price deviation - Reject if price moved >10% from snapshot
            (let (
                    (offer-deviation (calculate-price-deviation current-price
                        (get sbtc-price-snapshot offer)
                    ))
                    (request-deviation (calculate-price-deviation current-price
                        (get sbtc-price-snapshot request)
                    ))
                )
                (asserts! (<= offer-deviation MAX_PRICE_DEVIATION_BPS)
                    ERR_PRICE_DEVIATION_TOO_LARGE
                )
                (asserts! (<= request-deviation MAX_PRICE_DEVIATION_BPS)
                    ERR_PRICE_DEVIATION_TOO_LARGE
                )
            )

            ;; ===================================================================
            ;; END SLIPPAGE PROTECTION - Continue with normal matching logic
            ;; ==================================================================="

            ;; Verify terms match
            (asserts! (is-eq (get amount offer) (get amount request))
                ERR_TERMS_MISMATCH
            )
            (asserts! (is-eq (get duration offer) (get duration request))
                ERR_TERMS_MISMATCH
            )

            ;; Verify borrower meets lender's requirements
            (asserts!
                (>= (get reputation-score request) (get min-reputation offer))
                ERR_INSUFFICIENT_REPUTATION
            )
            (asserts! (<= (get apr offer) (get max-apr request)) ERR_APR_TOO_HIGH)

            ;; Verify collateral ratio WITH reputation bonus applied
            ;; Higher reputation users get bonus borrowing power with same collateral
            (let ((collateral-ratio-effective (try! (calculate-effective-collateral-ratio request-id))))
                (asserts!
                    (>= collateral-ratio-effective (get collateral-ratio offer))
                    ERR_INSUFFICIENT_COLLATERAL
                )

                ;; Check loan limits BEFORE any state changes
                (let (
                        (lender-loans (default-to (list)
                            (map-get? user-active-loans (get lender offer))
                        ))
                        (borrower-loans (default-to (list)
                            (map-get? user-active-loans (get borrower request))
                        ))
                    )
                    (asserts! (< (len lender-loans) u20) (err u601))
                    (asserts! (< (len borrower-loans) u20) (err u602))

                    ;; Create active loan
                    (map-set active-loans loan-id {
                        lender: (get lender offer),
                        borrower: (get borrower request),
                        principal-amount: (get amount offer),
                        interest-rate: (get apr offer),
                        start-block: stacks-block-height,
                        end-block: (+ stacks-block-height (get duration offer)),
                        collateral-amount: (get collateral-deposited request),
                        interest-accrued: u0,
                        last-update-block: stacks-block-height,
                        status: STATUS_ACTIVE,
                        offer-id: offer-id,
                        request-id: request-id,
                    })

                    ;; Transfer kUSD from contract to borrower (already locked by lender)
                    (try! (as-contract (contract-call? .kusd-token transfer (get amount offer)
                        tx-sender (get borrower request) none
                    )))

                    ;; Update offer and request status
                    (map-set lending-offers offer-id
                        (merge offer { status: STATUS_MATCHED })
                    )
                    (map-set borrow-requests request-id
                        (merge request { status: STATUS_MATCHED })
                    )

                    ;; Track mappings
                    (map-set offer-to-loan offer-id loan-id)
                    (map-set request-to-loan request-id loan-id)

                    ;; Track user's active loans (we already checked limits above)
                    (map-set user-active-loans (get lender offer)
                        (unwrap-panic (as-max-len? (append lender-loans loan-id) u20))
                    )
                    (map-set user-active-loans (get borrower request)
                        (unwrap-panic (as-max-len? (append borrower-loans loan-id) u20))
                    )

                    ;; Update statistics
                    (var-set next-loan-id (+ loan-id u1))
                    (var-set total-loans-created
                        (+ (var-get total-loans-created) u1)
                    )
                    (var-set total-volume-lent
                        (+ (var-get total-volume-lent) (get amount offer))
                    )

                    (print {
                        event: "loan-created",
                        loan-id: loan-id,
                        lender: (get lender offer),
                        borrower: (get borrower request),
                        amount: (get amount offer),
                        apr: (get apr offer),
                        duration: (get duration offer),
                    })
                    (ok loan-id)
                )
            )
        )
    )
)

;; ============================================
;; PHASE 2: LOAN REPAYMENT
;; ============================================

;; Repay a loan (principal + accrued interest)
(define-public (repay-loan (loan-id uint))
    (begin
        (asserts! (not (var-get is-paused)) ERR_PAUSED)
        (let ((loan (unwrap! (map-get? active-loans loan-id) ERR_LOAN_NOT_FOUND)))
            ;; Only borrower can repay
            (asserts! (is-eq tx-sender (get borrower loan)) ERR_NOT_BORROWER)
            (asserts! (is-eq (get status loan) STATUS_ACTIVE) ERR_LOAN_NOT_ACTIVE)

            ;; Calculate current interest
            (let (
                    (accrued-interest (calculate-accrued-interest (get principal-amount loan)
                        (get interest-rate loan)
                        (get last-update-block loan) stacks-block-height
                    ))
                    (total-interest (+ (get interest-accrued loan) accrued-interest))
                    (total-due (+ (get principal-amount loan) total-interest))
                    (fee (/ total-interest u200)) ;; 0.5% of the interest
                )
                ;; Transfer principal + (interest - fee) to the lender
                (try! (contract-call? .kusd-token transfer (- total-due fee) tx-sender
                    (get lender loan) none
                ))
                ;; Transfer fee to contract owner
                (try! (contract-call? .kusd-token transfer fee tx-sender CONTRACT_OWNER
                    none
                ))

                ;; Return sBTC collateral to borrower
                (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer (get collateral-amount loan)
                    tx-sender (get borrower loan) none
                )))

                ;; Update loan status
                (map-set active-loans loan-id
                    (merge loan {
                        status: STATUS_REPAID,
                        interest-accrued: total-interest,
                        last-update-block: stacks-block-height,
                    })
                )

                ;; Update statistics
                (var-set total-interest-earned
                    (+ (var-get total-interest-earned) total-interest)
                )

                (print {
                    event: "loan-repaid",
                    loan-id: loan-id,
                    borrower: tx-sender,
                    principal: (get principal-amount loan),
                    interest: total-interest,
                    total: total-due,
                })
                (ok total-due)
            )
        )
    )
)

;; ============================================
;; PHASE 2: LIQUIDATION
;; ============================================

;; Liquidate an unhealthy or overdue loan
;; SECURITY: Uses Checks-Effects-Interactions pattern to prevent reentrancy
(define-public (liquidate-loan (loan-id uint))
    (begin
        (asserts! (not (var-get is-paused)) ERR_PAUSED)
        (let (
                (loan (unwrap! (map-get? active-loans loan-id) ERR_LOAN_NOT_FOUND))
                (caller tx-sender) ;; Capture caller before as-contract
            )
            ;; CHECKS: Verify loan is active and liquidatable
            (asserts! (is-eq (get status loan) STATUS_ACTIVE) ERR_LOAN_NOT_ACTIVE)

            ;; Check if liquidatable (either undercollateralized or overdue)
            (let ((is-liquidatable-result (try! (is-loan-liquidatable loan-id))))
                (asserts! is-liquidatable-result ERR_NOT_LIQUIDATABLE)

                ;; Calculate interest owed and collateral distribution
                (let (
                        (accrued-interest (calculate-accrued-interest (get principal-amount loan)
                            (get interest-rate loan)
                            (get last-update-block loan) stacks-block-height
                        ))
                        (total-interest (+ (get interest-accrued loan) accrued-interest))
                        (liquidation-bonus-amount (/ (* (get collateral-amount loan) LIQUIDATION_BONUS)
                            u10000
                        ))
                        (lender-amount (- (get collateral-amount loan) liquidation-bonus-amount))
                    )
                    ;; EFFECTS: Update state BEFORE external calls (reentrancy protection)
                    (map-set active-loans loan-id
                        (merge loan {
                            status: STATUS_LIQUIDATED,
                            interest-accrued: total-interest,
                            last-update-block: stacks-block-height,
                        })
                    )

                    ;; INTERACTIONS: External calls happen AFTER state changes
                    ;; Transfer collateral: logic depends on who liquidates
                    (if (is-eq caller (get lender loan))
                        ;; Lender liquidates - gets all collateral
                        (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
                            (get collateral-amount loan) tx-sender
                            (get lender loan) none
                        )))
                        ;; Third party liquidates - lender gets reduced amount, liquidator gets bonus
                        (begin
                            (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer lender-amount
                                tx-sender (get lender loan) none
                            )))
                            (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
                                liquidation-bonus-amount tx-sender caller
                                none
                            )))
                        )
                    )

                    ;; Burn borrower's reputation SBT (punishment for default)
                    (try! (contract-call? .reputation-sbt burn-sbt (get borrower loan)))

                    (print {
                        event: "loan-liquidated",
                        loan-id: loan-id,
                        borrower: (get borrower loan),
                        lender: (get lender loan),
                        liquidator: caller,
                        collateral-seized: (get collateral-amount loan),
                        liquidation-bonus: liquidation-bonus-amount,
                    })
                    (ok true)
                )
            )
        )
    )
)

;; ============================================
;; PHASE 3: QUERY FUNCTIONS
;; ============================================

;; Get lending offer details
(define-read-only (get-lending-offer (offer-id uint))
    (ok (map-get? lending-offers offer-id))
)

;; Get borrow request details
(define-read-only (get-borrow-request (request-id uint))
    (ok (map-get? borrow-requests request-id))
)

;; Get active loan details
(define-read-only (get-active-loan (loan-id uint))
    (ok (map-get? active-loans loan-id))
)

;; Get loan by offer ID
(define-read-only (get-loan-by-offer (offer-id uint))
    (ok (map-get? offer-to-loan offer-id))
)

;; Get loan by request ID
(define-read-only (get-loan-by-request (request-id uint))
    (ok (map-get? request-to-loan request-id))
)

;; Get user's active loans
(define-read-only (get-user-active-loans (user principal))
    (ok (default-to (list) (map-get? user-active-loans user)))
)

;; Get marketplace statistics
(define-read-only (get-marketplace-stats)
    (ok {
        total-offers-created: (var-get total-offers-created),
        total-requests-created: (var-get total-requests-created),
        total-loans-created: (var-get total-loans-created),
        total-volume-lent: (var-get total-volume-lent),
        total-interest-earned: (var-get total-interest-earned),
    })
)

;; Get current loan debt (principal + accrued interest)
(define-read-only (get-loan-current-debt (loan-id uint))
    (match (map-get? active-loans loan-id)
        loan (let (
                (accrued-interest (calculate-accrued-interest (get principal-amount loan)
                    (get interest-rate loan) (get last-update-block loan)
                    stacks-block-height
                ))
                (total-interest (+ (get interest-accrued loan) accrued-interest))
            )
            (ok (+ (get principal-amount loan) total-interest))
        )
        (ok u0)
    )
)

;; Check if a loan is liquidatable
(define-read-only (is-loan-liquidatable (loan-id uint))
    (match (map-get? active-loans loan-id)
        loan (let (
                ;; Check if loan is overdue
                (is-overdue (>= stacks-block-height (get end-block loan)))
                ;; Check if undercollateralized with validated price
                (sbtc-price (try! (get-validated-sbtc-price)))
                (accrued-interest (calculate-accrued-interest (get principal-amount loan)
                    (get interest-rate loan) (get last-update-block loan)
                    stacks-block-height
                ))
                (total-debt (+ (get principal-amount loan) (get interest-accrued loan)
                    accrued-interest
                ))
                ;; Collateral value in microUSD
                (collateral-value (/ (* (get collateral-amount loan) sbtc-price) u100000000))
                ;; Health factor = (collateral-value * 10000) / total-debt
                (health-factor (if (> total-debt u0)
                    (/ (* collateral-value u10000) total-debt)
                    u10000
                ))
                (is-undercollateralized (< health-factor LIQUIDATION_THRESHOLD))
            )
            (ok (or is-overdue is-undercollateralized))
        )
        (ok false)
    )
)

;; Calculate collateral ratio for a borrow request (WITHOUT reputation bonus)
;; This is the raw collateral ratio before any bonuses are applied
(define-read-only (calculate-collateral-ratio-for-request (request-id uint))
    (match (map-get? borrow-requests request-id)
        request (let (
                ;; Get validated price with staleness check
                (sbtc-price (try! (get-validated-sbtc-price)))
                ;; Collateral value in microUSD (6 decimals)
                (collateral-value (/ (* (get collateral-deposited request) sbtc-price) u100000000))
                ;; Collateral ratio = (collateral-value * 10000) / loan-amount
                (collateral-ratio (/ (* collateral-value u10000) (get amount request)))
            )
            (ok collateral-ratio)
        )
        ERR_REQUEST_NOT_FOUND
    )
)

;; Calculate EFFECTIVE collateral ratio with reputation bonus applied
;; Higher reputation = can borrow more with same collateral = higher effective ratio
;; Example: 15000 (150%) base ratio with Silver 15% bonus = 17250 (172.5%) effective
(define-read-only (calculate-effective-collateral-ratio (request-id uint))
    (match (map-get? borrow-requests request-id)
        request (let (
                ;; Get base collateral ratio
                (base-ratio (try! (calculate-collateral-ratio-for-request request-id)))
                ;; Get borrower's reputation multiplier (0, 1500, or 3000 basis points)
                (multiplier (get-borrower-multiplier (get borrower request)))
                ;; Apply bonus: effective-ratio = base-ratio * (1 + multiplier/10000)
                ;; Example: 15000 * (1 + 1500/10000) = 15000 * 1.15 = 17250
                (effective-ratio (/ (* base-ratio (+ u10000 multiplier)) u10000))
            )
            (ok effective-ratio)
        )
        ERR_REQUEST_NOT_FOUND
    )
)

;; Calculate maximum borrowing power for a user given collateral and required ratio
;; Returns the max amount they can borrow WITH reputation bonus applied
;; user: the borrower
;; collateral-amount: amount of sBTC they want to deposit
;; required-ratio: the collateral ratio required by lender (basis points, e.g., 15000 = 150%)
(define-read-only (calculate-max-borrow-amount
        (user principal)
        (collateral-amount uint)
        (required-ratio uint)
    )
    (let (
            ;; Get current sBTC price
            (sbtc-price (try! (get-validated-sbtc-price)))
            ;; Calculate collateral value in microUSD
            (collateral-value (/ (* collateral-amount sbtc-price) u100000000))
            ;; Get user's reputation multiplier
            (multiplier (get-borrower-multiplier user))
            ;; Apply reputation bonus to collateral value
            ;; effective-collateral = collateral * (1 + multiplier/10000)
            (effective-collateral-value (/ (* collateral-value (+ u10000 multiplier)) u10000))
            ;; Calculate max borrow: effective-collateral / (required-ratio / 10000)
            ;; Simplified: (effective-collateral * 10000) / required-ratio
            (max-borrow (/ (* effective-collateral-value u10000) required-ratio))
        )
        (ok max-borrow)
    )
)

;; Helper function for users to preview their borrowing power
;; Shows how much they can borrow with different collateral ratios
(define-read-only (get-user-borrowing-power
        (user principal)
        (collateral-amount uint)
    )
    (let (
            (sbtc-price (try! (get-validated-sbtc-price)))
            (multiplier (get-borrower-multiplier user))
            (collateral-value (/ (* collateral-amount sbtc-price) u100000000))
            (effective-value (/ (* collateral-value (+ u10000 multiplier)) u10000))
            ;; Calculate max borrow at different common ratios
            (max-at-100 (/ (* effective-value u10000) u10000)) ;; 100% ratio
            (max-at-120 (/ (* effective-value u10000) u12000)) ;; 120% ratio
            (max-at-150 (/ (* effective-value u10000) u15000)) ;; 150% ratio
            (max-at-200 (/ (* effective-value u10000) u20000)) ;; 200% ratio
        )
        (ok {
            user: user,
            collateral-deposited: collateral-amount,
            collateral-value-usd: collateral-value,
            effective-value-with-bonus: effective-value,
            reputation-multiplier: multiplier,
            max-borrow-at-100-percent: max-at-100,
            max-borrow-at-120-percent: max-at-120,
            max-borrow-at-150-percent: max-at-150,
            max-borrow-at-200-percent: max-at-200,
        })
    )
)

;; private functions

;; Calculate accrued interest between two blocks with rounding
;; SECURITY: Reordered calculations to prevent integer overflow
(define-private (calculate-accrued-interest
        (principal uint)
        (apr uint)
        (start-block uint)
        (end-block uint)
    )
    (let ((blocks-elapsed (- end-block start-block)))
        (if (is-eq blocks-elapsed u0)
            u0
            ;; SECURITY: Calculate in safer order to avoid overflow
            ;; Old: (principal * apr * blocks) / (BLOCKS_PER_YEAR * 10000)
            ;; New: ((principal * apr) / 10000) * blocks / BLOCKS_PER_YEAR
            ;; This reduces intermediate values and prevents overflow
            (let (
                    ;; Step 1: Calculate (principal * apr) / 10000 first
                    (principal-times-apr-normalized (/ (* principal apr) u10000))
                    ;; Step 2: Multiply by blocks elapsed
                    (interest-numerator (* principal-times-apr-normalized blocks-elapsed))
                    ;; Step 3: Divide by blocks per year
                    (quotient (/ interest-numerator BLOCKS_PER_YEAR))
                    (remainder (mod interest-numerator BLOCKS_PER_YEAR))
                    (half-denominator (/ BLOCKS_PER_YEAR u2))
                )
                ;; Round up if remainder > half (banker's rounding)
                (if (> remainder half-denominator)
                    (+ quotient u1)
                    quotient
                )
            )
        )
    )
)

;; Get borrower's reputation score
(define-private (get-borrower-reputation (borrower principal))
    (match (contract-call? .reputation-sbt get-reputation borrower)
        success (get score success)
        error
        u0
    )
)

;; Get borrower's reputation tier
(define-private (get-borrower-tier (borrower principal))
    (match (contract-call? .reputation-sbt get-reputation borrower)
        success (get tier success)
        error
        "bronze"
    )
)

;; Get borrower's reputation multiplier (in basis points)
;; Returns: u0 (Bronze/0%), u1500 (Silver/15%), u3000 (Gold/30%)
(define-private (get-borrower-multiplier (borrower principal))
    (match (contract-call? .reputation-sbt get-multiplier borrower)
        multiplier
        multiplier
        error
        u0 ;; Default to Bronze (0% bonus) if no reputation
    )
)

;; Check if oracle price is fresh (not stale)
(define-read-only (is-oracle-price-valid)
    (let ((last-update-block (unwrap-panic (contract-call? .oracle get-last-update-block))))
        (ok (< (- stacks-block-height last-update-block) MAX_PRICE_AGE_BLOCKS))
    )
)

;; Get oracle price with staleness check
(define-private (get-validated-sbtc-price)
    (let (
            (price-response (contract-call? .oracle get-sbtc-price))
            (sbtc-price (unwrap! price-response ERR_ORACLE_FAILURE))
            (last-update-response (contract-call? .oracle get-last-update-block))
            (last-update-block (unwrap! last-update-response ERR_ORACLE_FAILURE))
        )
        ;; Check price freshness
        (if (< (- stacks-block-height last-update-block) MAX_PRICE_AGE_BLOCKS)
            (ok sbtc-price)
            ERR_STALE_PRICE
        )
    )
)

;; SECURITY: Calculate price deviation in basis points (for slippage protection)
;; Returns absolute deviation as percentage * 100 (e.g., 1000 = 10%)
(define-private (calculate-price-deviation
        (current-price uint)
        (snapshot-price uint)
    )
    (if (> current-price snapshot-price)
        ;; Price increased: (current - snapshot) * 10000 / snapshot
        (/ (* (- current-price snapshot-price) u10000) snapshot-price)
        ;; Price decreased: (snapshot - current) * 10000 / snapshot
        (/ (* (- snapshot-price current-price) u10000) snapshot-price)
    )
)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

;; Emergency pause - stops all new operations
(define-public (emergency-pause)
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (var-set is-paused true)
        (print {
            event: "marketplace-paused",
            by: tx-sender,
            block: stacks-block-height,
        })
        (ok true)
    )
)

;; Resume operations after pause
(define-public (emergency-resume)
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (var-set is-paused false)
        (print {
            event: "marketplace-resumed",
            by: tx-sender,
            block: stacks-block-height,
        })
        (ok true)
    )
)

;; Check if marketplace is paused
(define-read-only (is-marketplace-paused)
    (ok (var-get is-paused))
)

;; ============================================
;; ENHANCED QUERY FUNCTIONS
;; ============================================

;; Get next N offer IDs (for pagination/browsing)
(define-read-only (get-next-offer-ids (count uint))
    (ok {
        next-id: (var-get next-offer-id),
        count: count,
    })
)

;; Get next N request IDs (for pagination/browsing)
(define-read-only (get-next-request-ids (count uint))
    (ok {
        next-id: (var-get next-request-id),
        count: count,
    })
)

;; Check if offer meets filters (helper for off-chain filtering)
(define-read-only (check-offer-filters
        (offer-id uint)
        (min-amount uint)
        (max-amount uint)
        (max-apr uint)
    )
    (match (map-get? lending-offers offer-id)
        offer (ok {
            matches: (and
                (is-eq (get status offer) STATUS_OPEN)
                (>= (get amount offer) min-amount)
                (<= (get amount offer) max-amount)
                (<= (get apr offer) max-apr)
            ),
            offer: (some offer),
        })
        (ok {
            matches: false,
            offer: none,
        })
    )
)

;; Check if request meets filters (helper for off-chain filtering)
(define-read-only (check-request-filters
        (request-id uint)
        (min-reputation uint)
        (min-amount uint)
        (max-amount uint)
    )
    (match (map-get? borrow-requests request-id)
        request (ok {
            matches: (and
                (is-eq (get status request) STATUS_OPEN)
                (>= (get reputation-score request) min-reputation)
                (>= (get amount request) min-amount)
                (<= (get amount request) max-amount)
            ),
            request: (some request),
        })
        (ok {
            matches: false,
            request: none,
        })
    )
)

;; Get offer status
(define-read-only (get-offer-status (offer-id uint))
    (match (map-get? lending-offers offer-id)
        offer (ok (some (get status offer)))
        (ok none)
    )
)

;; Get request status
(define-read-only (get-request-status (request-id uint))
    (match (map-get? borrow-requests request-id)
        request (ok (some (get status request)))
        (ok none)
    )
)

;; ============================================
;; COLLATERAL HEALTH MONITORING
;; ============================================

;; Get loan health factor (higher is better, < 8000 = liquidatable)
(define-read-only (get-loan-health-factor (loan-id uint))
    (match (map-get? active-loans loan-id)
        loan (let (
                (sbtc-price (try! (get-validated-sbtc-price)))
                (accrued-interest (calculate-accrued-interest (get principal-amount loan)
                    (get interest-rate loan) (get last-update-block loan)
                    stacks-block-height
                ))
                (total-debt (+ (get principal-amount loan) (get interest-accrued loan)
                    accrued-interest
                ))
                (collateral-value (/ (* (get collateral-amount loan) sbtc-price) u100000000))
                (health-factor (if (> total-debt u0)
                    (/ (* collateral-value u10000) total-debt)
                    u10000
                ))
            )
            (ok health-factor)
        )
        ERR_LOAN_NOT_FOUND
    )
)

;; Get detailed loan health status
(define-read-only (get-loan-health-status (loan-id uint))
    (match (map-get? active-loans loan-id)
        loan (let (
                (sbtc-price (try! (get-validated-sbtc-price)))
                (accrued-interest (calculate-accrued-interest (get principal-amount loan)
                    (get interest-rate loan) (get last-update-block loan)
                    stacks-block-height
                ))
                (total-debt (+ (get principal-amount loan) (get interest-accrued loan)
                    accrued-interest
                ))
                (collateral-value (/ (* (get collateral-amount loan) sbtc-price) u100000000))
                (health-factor (if (> total-debt u0)
                    (/ (* collateral-value u10000) total-debt)
                    u10000
                ))
                (is-overdue (>= stacks-block-height (get end-block loan)))
                (is-undercollateralized (< health-factor LIQUIDATION_THRESHOLD))
                (is-liquidatable (or is-overdue is-undercollateralized))
            )
            (ok {
                loan-id: loan-id,
                health-factor: health-factor,
                collateral-value: collateral-value,
                total-debt: total-debt,
                is-overdue: is-overdue,
                is-undercollateralized: is-undercollateralized,
                is-liquidatable: is-liquidatable,
                status: (get status loan),
                current-block: stacks-block-height,
                due-block: (get end-block loan),
            })
        )
        ERR_LOAN_NOT_FOUND
    )
)

;; Check if a loan needs attention (health factor < 90%)
(define-read-only (is-loan-at-risk (loan-id uint))
    (match (map-get? active-loans loan-id)
        loan (let ((health-factor (try! (get-loan-health-factor loan-id))))
            ;; Loan is at risk if health factor < 9000 (90%)
            ;; This gives early warning before reaching liquidation threshold of 80%
            (ok (< health-factor u9000))
        )
        ERR_LOAN_NOT_FOUND
    )
)

;; Batch check health for multiple loans (for monitoring/keeper bots)
(define-read-only (check-loans-health (loan-ids (list 20 uint)))
    (ok (map get-loan-health-factor loan-ids))
)

;; Get all at-risk loans for a user (for notifications)
(define-read-only (get-user-at-risk-loans (user principal))
    (let ((user-loans (default-to (list) (map-get? user-active-loans user))))
        (ok (filter is-loan-needs-attention user-loans))
    )
)

;; Private helper to check if loan needs attention
(define-private (is-loan-needs-attention (loan-id uint))
    (match (is-loan-at-risk loan-id)
        success
        success
        error
        false
    )
)

;; NOTE: Enhanced collateral monitoring implemented. While real-time monitoring still requires off-chain keepers/bots to call check functions, the contract now provides comprehensive health checking capabilities.

;; NOTE: Clarity does not support contract upgradeability natively. For migration, consider deploying a new contract and providing a migration function to move state, or use a proxy pattern if supported in future versions.
