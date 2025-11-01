import type { InlineKeyboardButton } from "../dep.ts";

/**
 * Type guard to check if an unknown value is an InlineKeyboardButton.
 * Tests for the common properties present in all button types.
 *
 * @param value The value to check
 * @returns true if the value is a valid InlineKeyboardButton, false otherwise
 */
export function isInlineKeyboardButton(value: unknown): value is InlineKeyboardButton {
  if (!value || typeof value !== "object") {
    return false;
  }

  // All InlineKeyboardButton types have a text property
  if (!("text" in value) || typeof value.text !== "string") {
    return false;
  }

  // Exactly one of these optional fields must be present
  const requiredOptionalFieldTypeEntries: [string, string][] = [
    ["url", "string"],
    ["callback_data", "string"],
    ["web_app", "object"],
    ["login_url", "object"],
    ["switch_inline_query", "string"],
    ["switch_inline_query_current_chat", "string"],
    ["switch_inline_query_chosen_chat", "object"],
    ["copy_text", "object"],
    ["callback_game", "object"],
    ["pay", "boolean"],
  ];
  // Imperfect heuristic as we do not deeply test object
  const matchingOptionalFieldTypes = requiredOptionalFieldTypeEntries.filter(([field, fieldType]) => {
    //@ts-expect-error We are intentionally violating type checks when testing typeof field
    return field in value && typeof value[field] === fieldType;
  });
  if (matchingOptionalFieldTypes.length !== 1) {
    return false;
  }

  return true;
}
