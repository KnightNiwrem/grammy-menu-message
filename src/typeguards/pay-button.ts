import type { InlineKeyboardButton } from "../dep.ts";

/**
 * Type guard to check if an InlineKeyboardButton is a PayButton.
 *
 * @param button The button to check
 * @returns true if the button is a PayButton, false otherwise
 */
export function isPayButton(button: InlineKeyboardButton): button is InlineKeyboardButton.PayButton {
  return "pay" in button;
}
