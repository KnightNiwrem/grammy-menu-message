import type { InlineKeyboardButton } from "grammy/types";
import type { MiddlewareFn } from "grammy";

export type MenuButton = InlineKeyboardButton & { middleware?: MiddlewareFn };

/**
 * Menu represents a rendered menu with an inline keyboard and associated callback handlers.
 * It maintains full button information including middleware references.
 */
export class Menu {
  /**
   * Creates a new Menu instance.
   * @param renderedMenuId Unique identifier for this rendered menu
   * @param menuKeyboard 2D array of button objects with full plugin information
   * @param inlineKeyboard The inline keyboard button layout for Telegram API
   */
  constructor(
    private readonly renderedMenuId: string,
    public readonly menuKeyboard: MenuButton[][],
    private readonly inlineKeyboard: InlineKeyboardButton[][],
  ) {}

  /**
   * Gets the inline keyboard structure for this menu.
   * @returns The inline keyboard button layout
   */
  get inline_keyboard(): InlineKeyboardButton[][] {
    return this.inlineKeyboard;
  }
}
