import type { InlineKeyboardButton } from "../dep.ts";

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
