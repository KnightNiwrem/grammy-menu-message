import type { InlineKeyboardButton, Message } from "./dep.ts";

/**
 * Type guard to check if an unknown value is a Telegram Message object.
 * Only tests non-exhaustively for the properties required by this library.
 *
 * @param value The value to check
 * @returns true if the candidate is a Message with required properties, false otherwise
 */
export function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (!("message_id" in value) || typeof value.message_id !== "number") {
    return false;
  }
  if (!("chat" in value) || typeof value.chat !== "object" || !value.chat) {
    return false;
  }
  if (!("id" in value.chat) || typeof value.chat.id !== "number") {
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
 * Type guard to check if an unknown value is an InlineKeyboardButton.
 * Tests for the common properties present in all button types.
 *
 * @param value The value to check
 * @returns true if the value is a valid InlineKeyboardButton, false otherwise
 */
export function isInlineKeyboardButton(value: unknown): value is InlineKeyboardButton {
  if (!value || typeof value !== "object") {
    return false;
  }

  // All InlineKeyboardButton types have a text property
  if (!("text" in value) || typeof value.text !== "string") {
    return false;
  }

  return true;
}

/**
 * Type guard to check if an InlineKeyboardButton is a CallbackButton.
 *
 * @param button The button to check
 * @returns true if the button is a CallbackButton, false otherwise
 */
export function isCallbackButton(
  button: InlineKeyboardButton,
): button is InlineKeyboardButton.CallbackButton {
  return "callback_data" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a UrlButton.
 *
 * @param button The button to check
 * @returns true if the button is a UrlButton, false otherwise
 */
export function isUrlButton(button: InlineKeyboardButton): button is InlineKeyboardButton.UrlButton {
  return "url" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a WebAppButton.
 *
 * @param button The button to check
 * @returns true if the button is a WebAppButton, false otherwise
 */
export function isWebAppButton(
  button: InlineKeyboardButton,
): button is InlineKeyboardButton.WebAppButton {
  return "web_app" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a LoginButton.
 *
 * @param button The button to check
 * @returns true if the button is a LoginButton, false otherwise
 */
export function isLoginButton(
  button: InlineKeyboardButton,
): button is InlineKeyboardButton.LoginButton {
  return "login_url" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a SwitchInlineButton.
 *
 * @param button The button to check
 * @returns true if the button is a SwitchInlineButton, false otherwise
 */
export function isSwitchInlineButton(
  button: InlineKeyboardButton,
): button is InlineKeyboardButton.SwitchInlineButton {
  return "switch_inline_query" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a SwitchInlineCurrentChatButton.
 *
 * @param button The button to check
 * @returns true if the button is a SwitchInlineCurrentChatButton, false otherwise
 */
export function isSwitchInlineCurrentChatButton(
  button: InlineKeyboardButton,
): button is InlineKeyboardButton.SwitchInlineCurrentChatButton {
  return "switch_inline_query_current_chat" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a SwitchInlineChosenChatButton.
 *
 * @param button The button to check
 * @returns true if the button is a SwitchInlineChosenChatButton, false otherwise
 */
export function isSwitchInlineChosenChatButton(
  button: InlineKeyboardButton,
): button is InlineKeyboardButton.SwitchInlineChosenChatButton {
  return "switch_inline_query_chosen_chat" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a CopyTextButtonButton.
 *
 * @param button The button to check
 * @returns true if the button is a CopyTextButtonButton, false otherwise
 */
export function isCopyTextButton(
  button: InlineKeyboardButton,
): button is InlineKeyboardButton.CopyTextButtonButton {
  return "copy_text" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a GameButton.
 *
 * @param button The button to check
 * @returns true if the button is a GameButton, false otherwise
 */
export function isGameButton(
  button: InlineKeyboardButton,
): button is InlineKeyboardButton.GameButton {
  return "callback_game" in button;
}

/**
 * Type guard to check if an InlineKeyboardButton is a PayButton.
 *
 * @param button The button to check
 * @returns true if the button is a PayButton, false otherwise
 */
export function isPayButton(button: InlineKeyboardButton): button is InlineKeyboardButton.PayButton {
  return "pay" in button;
}
