import type { InlineKeyboardButton } from "grammy/types";
import type { MiddlewareFn } from "grammy";

/**
 * Menu represents a rendered menu with an inline keyboard and associated callback handlers.
 * It maintains the mapping between callback_data positions and their middleware handlers.
 */
export class Menu {
  /**
   * Creates a new Menu instance.
   * @param renderedMenuId Unique identifier for this rendered menu
   * @param inlineKeyboard The inline keyboard button layout
   * @param middlewareMap Map of position (row:col) to middleware handlers
   */
  constructor(
    private readonly renderedMenuId: string,
    private readonly inlineKeyboard: InlineKeyboardButton[][],
    private readonly middlewareMap: Map<string, MiddlewareFn> = new Map(),
  ) {}

  /**
   * Gets the inline keyboard structure for this menu.
   * @returns The inline keyboard button layout
   */
  get inline_keyboard(): InlineKeyboardButton[][] {
    return this.inlineKeyboard;
  }

  /**
   * Gets the middleware handler for a given callback_data, if it exists.
   * @param callbackData The callback data from the button press
   * @returns The middleware function if found, undefined otherwise
   */
  getMiddleware(callbackData: string): MiddlewareFn | undefined {
    if (!callbackData.startsWith(this.renderedMenuId + ":")) {
      return undefined;
    }
    return this.middlewareMap.get(callbackData);
  }
}
