;; title: reputation-sbt
;; version: 1.0.0
;; summary: Reputation Soulbound Token - Non-transferable reputation system for Koen Protocol
;; description: NFT-based reputation system that tracks user creditworthiness and determines borrowing bonuses

;; traits
;;

;; token definitions
(define-non-fungible-token reputation-sbt uint)

;; constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_ALREADY_EXISTS (err u409))
(define-constant ERR_INVALID_TIER (err u410))
(define-constant ERR_INVALID_SCORE (err u411))
(define-constant ERR_TOKEN_NON_TRANSFERABLE (err u412))
(define-constant ERR_BURN_COOLDOWN_ACTIVE (err u413))

(define-constant CONTRACT_OWNER tx-sender)

;; Reputation tiers
(define-constant TIER_BRONZE "bronze")
(define-constant TIER_SILVER "silver")
(define-constant TIER_GOLD "gold")

;; Tier thresholds
(define-constant BRONZE_MIN_SCORE u0)
(define-constant SILVER_MIN_SCORE u301)
(define-constant GOLD_MIN_SCORE u701)
(define-constant MAX_SCORE u1000)

;; Reputation multipliers (basis points)
(define-constant BRONZE_MULTIPLIER u0) ;; 0% bonus
(define-constant SILVER_MULTIPLIER u1000) ;; 10% bonus
(define-constant GOLD_MULTIPLIER u2000) ;; 20% bonus

;; SECURITY: Burn cooldown to prevent reputation gaming after liquidation
(define-constant BURN_COOLDOWN_BLOCKS u52560) ;; 1 year cooldown after burn

;; data vars
(define-data-var next-token-id uint u1)
(define-data-var marketplace-contract (optional principal) none)

;; data maps

;; SECURITY: Track when users can mint again after burn (prevents gaming)
(define-map burn-cooldowns
  principal
  uint ;; block height when user can mint again
)

;; Map principal to reputation data
(define-map reputation-data
  principal
  {
    score: uint,
    tier: (string-ascii 10),
    token-id: uint,
    minted-at: uint,
    last-updated: uint,
  }
)

;; Map token-id to principal (for lookups)
(define-map token-owner
  uint
  principal
)

;; public functions

;; Mint SBT - Admin only (for hackathon demo)
;; In production, this would be called by an oracle or reputation calculation service
(define-public (mint-sbt
    (user principal)
    (score uint)
    (tier (string-ascii 10))
  )
  (let ((token-id (var-get next-token-id)))
    ;; Only contract owner or marketplace can mint
    (asserts! (or (is-eq tx-sender CONTRACT_OWNER) (is-authorized-minter))
      ERR_UNAUTHORIZED
    )

    ;; Validate score
    (asserts! (and (>= score BRONZE_MIN_SCORE) (<= score MAX_SCORE))
      ERR_INVALID_SCORE
    )

    ;; Validate tier
    (asserts! (is-valid-tier tier) ERR_INVALID_TIER)

    ;; Validate score matches tier
    (asserts! (is-valid-score-for-tier score tier) ERR_INVALID_SCORE)

    ;; Check user doesn't already have SBT
    (asserts! (is-none (map-get? reputation-data user)) ERR_ALREADY_EXISTS)

    ;; SECURITY: Check burn cooldown (prevents gaming after liquidation)
    (match (map-get? burn-cooldowns user)
      cooldown-block (asserts! (>= stacks-block-height cooldown-block) ERR_BURN_COOLDOWN_ACTIVE)
      true ;; No cooldown exists, proceed
    )

    ;; Mint the NFT
    (try! (nft-mint? reputation-sbt token-id user))

    ;; Store reputation data
    (map-set reputation-data user {
      score: score,
      tier: tier,
      token-id: token-id,
      minted-at: stacks-block-height,
      last-updated: stacks-block-height,
    })

    ;; Store token ownership
    (map-set token-owner token-id user)

    ;; Increment token ID
    (var-set next-token-id (+ token-id u1))

    (ok token-id)
  )
)

;; Update reputation - Admin only
(define-public (update-reputation
    (user principal)
    (new-score uint)
    (new-tier (string-ascii 10))
  )
  (let ((current-data (unwrap! (map-get? reputation-data user) ERR_NOT_FOUND)))
    ;; Only contract owner can update
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)

    ;; Validate new score and tier
    (asserts! (and (>= new-score BRONZE_MIN_SCORE) (<= new-score MAX_SCORE))
      ERR_INVALID_SCORE
    )
    (asserts! (is-valid-tier new-tier) ERR_INVALID_TIER)

    ;; Validate score matches tier
    (asserts! (is-valid-score-for-tier new-score new-tier) ERR_INVALID_SCORE)

    ;; Update reputation data
    (map-set reputation-data user
      (merge current-data {
        score: new-score,
        tier: new-tier,
        last-updated: stacks-block-height,
      })
    )

    (ok true)
  )
)

;; Burn SBT - Called by marketplace on liquidation or owner for admin purposes
(define-public (burn-sbt (user principal))
  (let (
      (reputation (unwrap! (map-get? reputation-data user) ERR_NOT_FOUND))
      (token-id (get token-id reputation))
    )
    ;; Allow owner OR marketplace to burn (consistent with mint-sbt authorization)
    (asserts! (or (is-eq tx-sender CONTRACT_OWNER) (is-authorized-minter))
      ERR_UNAUTHORIZED
    )

    ;; Burn the NFT
    (try! (nft-burn? reputation-sbt token-id user))

    ;; Remove reputation data
    (map-delete reputation-data user)
    (map-delete token-owner token-id)

    ;; SECURITY: Set burn cooldown (prevents immediate re-minting after liquidation)
    (map-set burn-cooldowns user (+ stacks-block-height BURN_COOLDOWN_BLOCKS))

    (print {
      event: "sbt-burned",
      user: user,
      token-id: token-id,
      burned-by: tx-sender,
      cooldown-until: (+ stacks-block-height BURN_COOLDOWN_BLOCKS),
    })
    (ok true)
  )
)

;; Transfer - DISABLED (Soulbound = non-transferable)
(define-public (transfer
    (token-id uint)
    (sender principal)
    (recipient principal)
  )
  ERR_TOKEN_NON_TRANSFERABLE
)

;; Admin function to set marketplace contract
(define-public (set-marketplace (marketplace-address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set marketplace-contract (some marketplace-address))
    (ok true)
  )
)

;; read only functions

(define-read-only (get-reputation (user principal))
  (ok (unwrap! (map-get? reputation-data user) ERR_NOT_FOUND))
)

(define-read-only (get-tier (user principal))
  (ok (get tier (unwrap! (map-get? reputation-data user) ERR_NOT_FOUND)))
)

(define-read-only (get-score (user principal))
  (ok (get score (unwrap! (map-get? reputation-data user) ERR_NOT_FOUND)))
)

(define-read-only (get-multiplier (user principal))
  (let ((tier (get tier (unwrap! (map-get? reputation-data user) ERR_NOT_FOUND))))
    (ok (get-tier-multiplier tier))
  )
)

(define-read-only (has-sbt (user principal))
  (is-some (map-get? reputation-data user))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? reputation-sbt token-id))
)

(define-read-only (get-last-token-id)
  (ok (- (var-get next-token-id) u1))
)

(define-read-only (get-tier-multiplier (tier (string-ascii 10)))
  (if (is-eq tier TIER_GOLD)
    GOLD_MULTIPLIER
    (if (is-eq tier TIER_SILVER)
      SILVER_MULTIPLIER
      BRONZE_MULTIPLIER
    )
  )
)

(define-read-only (calculate-tier-from-score (score uint))
  (if (>= score GOLD_MIN_SCORE)
    TIER_GOLD
    (if (>= score SILVER_MIN_SCORE)
      TIER_SILVER
      TIER_BRONZE
    )
  )
)

(define-read-only (get-user-token-id (user principal))
  (ok (get token-id (unwrap! (map-get? reputation-data user) ERR_NOT_FOUND)))
)

;; private functions

(define-private (is-valid-tier (tier (string-ascii 10)))
  (or
    (is-eq tier TIER_BRONZE)
    (or
      (is-eq tier TIER_SILVER)
      (is-eq tier TIER_GOLD)
    )
  )
)

(define-private (is-valid-score-for-tier
    (score uint)
    (tier (string-ascii 10))
  )
  (if (is-eq tier TIER_GOLD)
    (>= score GOLD_MIN_SCORE)
    (if (is-eq tier TIER_SILVER)
      (and (>= score SILVER_MIN_SCORE) (< score GOLD_MIN_SCORE))
      (and (>= score BRONZE_MIN_SCORE) (< score SILVER_MIN_SCORE))
    )
  )
)

(define-private (is-authorized-minter)
  (match (var-get marketplace-contract)
    marketplace (is-eq contract-caller marketplace)
    false
  )
)
