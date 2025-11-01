import type { InlineKeyboardButton } from "../dep.ts";
import { isInlineKeyboardButton } from "./inline-keyboard-button.ts";

export type InlineKeyboard = InlineKeyboardButton[][];

/**
 * Type guard to check if an unknown value is an InlineKeyboard.
 * Validates the structure as a 2D array of InlineKeyboardButton objects.
 *
 * @param value The value to check
 * @returns true if the value is a valid InlineKeyboard, false otherwise
 */
export function isInlineKeyboard(value: unknown): value is InlineKeyboard {
  if (!Array.isArray(value)) {
    return false;
  }

  // Check that every row is an array
  for (const row of value) {
    if (!Array.isArray(row)) {
      return false;
    }

    // Check that every button in the row is a valid InlineKeyboardButton
    for (const button of row) {
      if (!isInlineKeyboardButton(button)) {
        return false;
      }
    }
  }

  return true;
}
