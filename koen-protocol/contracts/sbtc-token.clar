;; title: sbtc-token
;; version: 1.0.0
;; summary: Mock sBTC Token - Synthetic Bitcoin token for Koen Protocol testing
;; description: SIP-010 compliant fungible token representing wrapped BTC on Stacks (Mock for hackathon)

;; traits
;; Note: SIP-010 trait implementation commented out for local development
;; Uncomment when deploying to mainnet/testnet
;; (impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; token definitions
(define-fungible-token sbtc u2100000000000000) ;; Max supply: 21 million BTC in satoshis (8 decimals)

;; constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_AMOUNT (err u402))
(define-constant ERR_INSUFFICIENT_BALANCE (err u403))
(define-constant ERR_MAX_SUPPLY_EXCEEDED (err u404))

(define-constant CONTRACT_OWNER tx-sender)
(define-constant TOKEN_DECIMALS u8) ;; 1 sBTC = 100,000,000 satoshis (Bitcoin standard)
(define-constant MAX_SUPPLY u2100000000000000) ;; 21M BTC in satoshis

;; data vars
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://koen.finance/sbtc.json"))

;; data maps
;;

;; public functions

;; SIP-010 Standard Functions

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (ft-transfer? sbtc amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-public (get-name)
  (ok "Synthetic Bitcoin")
)

(define-public (get-symbol)
  (ok "sBTC")
)

(define-public (get-decimals)
  (ok TOKEN_DECIMALS)
)

(define-public (get-balance (account principal))
  (ok (ft-get-balance sbtc account))
)

(define-public (get-total-supply)
  (ok (ft-get-supply sbtc))
)

(define-public (get-token-uri)
  (ok (var-get token-uri))
)

(define-public (set-token-uri (new-uri (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set token-uri (some new-uri))
    (ok true)
  )
)

;; Mock Functions (For Hackathon Testing Only)
;; In production, these would be replaced with actual sBTC bridge logic

;; Mint function - Anyone can mint for testing purposes
;; WARNING: This is only for hackathon/testing. Real sBTC uses a bridge mechanism.
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (<= (+ (ft-get-supply sbtc) amount) MAX_SUPPLY) ERR_MAX_SUPPLY_EXCEEDED)
    (try! (ft-mint? sbtc amount recipient))
    (ok amount)
  )
)

;; Burn function - Anyone can burn their own tokens for testing
(define-public (burn (amount uint))
  (begin
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (>= (ft-get-balance sbtc tx-sender) amount) ERR_INSUFFICIENT_BALANCE)
    (try! (ft-burn? sbtc amount tx-sender))
    (ok amount)
  )
)

;; Faucet function for easy testing - mint 1 sBTC to caller
(define-public (faucet)
  (let ((faucet-amount u100000000)) ;; 1 sBTC = 100,000,000 satoshis
    (try! (mint faucet-amount tx-sender))
    (ok faucet-amount)
  )
)

;; read only functions

(define-read-only (get-max-supply)
  (ok MAX_SUPPLY)
)

(define-read-only (get-remaining-supply)
  (ok (- MAX_SUPPLY (ft-get-supply sbtc)))
)

(define-read-only (get-contract-owner)
  (ok CONTRACT_OWNER)
)

;; private functions
;;
