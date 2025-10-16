#!/bin/bash
# Deploy V2 Contracts with Automatic Reputation System
# Run this script in your terminal: bash deploy-v2-contracts.sh

set -e

echo "=================================================="
echo "Kōen Protocol V2 Deployment"
echo "Automatic On-Chain Reputation System"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contract details
DEPLOYER_ADDRESS="ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3"

echo -e "${BLUE}Step 1: Deploy reputation-sbt-v2${NC}"
echo "This contract has automatic reputation management (no manual functions)"
echo ""

clarinet deployments generate --testnet \
  --contract-publish reputation-sbt-v2 \
  --no-batch

echo ""
echo -e "${GREEN}✓ reputation-sbt-v2 deployment plan created${NC}"
echo ""

echo -e "${BLUE}Step 2: Deploy p2p-marketplace-v2${NC}"
echo "This contract automatically updates reputation after loan events"
echo ""

clarinet deployments generate --testnet \
  --contract-publish p2p-marketplace-v2 \
  --no-batch

echo ""
echo -e "${GREEN}✓ p2p-marketplace-v2 deployment plan created${NC}"
echo ""

echo -e "${BLUE}Step 3: Apply deployment${NC}"
echo "This will deploy both contracts to testnet"
echo ""

clarinet deployments apply --testnet

echo ""
echo -e "${GREEN}✓ Contracts deployed!${NC}"
echo ""

echo -e "${YELLOW}Step 4: Authorize marketplace (IMPORTANT!)${NC}"
echo "You need to run this command in Clarinet console:"
echo ""
echo "  clarinet console --testnet"
echo "  >> (contract-call? .reputation-sbt-v2 set-marketplace '${DEPLOYER_ADDRESS}.p2p-marketplace-v2)"
echo ""
echo "Expected response: (ok true)"
echo ""

echo -e "${BLUE}Step 5: Update frontend${NC}"
echo "After authorization, update koen-frontend/lib/constants.ts:"
echo ""
echo "  P2P_MARKETPLACE: '${DEPLOYER_ADDRESS}.p2p-marketplace-v2',"
echo "  REPUTATION_SBT: '${DEPLOYER_ADDRESS}.reputation-sbt-v2',"
echo ""

echo "=================================================="
echo -e "${GREEN}Deployment script ready!${NC}"
echo "=================================================="
