import type { NavigationHistoryData } from "./types.ts";

export const MESSAGE_TYPES = {
  REGULAR: "regular",
  INLINE: "inline",
} as const;

/**
 * Constructs the storage key for a rendered menu.
 * Storage key format: `${keyPrefix}:menus:${renderedMenuId}`
 *
 * @param prefix The storage key prefix
 * @param renderedMenuId The unique identifier of the rendered menu
 * @returns The constructed storage key
 */
export function renderedMenuStorageKey(prefix: string, renderedMenuId: string): string {
  return `${prefix}:menus:${renderedMenuId}`;
}

/**
 * Constructs the navigation history storage key for a regular (non-inline) message.
 * Storage key format: `${keyPrefix}:regular:${chatId}:${messageId}`
 *
 * @param prefix The storage key prefix
 * @param chatId The chat ID where the message was sent
 * @param messageId The message ID in that chat
 * @returns The constructed storage key
 */
export function regularNavStorageKey(prefix: string, chatId: number, messageId: number): string {
  return `${prefix}:${MESSAGE_TYPES.REGULAR}:${chatId}:${messageId}`;
}

/**
 * Constructs the navigation history storage key for an inline message.
 * Storage key format: `${keyPrefix}:inline:${inlineMessageId}`
 *
 * @param prefix The storage key prefix
 * @param inlineMessageId The inline message ID from Telegram
 * @returns The constructed storage key
 */
export function inlineNavStorageKey(prefix: string, inlineMessageId: string): string {
  return `${prefix}:${MESSAGE_TYPES.INLINE}:${inlineMessageId}`;
}

/**
 * Creates an empty navigation history data structure.
 *
 * @returns A new NavigationHistoryData object with an empty navigation history array
 */
export function createEmptyNavigationHistory(): NavigationHistoryData {
  return { navigationHistory: [] };
}
