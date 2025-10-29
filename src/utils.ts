import type { Message } from "./dep.deno.ts";

/**
 * Type guard to check if an unknown value is a Telegram Message object.
 * Only tests non-exhaustively for the properties required by this library.
 *
 * @param candidate The value to check
 * @returns true if the candidate is a Message with required properties, false otherwise
 */
export function isMessage(candidate: unknown): candidate is Message {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }
  if (!("message_id" in candidate) || typeof candidate.message_id !== "number") {
    return false;
  }
  if (!("chat" in candidate) || typeof candidate.chat !== "object" || !candidate.chat) {
    return false;
  }
  if (!("id" in candidate.chat) || typeof candidate.chat.id !== "number") {
    return false;
  }
  return true;
}

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
export function navKeyRegular(prefix: string, chatId: number, messageId: number): string {
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
export function navKeyInline(prefix: string, inlineMessageId: string): string {
  return `${prefix}:${MESSAGE_TYPES.INLINE}:${inlineMessageId}`;
}
