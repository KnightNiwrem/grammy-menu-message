import type { InlineKeyboardButton } from "../dep.ts";

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
