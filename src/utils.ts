import type { NavigationHistoryData } from "./types.ts";

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
  return `${prefix}:regular:${chatId}:${messageId}`;
}

/**
 * Creates an empty navigation history data structure.
 *
 * @returns A new NavigationHistoryData object with an empty navigation history array
 */
export function createEmptyNavigationHistory(): NavigationHistoryData {
  return { navigationHistory: [] };
}
