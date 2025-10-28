import type { Context } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";
import type { MenuButton } from "./types.ts";

/**
 * Menu represents a rendered menu with an inline keyboard and associated callback handlers.
 * Each Menu instance is immutable and tracks its template origin and unique render ID.
 * Contains both the Telegram-compatible inline keyboard and the internal button metadata
 * with handler references for middleware routing.
 *
 * @template C The grammY Context type
 */
export class Menu<C extends Context> {
  /**
   * Creates a new Menu instance.
   *
   * @param templateMenuId Unique identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @param menuKeyboard 2D array of button objects with full handler information for internal use
   * @param inlineKeyboard The inline keyboard button layout for Telegram API compatibility
   */
  constructor(
    public readonly templateMenuId: string,
    public readonly renderedMenuId: string,
    public readonly menuKeyboard: MenuButton<C>[][],
    private readonly inlineKeyboard: InlineKeyboardButton[][],
  ) {}

  /**
   * Gets the inline keyboard structure for this menu.
   * This property makes Menu compatible with grammY's reply_markup interface.
   *
   * @returns The inline keyboard button layout for Telegram API
   */
  get inline_keyboard(): InlineKeyboardButton[][] {
    return this.inlineKeyboard;
  }
}
