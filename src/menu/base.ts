import type { Context, InlineKeyboardButton } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { isInlineKeyboard } from "../typeguards/inline-keyboard.ts";

/**
 * BaseMenu represents a rendered menu with an inline keyboard and associated callback handlers.
 * Each BaseMenu instance is immutable and tracks its template origin and unique render ID.
 * Contains both the Telegram-compatible inline keyboard and the internal button metadata
 * with handler references for middleware routing.
 *
 * @template C The grammY Context type
 */
export abstract class BaseMenu<C extends Context> {
  /**
   * Creates a new BaseMenu instance.
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
   * This property makes BaseMenu compatible with grammY's reply_markup interface.
   *
   * @returns The inline keyboard button layout for Telegram API
   */
  get inline_keyboard(): InlineKeyboardButton[][] {
    return this.inlineKeyboard;
  }
}

/**
 * Type guard function to check if a value is a BaseMenu instance.
 * Useful for type narrowing when handling mixed types that might contain menus.
 *
 * @param value The value to check
 * @returns True if the value is a BaseMenu instance, false otherwise
 *
 * @example
 * ```ts
 * function processInput(input: unknown) {
 *   if (isBaseMenu(input)) {
 *     console.log(input.templateMenuId); // TypeScript knows this is safe
 *   }
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
