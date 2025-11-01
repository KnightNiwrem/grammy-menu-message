import type { InlineKeyboardButton } from "../dep.ts";

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
