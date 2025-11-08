import type { Context, InlineKeyboardButton, NextFunction } from "./dep.ts";

/**
 * Handler function for menu button callbacks.
 * Invoked by the MenuRegistry middleware when a menu button is pressed.
 *
 * @template C The grammY Context type
 * @param ctx The grammY context object for the callback query
 * @param next Function to pass control to the next middleware in the chain
 * @param payload Optional data passed from the button definition (reserved for future use)
 * @returns A Promise that resolves when the handler completes, or void for synchronous handlers
 */
export type MenuButtonHandler<C extends Context> = (
  ctx: C,
  next: NextFunction,
  payload?: string,
) => Promise<void> | void;

/**
 * Represents a callback button with an optional handler function and payload.
 * Extends InlineKeyboardButton to include middleware capabilities for menu buttons
 * created via MenuBuilder.cb(), while allowing native button types from other methods.
 *
 * @template C The grammY Context type
 */
export type MenuButton<C extends Context> =
  | InlineKeyboardButton
  | (InlineKeyboardButton.CallbackButton & {
    handler: MenuButtonHandler<C>;
    payload?: string;
  });

/**
 * Stored information about a rendered menu instance.
 * Used to reconstruct menus from storage when handling callbacks after bot restarts.
 *
 * Storage key format: `${keyPrefix}:menus:${renderedMenuId}`
 */
export interface RenderedMenuData {
  /** The template menu ID this menu was rendered from */
  templateMenuId: string;
  /** Unix timestamp (milliseconds) when the menu was rendered */
  timestamp: number;
}

/**
 * A single record in the navigation history of a menu message.
 * Tracks which menus were rendered for a specific message over time.
 * Multiple records can exist for the same message as users navigate through different menus.
 */
export interface MenuNavigationHistoryRecord {
  /** The unique ID of the rendered menu instance */
  renderedMenuId: string;
  /** The template ID the menu was rendered from */
  templateMenuId: string;
  /** Unix timestamp (milliseconds) when this menu was sent/updated */
  timestamp: number;
}

/**
 * Per-message data stored for menu messages.
 * Maintains the complete navigation history for a single message entity.
 *
 * Storage key format: `${keyPrefix}:regular:${chatId}:${messageId}`
 */
export interface NavigationHistoryData {
  /** Ordered array of navigation records, oldest first */
  navigationHistory: MenuNavigationHistoryRecord[];
}
