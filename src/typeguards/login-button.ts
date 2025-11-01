import type { InlineKeyboardButton } from "../dep.ts";

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
