import type { InlineKeyboardButton } from "grammy/types";
import type { Context, MiddlewareFn } from "grammy";
import type { MenuMiddlewareFn } from "./template.ts";

/**
 * Menu represents a rendered menu with an inline keyboard and associated callback handlers.
 * It maintains the mapping between callback_data positions and their middleware handlers.
 */
export class Menu {
  /**
   * Creates a new Menu instance.
   * @param renderedMenuId Unique identifier for this rendered menu
   * @param inlineKeyboard The inline keyboard button layout
   * @param middlewares Record of callback_data to middleware handlers
   * @param payloads Record of callback_data to payload strings
   */
  constructor(
    private readonly renderedMenuId: string,
    private readonly inlineKeyboard: InlineKeyboardButton[][],
    private readonly middlewares: Record<string, MenuMiddlewareFn> = {},
    private readonly payloads: Record<string, string> = {},
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
   * Wraps the MenuMiddlewareFn to inject the payload as the third argument.
   * @param callbackData The callback data from the button press
   * @returns The middleware function if found, undefined otherwise
   */
  getMiddleware(callbackData: string): MiddlewareFn | undefined {
    if (!callbackData.startsWith(this.renderedMenuId + ":")) {
      return undefined;
    }
    const menuMiddleware = this.middlewares[callbackData];
    if (!menuMiddleware) {
      return undefined;
    }
    const payload = this.payloads[callbackData];
    return (ctx: Context, next: () => Promise<void>) => {
      return menuMiddleware(ctx, next, payload);
    };
  }

  /**
   * Gets the payloads record for this menu.
   * @returns Record of callback_data to payload strings
   */
  getPayloads(): Record<string, string> {
    return this.payloads;
  }
}
