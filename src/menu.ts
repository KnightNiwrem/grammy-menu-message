import type { InlineKeyboardButton } from "grammy/types";

/**
 * Menu represents a rendered menu with an inline keyboard.
 * It provides access to the inline keyboard structure for sending via Telegram Bot API.
 */
export class Menu {
  /**
   * Creates a new Menu instance.
   * @param inlineKeyboard The inline keyboard button layout
   */
  constructor(private readonly inlineKeyboard: InlineKeyboardButton[][]) {}

  /**
   * Gets the inline keyboard structure for this menu.
   * @returns The inline keyboard button layout
   */
  get inline_keyboard(): InlineKeyboardButton[][] {
    return this.inlineKeyboard;
  }
}
