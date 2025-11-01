import type { InlineKeyboardButton } from "../dep.ts";

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
