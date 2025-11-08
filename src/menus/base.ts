import type { Context, InlineKeyboardButton } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { isInlineKeyboard } from "../typeguards/inline-keyboard.ts";

/**
 * BaseMenu is the base abstraction for all rendered menus.
 * Implementations capture the inline keyboard that Telegram expects together with
 * the richer metadata the registry uses for routing button callbacks.
 *
 * @template C The grammY Context type
 */
export abstract class BaseMenu<C extends Context> {
  /**
   * Creates a new BaseMenu instance.
   *
   * @param templateMenuId Identifier of the template the menu was rendered from
   * @param renderedMenuId Unique identifier for this rendered menu instance
   * @param menuKeyboard Two-dimensional array of full button metadata for callback routing
   * @param inlineKeyboard Inline keyboard layout that will be sent to Telegram
   */
  constructor(
    public readonly templateMenuId: string,
    public readonly renderedMenuId: string,
    public readonly menuKeyboard: MenuButton<C>[][],
    private readonly inlineKeyboard: InlineKeyboardButton[][],
  ) {}

  /**
   * Exposes the inline keyboard so the menu can be serialized as Telegram reply markup.
   *
   * @returns Inline keyboard layout understood by the Telegram Bot API
   */
  get inline_keyboard(): InlineKeyboardButton[][] {
    return this.inlineKeyboard;
  }
}

/**
 * Checks whether a value satisfies the BaseMenu contract.
 * Handy when processing payloads that might contain rendered menus alongside other data.
 *
 * @param value The candidate value to inspect
 * @returns True when the value looks like a BaseMenu implementation
 *
 * @example
 * ```ts
 * if (isMenu(payload.reply_markup)) {
 *   console.log(payload.reply_markup.renderedMenuId);
 * }
 * ```
 */
export function isMenu<C extends Context>(value: unknown): value is BaseMenu<C> {
  if (value === null || typeof value !== "object") {
    return false;
  }

  return (
    "templateMenuId" in value &&
    typeof value.templateMenuId === "string" &&
    "renderedMenuId" in value &&
    typeof value.renderedMenuId === "string" &&
    "menuKeyboard" in value &&
    Array.isArray(value.menuKeyboard) &&
    "inline_keyboard" in value &&
    isInlineKeyboard(value.inline_keyboard)
  );
}
