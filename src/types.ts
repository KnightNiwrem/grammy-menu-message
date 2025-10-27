import type { Context, NextFunction } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";

// Represents a custom menu button handler function
export type MenuButtonHandler<C extends Context> = (
  ctx: C,
  next: NextFunction,
  payload?: string,
) => Promise<void> | void;

// Represents a custom menu callback button
export type MenuButton<C extends Context> =
  & InlineKeyboardButton.CallbackButton
  & { handler?: MenuButtonHandler<C> };

// Represents a single record in the navigation history of menu messages
export interface MenuNavigationHistoryRecord {
  renderedMenuId: string;
  templateMenuId: string;
  timestamp: number;
}

// Represents the per-keyId (typically chatId:messageId) data stored for menu messages
export interface MenuMessageData {
  navigationHistory: MenuNavigationHistoryRecord[];
}
