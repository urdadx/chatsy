# Chatbot Creation Limits Implementation

## Overview
This implementation adds subscription-based chatbot creation limits to the Chatsy platform. Users are restricted based on their subscription tier and can purchase add-ons to increase their limits.

## Subscription Tiers & Limits
- **Starter**: 1 chatbot
- **Growth**: 3 chatbots  
- **Professional**: 5 chatbots
- **Extra Chatbot Add-on**: +1 chatbot per add-on

## Implementation Details

### 1. Server-Side Validation (`/api/my-chatbot` POST)
- Checks current chatbot count for organization
- Validates subscription limits before allowing creation
- Returns appropriate error messages if limits are exceeded

### 2. Client-Side Prevention
- **New Chatbot Component** (`new-chabot.tsx`): Shows current count vs limit, prevents creation attempts when at limit
- **Subscription Limits Hook** (`use-subscription-limits.ts`): Fetches and caches subscription data
- **Add-ons Dialog Integration**: Shows chatbot add-on selection when limits are reached

### 3. Components Updated
- `new-chabot.tsx`: Added limit checking and add-ons dialog integration
- `use-chatbot-management.ts`: Enhanced error handling for limit-reached scenarios
- `chatbot-switcher.tsx`: Inherits functionality through ChatbotManager

### 4. API Endpoints
- `/api/my-chatbot` (POST): Enhanced with subscription limit validation
- `/api/chatbot-count` (GET): Returns current chatbot count for organization

### 5. User Experience Flow
1. User attempts to create new chatbot
2. System checks current count vs subscription limit
3. If at limit:
   - Shows error message
   - Opens add-ons dialog with "Extra AI chatbot" pre-selected
   - User can purchase add-on to increase limit
4. If under limit: Proceeds with chatbot creation

### 6. Error Handling
- Server-side: Returns structured error with reason and current usage
- Client-side: Shows appropriate toasts and opens upgrade dialog
- Graceful degradation: Allows creation on API errors (development-friendly)

## Files Modified/Created

### New Files
- `src/lib/subscription-utils.ts` - Client-side subscription checking utilities
- `src/lib/server-subscription-utils.ts` - Server-side subscription validation
- `src/lib/polar-client.ts` - Polar API client configuration
- `src/routes/api/chatbot-count.ts` - Chatbot count endpoint
- `src/hooks/use-subscription-limits.ts` - React hook for subscription data

### Modified Files
- `src/routes/api/my-chatbot.ts` - Added subscription limit validation
- `src/components/workspace/new-chabot.tsx` - Enhanced with limit checking
- `src/hooks/use-chatbot-management.ts` - Better error handling
- `src/components/add-ons-dialog.tsx` - Already supports chatbot add-on selection

## Integration with Existing Features
- **Add-ons Dialog**: Reuses existing component with `defaultValue="chatbot"`
- **Polar Integration**: Leverages existing subscription infrastructure
- **Error Handling**: Follows established patterns from `chatbot-settings.tsx`
- **UI Components**: Uses existing Button, Dialog, and Toast components

## Future Enhancements
1. **Enhanced Polar Integration**: Implement full Polar API subscription checking
2. **Real-time Updates**: Refresh limits when subscriptions change
3. **Usage Analytics**: Track chatbot creation patterns
4. **Admin Override**: Allow admins to bypass limits temporarily
5. **Granular Permissions**: Different limits for different organization roles

## Testing Scenarios
1. **At Limit**: Try to create chatbot when at subscription limit
2. **Add-on Purchase**: Purchase extra chatbot add-on and verify increased limit
3. **Subscription Upgrade**: Upgrade plan and verify new limits
4. **Error Handling**: Test with invalid organization or subscription data
5. **UI Flow**: Verify add-ons dialog opens with correct pre-selection
