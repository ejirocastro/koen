#!/bin/bash
# DEPLOY V2 CONTRACTS TO TESTNET
# Run this in your terminal: bash DEPLOY-V2-NOW.sh

cd "$(dirname "$0")"

echo "🚀 Deploying Kōen Protocol V2 to Testnet..."
echo "================================================"
echo ""

# Deploy using clarinet
clarinet deployments apply --testnet << EOF
y
y
EOF

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  CRITICAL NEXT STEP:"
echo "Run this command to authorize the marketplace:"
echo ""
echo "clarinet contracts call reputation-sbt-v2 set-marketplace ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.p2p-marketplace-v2 --testnet"
