import type { InlineKeyboardButton } from "../dep.ts";

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
