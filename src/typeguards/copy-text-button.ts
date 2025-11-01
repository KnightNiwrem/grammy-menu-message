import type { InlineKeyboardButton } from "../dep.ts";

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
