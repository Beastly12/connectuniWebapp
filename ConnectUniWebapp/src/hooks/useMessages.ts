/**
 * The ConnectUni backend uses community-based messaging, not 1:1 DMs.
 * This file re-exports community message hooks under the messaging namespace
 * so existing pages that import from useMessages still compile.
 */
export {
  useCommunityMessages as useMessages,
  useSendCommunityMessage as useSendMessage,
  useCommunities as useConversations,
} from './useCommunity'
