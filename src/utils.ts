import type { Message } from "./dep.deno.ts";

/**
 * Type guard to check if an unknown value is a Telegram Message object.
 * Only tests non-exhaustively for the properties required by this library.
 *
 * @param candidate The value to check
 * @returns true if the candidate is a Message with required properties, false otherwise
 */
export function isMessage(candidate: unknown): candidate is Message {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }
  if (!("message_id" in candidate) || typeof candidate.message_id !== "number") {
    return false;
  }
  if (!("chat" in candidate) || typeof candidate.chat !== "object" || !candidate.chat) {
    return false;
  }
  if (!("id" in candidate.chat) || typeof candidate.chat.id !== "number") {
    return false;
  }
  return true;
}

export const MESSAGE_TYPES = {
  REGULAR: "regular",
  INLINE: "inline",
} as const;
