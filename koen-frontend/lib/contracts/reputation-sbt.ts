import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  PostConditionMode,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';
import { CONTRACTS, REPUTATION_TIERS, ReputationTier } from '../constants';
import { getReputationTierFromScore } from '../constants';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ReputationData {
  score: number;
  tier: ReputationTier;
  multiplier: number;
  hasSbt: boolean;
  tokenId: number | null;
}

export interface TierInfo {
  name: string;
  minScore: number;
  maxScore: number;
  bonus: number;
  multiplier: number;
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get user's reputation data
 */
export async function getReputation(
  address: string,
  network: StacksNetwork
): Promise<ReputationData | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.REPUTATION_SBT.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-reputation',
      functionArgs: [principalCV(address)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let reputation = data.value;
    if (reputation && reputation.value) {
      reputation = reputation.value;
    }

    if (!reputation) {
      // User doesn't have a reputation SBT yet
      return {
        score: 0,
        tier: 'bronze' as ReputationTier,
        multiplier: 0,
        hasSbt: false,
        tokenId: null,
      };
    }

    const score = Number(reputation.score?.value || 0);
    const tier = getReputationTierFromScore(score);

    return {
      score,
      tier,
      multiplier: Number(reputation.multiplier?.value || 0),
      hasSbt: true,
      tokenId: Number(reputation['token-id']?.value) || null,
    };
  } catch (error) {
    console.error('Error fetching reputation:', error);
    return null;
  }
}

/**
 * Get user's reputation score only
 */
export async function getReputationScore(
  address: string,
  network: StacksNetwork
): Promise<number> {
  try {
    const [contractAddress, contractName] = CONTRACTS.REPUTATION_SBT.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-score',
      functionArgs: [principalCV(address)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let score = data.value;
    if (score && typeof score === 'object' && score.value !== undefined) {
      score = score.value;
    }

    if (!score) {
      return 0;
    }

    return Number(score);
  } catch (error) {
    console.error('Error fetching reputation score:', error);
    return 0;
  }
}

/**
 * Get user's reputation tier
 */
export async function getReputationTier(
  address: string,
  network: StacksNetwork
): Promise<ReputationTier> {
  try {
    const [contractAddress, contractName] = CONTRACTS.REPUTATION_SBT.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-tier',
      functionArgs: [principalCV(address)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let tier = data.value;
    if (tier && typeof tier === 'object' && tier.value !== undefined) {
      tier = tier.value;
    }

    if (!tier) {
      return 'bronze';
    }

    const tierString = tier.toLowerCase();
    if (tierString === 'gold' || tierString === 'silver' || tierString === 'bronze') {
      return tierString as ReputationTier;
    }

    return 'bronze';
  } catch (error) {
    console.error('Error fetching reputation tier:', error);
    return 'bronze';
  }
}

/**
 * Get APR multiplier for user (basis points)
 */
export async function getReputationMultiplier(
  address: string,
  network: StacksNetwork
): Promise<number> {
  try {
    const [contractAddress, contractName] = CONTRACTS.REPUTATION_SBT.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-multiplier',
      functionArgs: [principalCV(address)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let multiplier = data.value;
    if (multiplier && typeof multiplier === 'object' && multiplier.value !== undefined) {
      multiplier = multiplier.value;
    }

    if (!multiplier) {
      return 0;
    }

    return Number(multiplier);
  } catch (error) {
    console.error('Error fetching reputation multiplier:', error);
    return 0;
  }
}

/**
 * Check if user has a reputation SBT
 */
export async function hasReputationSbt(
  address: string,
  network: StacksNetwork
): Promise<boolean> {
  try {
    const [contractAddress, contractName] = CONTRACTS.REPUTATION_SBT.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'has-sbt',
      functionArgs: [principalCV(address)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);
    return data.value === true;
  } catch (error) {
    console.error('Error checking reputation SBT:', error);
    return false;
  }
}

/**
 * Get tier information from tier name
 */
export function getTierInfo(tier: ReputationTier): TierInfo {
  const tierKey = tier.toUpperCase() as keyof typeof REPUTATION_TIERS;
  const tierData = REPUTATION_TIERS[tierKey];

  return {
    name: tierData.name,
    minScore: tierData.min,
    maxScore: tierData.max,
    bonus: tierData.bonus,
    multiplier: tierData.multiplier,
  };
}

/**
 * Calculate APR discount based on reputation
 */
export function calculateAprDiscount(baseApr: number, tier: ReputationTier): {
  effectiveApr: number;
  discount: number;
  savings: number;
} {
  const tierInfo = getTierInfo(tier);
  const discount = baseApr * tierInfo.bonus;
  const effectiveApr = baseApr - discount;

  return {
    effectiveApr,
    discount: tierInfo.bonus * 100, // As percentage
    savings: discount,
  };
}

/**
 * Get next tier requirement
 */
export function getNextTierRequirement(currentScore: number): {
  nextTier: ReputationTier | null;
  requiredScore: number;
  progress: number; // Percentage
} {
  if (currentScore < REPUTATION_TIERS.SILVER.min) {
    return {
      nextTier: 'silver',
      requiredScore: REPUTATION_TIERS.SILVER.min,
      progress: (currentScore / REPUTATION_TIERS.SILVER.min) * 100,
    };
  }

  if (currentScore < REPUTATION_TIERS.GOLD.min) {
    return {
      nextTier: 'gold',
      requiredScore: REPUTATION_TIERS.GOLD.min,
      progress: ((currentScore - REPUTATION_TIERS.SILVER.min) /
                (REPUTATION_TIERS.GOLD.min - REPUTATION_TIERS.SILVER.min)) * 100,
    };
  }

  // Already at max tier
  return {
    nextTier: null,
    requiredScore: currentScore,
    progress: 100,
  };
}

// ============================================
// WRITE FUNCTIONS (TRANSACTIONS)
// ============================================

/**
 * Mint reputation SBT (usually called by marketplace contract)
 * Note: This might be restricted to contract-only calls
 */
export async function mintReputationSbt(params: {
  recipient: string;
  initialScore: number;
}): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.REPUTATION_SBT.split('.');

  const functionArgs = [
    principalCV(params.recipient),
    uintCV(params.initialScore),
  ];

  const options = {
    contractAddress,
    contractName,
    functionName: 'mint-sbt',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Mint reputation SBT transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Update reputation score (usually called by marketplace contract)
 * Note: This is typically restricted to the marketplace contract
 */
export async function updateReputation(params: {
  user: string;
  newScore: number;
}): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.REPUTATION_SBT.split('.');

  const functionArgs = [
    principalCV(params.user),
    uintCV(params.newScore),
  ];

  const options = {
    contractAddress,
    contractName,
    functionName: 'update-reputation',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Update reputation transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Burn reputation SBT
 * Note: Has a 1-year cooldown period
 */
export async function burnReputationSbt(userAddress: string): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.REPUTATION_SBT.split('.');

  const options = {
    contractAddress,
    contractName,
    functionName: 'burn-sbt',
    functionArgs: [principalCV(userAddress)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Burn reputation SBT transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}
