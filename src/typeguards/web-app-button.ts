import type { InlineKeyboardButton } from "../dep.ts";

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
