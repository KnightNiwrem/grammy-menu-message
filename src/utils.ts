import type { Message } from "grammy/types";

// Only test non-exhaustively for the properties we care about
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
