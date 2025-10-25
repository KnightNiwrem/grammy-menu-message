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
   * @param middlewareMap Map of callback_data to middleware handlers
   * @param payloadMap Map of callback_data to payload strings
   */
  constructor(
    private readonly renderedMenuId: string,
    private readonly inlineKeyboard: InlineKeyboardButton[][],
    private readonly middlewareMap: Map<string, MenuMiddlewareFn> = new Map(),
    private readonly payloadMap: Map<string, string> = new Map(),
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
    const menuMiddleware = this.middlewareMap.get(callbackData);
    if (!menuMiddleware) {
      return undefined;
    }
    const payload = this.payloadMap.get(callbackData);
    return (ctx: Context, next: () => Promise<void>) => {
      return menuMiddleware(ctx, next, payload);
    };
  }

  /**
   * Gets all middleware entries from this menu.
   * @returns An array of [callbackData, middleware] tuples
   */
  getMiddlewareEntries(): Array<[string, MenuMiddlewareFn]> {
    return Array.from(this.middlewareMap.entries());
  }

  /**
   * Gets all payload entries from this menu.
   * @returns An array of [callbackData, payload] tuples
   */
  getPayloadEntries(): Array<[string, string]> {
    return Array.from(this.payloadMap.entries());
  }
}
