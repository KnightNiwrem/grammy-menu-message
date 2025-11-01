import type { Message } from "../dep.ts";

/**
 * Type guard to check if an unknown value is a Telegram Message object.
 * Only tests non-exhaustively for the properties required by this library.
 *
 * @param value The value to check
 * @returns true if the candidate is a Message with required properties, false otherwise
 */
export function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (!("message_id" in value) || typeof value.message_id !== "number") {
    return false;
  }
  if (!("chat" in value) || typeof value.chat !== "object" || !value.chat) {
    return false;
  }
  if (!("id" in value.chat) || typeof value.chat.id !== "number") {
    return false;
  }
  return true;
}
