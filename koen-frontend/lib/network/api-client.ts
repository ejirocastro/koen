/**
 * Robust API client for Stacks blockchain with fallback endpoints and retry logic
 * Now uses Next.js API proxy to avoid CORS and reduce rate limiting
 */

import { StacksNetwork } from '@stacks/network';
import { fetchCallReadOnlyFunction, ClarityValue, cvToJSON, cvToHex, hexToCV } from '@stacks/transactions';

// Use Next.js API proxy instead of direct Hiro calls
const USE_PROXY = typeof window !== 'undefined'; // Only in browser
const PROXY_ENDPOINT = '/api/stacks-proxy';

// ============================================
// CONFIGURATION
// ============================================

// Multiple API endpoints for redundancy
const TESTNET_API_ENDPOINTS = [
  'https://api.testnet.hiro.so',
  'https://stacks-node-api.testnet.stacks.co',
  'https://api.testnet.stacks.co',
];

const MAINNET_API_ENDPOINTS = [
  'https://api.hiro.so',
  'https://api.mainnet.hiro.so',
  'https://stacks-node-api.mainnet.stacks.co',
];

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 0,      // NO retries to avoid 429 rate limits
  initialDelay: 3000, // Longer delay between retries
  maxDelay: 10000,    // Longer max to avoid hammering API
  backoffMultiplier: 2,
};

// ============================================
// NETWORK UTILITIES
// ============================================

/**
 * Get all available API endpoints for a network
 */
function getApiEndpoints(network: StacksNetwork): string[] {
  // Use type assertion to access network URL - property names vary by @stacks/network version
  const apiUrl = (network as any).coreApiUrl || '';
  const isMainnet = apiUrl.includes('mainnet') || apiUrl.includes('api.hiro.so');
  return isMainnet ? MAINNET_API_ENDPOINTS : TESTNET_API_ENDPOINTS;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
}

// ============================================
// ERROR HANDLING
// ============================================

interface ApiError {
  message: string;
  endpoint: string;
  attempt: number;
  originalError: any;
}

function isRetryableError(error: any): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Rate limiting
  if (error.message?.includes('rate limit') || error.message?.includes('429')) {
    return true;
  }

  // Temporary server errors
  if (error.message?.includes('502') || error.message?.includes('503') || error.message?.includes('504')) {
    return true;
  }

  // Connection timeouts
  if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
    return true;
  }

  return false;
}

// ============================================
// PROXY WRAPPER
// ============================================

/**
 * Call read-only function through Next.js proxy (avoids CORS and rate limits)
 */
async function callThroughProxy(
  url: string,
  method: string,
  data: any
): Promise<any> {
  const response = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, method, data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Proxy request failed');
  }

  const result = await response.json();

  console.log('[Proxy] Raw response:', JSON.stringify(result).substring(0, 200));

  if (result.cached) {
    console.log('[Proxy] Returned from cache');
  }

  // Parse hex result to Clarity JSON (same format as direct API)
  if (result.okay && result.result) {
    try {
      const clarityValue = hexToCV(result.result);
      const parsed = cvToJSON(clarityValue);
      console.log('[Proxy] ✓ Parsed successfully:', JSON.stringify(parsed).substring(0, 200));
      return parsed;
    } catch (parseError: any) {
      console.error('[Proxy] Failed to parse hex:', parseError.message);
      console.error('[Proxy] Hex was:', result.result.substring(0, 100));
      throw new Error('Failed to parse Clarity hex response');
    }
  }

  console.error('[Proxy] Unexpected response format:', result);
  return result;
}

// ============================================
// ROBUST FETCH WITH FALLBACK ENDPOINTS
// ============================================

/**
 * Fetch with automatic retry, exponential backoff, and endpoint fallback
 */
export async function robustFetchReadOnly(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[],
  network: StacksNetwork,
  retryConfig: Partial<RetryConfig> = {}
): Promise<any> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  const endpoints = getApiEndpoints(network);

  let lastError: any;
  let endpointIndex = 0;

  // Only try PRIMARY endpoint to avoid rate limits (not all 3)
  for (let endpointAttempt = 0; endpointAttempt < 1; endpointAttempt++) {
    const currentEndpoint = endpoints[endpointIndex];
    const networkWithEndpoint = { ...network, coreApiUrl: currentEndpoint };

    // Retry logic for current endpoint
    for (let retry = 0; retry <= config.maxRetries; retry++) {
      try {
        console.log(`[API] Attempt ${retry + 1}/${config.maxRetries + 1} on ${currentEndpoint}`);

        let result;

        // Use proxy in browser to avoid CORS
        if (USE_PROXY) {
          const url = `${currentEndpoint}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;
          const requestBody = {
            sender: contractAddress,
            arguments: functionArgs.map(arg => cvToHex(arg)),
          };

          result = await callThroughProxy(url, 'POST', requestBody);
        } else {
          // Direct call for server-side
          const rawResult = await fetchCallReadOnlyFunction({
            contractAddress,
            contractName,
            functionName,
            functionArgs,
            network: networkWithEndpoint,
            senderAddress: contractAddress,
          });
          result = cvToJSON(rawResult);
        }

        // Success!
        console.log(`[API] ✓ Success on ${currentEndpoint}`);
        return result;

      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        if (!isRetryableError(error)) {
          console.error(`[API] ✗ Non-retryable error on ${currentEndpoint}:`, error.message);
          break; // Try next endpoint
        }

        // If this was the last retry for this endpoint, try next endpoint
        if (retry === config.maxRetries) {
          console.warn(`[API] ✗ All retries exhausted for ${currentEndpoint}`);
          break;
        }

        // Wait with exponential backoff before retrying
        const delay = getBackoffDelay(retry, config);
        console.log(`[API] ⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }

    // Move to next endpoint
    endpointIndex = (endpointIndex + 1) % endpoints.length;
  }

  // All endpoints and retries failed
  console.error('[API] ✗ All endpoints failed');
  throw new Error(
    `Failed to fetch from all ${endpoints.length} endpoints after ${config.maxRetries + 1} retries each. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
}

// ============================================
// SIMPLIFIED WRAPPER
// ============================================

/**
 * Simple wrapper for read-only calls with automatic error handling
 */
export async function safeReadOnlyCall<T>(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[],
  network: StacksNetwork,
  defaultValue: T
): Promise<T> {
  try {
    const result = await robustFetchReadOnly(
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      network
    );

    // Check if result is valid
    if (!result || result.value === null || result.value === undefined) {
      console.warn(`[API] Empty result for ${functionName}, returning default`);
      return defaultValue;
    }

    return result;
  } catch (error) {
    console.error(`[API] Error calling ${functionName}:`, error);
    return defaultValue;
  }
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check if API endpoints are healthy
 */
export async function checkApiHealth(network: StacksNetwork): Promise<{
  healthy: string[];
  unhealthy: string[];
}> {
  const endpoints = getApiEndpoints(network);
  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${endpoint}/v2/info`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return { endpoint, healthy: response.ok };
      } catch {
        clearTimeout(timeout);
        return { endpoint, healthy: false };
      }
    })
  );

  const healthy: string[] = [];
  const unhealthy: string[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.healthy) {
      healthy.push(result.value.endpoint);
    } else if (result.status === 'fulfilled') {
      unhealthy.push(result.value.endpoint);
    }
  });

  return { healthy, unhealthy };
}
