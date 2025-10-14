# Stacks API Migration Fix

## Issue
The application was failing to build due to incorrect import from `@stacks/transactions` package. The error indicated:

```
Export callReadOnlyFunction doesn't exist in target module
Did you mean to import fetchCallReadOnlyFunction?
```

## Root Cause
The `@stacks/transactions` package API has been updated. The old function `callReadOnlyFunction` has been renamed to `fetchCallReadOnlyFunction`.

## Solution
Updated all contract files to use the correct import and function name.

### Files Updated (5 files):

1. **`/lib/contracts/sbtc-token.ts`**
   - Changed import: `callReadOnlyFunction` → `fetchCallReadOnlyFunction`
   - Updated all function calls throughout the file

2. **`/lib/contracts/kusd-token.ts`**
   - Changed import: `callReadOnlyFunction` → `fetchCallReadOnlyFunction`
   - Updated all function calls throughout the file

3. **`/lib/contracts/p2p-marketplace.ts`**
   - Changed import: `callReadOnlyFunction` → `fetchCallReadOnlyFunction`
   - Updated all function calls throughout the file

4. **`/lib/contracts/reputation-sbt.ts`**
   - Changed import: `callReadOnlyFunction` → `fetchCallReadOnlyFunction`
   - Updated all function calls throughout the file

5. **`/lib/contracts/oracle.ts`**
   - Changed import: `callReadOnlyFunction` → `fetchCallReadOnlyFunction`
   - Updated all function calls throughout the file

## Changes Made

### Before:
```typescript
import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  PostConditionMode,
} from '@stacks/transactions';

// Usage
const result = await callReadOnlyFunction({
  contractAddress,
  contractName,
  functionName: 'get-balance',
  functionArgs: [principalCV(address)],
  network,
  senderAddress: contractAddress,
});
```

### After:
```typescript
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  PostConditionMode,
} from '@stacks/transactions';

// Usage
const result = await fetchCallReadOnlyFunction({
  contractAddress,
  contractName,
  functionName: 'get-balance',
  functionArgs: [principalCV(address)],
  network,
  senderAddress: contractAddress,
});
```

## Impact
- ✅ All contract read operations now use the correct API
- ✅ Build errors resolved
- ✅ No breaking changes to functionality (only API name change)
- ✅ All hooks continue to work as expected

## Status
**FIXED** ✅ - Application should now compile successfully.
