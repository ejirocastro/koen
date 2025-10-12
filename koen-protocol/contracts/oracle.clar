;; title: oracle
;; version: 1.0.0
;; summary: Price Oracle - sBTC price feed for Koen Protocol
;; description: Simple price oracle for sBTC (Mock for hackathon - production would use Redstone/Pyth)

;; traits
;;

;; token definitions
;;

;; constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_PRICE (err u402))
(define-constant ERR_PRICE_CHANGE_TOO_LARGE (err u403))

(define-constant CONTRACT_OWNER tx-sender)

;; Price precision: prices are in micro-USD (6 decimals)
;; Example: $40,000 = 40000000000 micro-USD
(define-constant PRICE_DECIMALS u6)

;; Default price (for initialization)
(define-constant DEFAULT_SBTC_PRICE u40000000000) ;; $40,000 in micro-USD

;; SECURITY: Price bounds to prevent manipulation
(define-constant MIN_SBTC_PRICE u10000000000) ;; $10,000 minimum (prevents flash crash)
(define-constant MAX_SBTC_PRICE u150000000000) ;; $150,000 maximum (prevents unrealistic spikes)

;; SECURITY: Maximum price change per update (basis points)
(define-constant MAX_PRICE_CHANGE_BPS u2000) ;; 20% max change per update

;; data vars
(define-data-var sbtc-price uint DEFAULT_SBTC_PRICE)
(define-data-var last-update-block uint u0)

;; data maps
(define-map price-history
  uint  ;; block height
  uint  ;; price at that block
)

;; public functions

;; Update sBTC price - Admin only (for demo/testing)
;; SECURITY: Includes bounds checking and rate limiting to prevent price manipulation
(define-public (set-sbtc-price (new-price uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)

    ;; SECURITY: Validate price is within realistic bounds
    (asserts! (and (>= new-price MIN_SBTC_PRICE)
                   (<= new-price MAX_SBTC_PRICE))
              ERR_INVALID_PRICE)

    ;; SECURITY: Rate limit - prevent price changes > 20% per update
    (let ((current-price (var-get sbtc-price)))
      (if (> current-price u0) ;; Skip check for first price update
        (let (
          ;; Calculate percentage change in basis points
          (price-change-bps (if (> new-price current-price)
            ;; Price increased: (new - current) * 10000 / current
            (/ (* (- new-price current-price) u10000) current-price)
            ;; Price decreased: (current - new) * 10000 / current
            (/ (* (- current-price new-price) u10000) current-price)
          ))
        )
          ;; Assert price change is within allowed threshold
          (asserts! (<= price-change-bps MAX_PRICE_CHANGE_BPS) ERR_PRICE_CHANGE_TOO_LARGE)
        )
        true ;; First update, no rate limit
      )
    )

    ;; Store in history
    (map-set price-history stacks-block-height new-price)

    ;; Update current price
    (var-set sbtc-price new-price)
    (var-set last-update-block stacks-block-height)

    (print {
      event: "price-update",
      price: new-price,
      block: stacks-block-height,
      change-bps: (if (> (var-get sbtc-price) u0)
        (if (> new-price (var-get sbtc-price))
          (/ (* (- new-price (var-get sbtc-price)) u10000) (var-get sbtc-price))
          (/ (* (- (var-get sbtc-price) new-price) u10000) (var-get sbtc-price))
        )
        u0
      )
    })
    (ok new-price)
  )
)

;; read only functions

;; Get sBTC price
(define-read-only (get-sbtc-price)
  (ok (var-get sbtc-price))
)

;; Get historical price at specific block
(define-read-only (get-price-at-block (block uint))
  (ok (default-to u0 (map-get? price-history block)))
)

;; Get last update block
(define-read-only (get-last-update-block)
  (ok (var-get last-update-block))
)

;; Calculate USD value of sBTC amount
(define-read-only (get-sbtc-value (sbtc-amount uint))
  (let (
    (price (var-get sbtc-price))
  )
    ;; sbtc-amount is in satoshis (8 decimals)
    ;; price is in micro-USD (6 decimals)
    ;; Result should be in micro-USD (6 decimals)
    ;; Formula: (sbtc-amount * price) / 10^8
    (ok (/ (* sbtc-amount price) u100000000))
  )
)

;; Calculate how much sBTC equals a USD value
(define-read-only (get-sbtc-amount (usd-value uint))
  (let (
    (price (var-get sbtc-price))
  )
    ;; usd-value is in micro-USD (6 decimals)
    ;; price is in micro-USD per BTC (6 decimals)
    ;; Result should be in satoshis (8 decimals)
    ;; Formula: (usd-value * 10^8) / price
    (ok (/ (* usd-value u100000000) price))
  )
)

;; Get price decimals
(define-read-only (get-decimals)
  (ok PRICE_DECIMALS)
)

;; Get contract owner
(define-read-only (get-owner)
  (ok CONTRACT_OWNER)
)

;; Helper: Check if price is stale (not updated in last 1000 blocks ~7 days)
(define-read-only (is-price-fresh)
  (let (
    (last-update (var-get last-update-block))
  )
    (ok (< (- stacks-block-height last-update) u1000))
  )
)

;; private functions
;;
