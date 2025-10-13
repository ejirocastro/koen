;; title: kusd-token
;; version: 1.0.0
;; summary: kUSD Stablecoin Token - Protocol-native stablecoin for Koen Protocol
;; description: SIP-010 compliant fungible token for P2P lending marketplace

;; traits
;; Note: SIP-010 trait implementation commented out for local development
;; Uncomment when deploying to mainnet/testnet
;; (impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; token definitions
(define-fungible-token kusd)

;; constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_AMOUNT (err u402))
(define-constant ERR_INSUFFICIENT_BALANCE (err u403))

(define-constant CONTRACT_OWNER tx-sender)
(define-constant TOKEN_DECIMALS u6) ;; 1 kUSD = 1,000,000 micro-units

;; data vars
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://koen.finance/kusd.json"))

;; data maps
;;

;; public functions

;; SIP-010 Standard Functions

(define-public (transfer
    (amount uint)
    (sender principal)
    (recipient principal)
    (memo (optional (buff 34)))
  )
  (begin
    (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (ft-transfer? kusd amount sender recipient))
    (match memo
      to-print (print to-print)
      0x
    )
    (ok true)
  )
)

(define-public (get-name)
  (ok "Koen USD")
)

(define-public (get-symbol)
  (ok "kUSD")
)

(define-public (get-decimals)
  (ok TOKEN_DECIMALS)
)

(define-public (get-balance (account principal))
  (ok (ft-get-balance kusd account))
)

(define-public (get-total-supply)
  (ok (ft-get-supply kusd))
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

;; Testing Functions (For Hackathon/Development Only)
;; WARNING: In production, kUSD would be obtained through other mechanisms
;; (e.g., swapping, protocol treasury, or minting against verified collateral)

;; Faucet function for easy testing - mint 1000 kUSD to caller
(define-public (faucet)
  (let ((faucet-amount u1000000000))
    ;; 1000 kUSD = 1,000,000,000 micro-units (6 decimals)
    (try! (ft-mint? kusd faucet-amount tx-sender))
    (ok faucet-amount)
  )
)

;; read only functions

(define-read-only (get-contract-owner)
  (ok CONTRACT_OWNER)
)

;; private functions
;;
