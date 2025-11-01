import type { InlineKeyboardButton } from "../dep.ts";

/**
 * Type guard to check if an InlineKeyboardButton is a UrlButton.
 *
 * @param button The button to check
 * @returns true if the button is a UrlButton, false otherwise
 */
export function isUrlButton(button: InlineKeyboardButton): button is InlineKeyboardButton.UrlButton {
  return "url" in button;
}
