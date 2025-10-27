import type { Context, NextFunction } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";

/**
 * Handler function for menu button callbacks.
 * @param ctx The grammY context object
 * @param next Function to pass control to the next middleware
 * @param payload Reserved for future use (currently unused)
 */
export type MenuButtonHandler<C extends Context> = (
  ctx: C,
  next: NextFunction,
  payload?: string,
) => Promise<void> | void;

/**
 * Represents a callback button with an optional handler function.
 * Extends InlineKeyboardButton.CallbackButton with middleware capabilities.
 */
export type MenuButton<C extends Context> =
  & InlineKeyboardButton
  & (InlineKeyboardButton.CallbackButton & {
    handler: MenuButtonHandler<C>;
    payload?: string;
  });

/**
 * A single record in the navigation history of a menu message.
 * Tracks which menus were rendered for a specific message.
 */
export interface MenuNavigationHistoryRecord {
  renderedMenuId: string;
  templateMenuId: string;
  timestamp: number;
}

/**
 * Per-message data stored for menu messages.
 * Indexed by storage key (typically derived from chatId:messageId).
 */
export interface MenuMessageData {
  navigationHistory: MenuNavigationHistoryRecord[];
}
