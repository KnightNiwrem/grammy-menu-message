import type { Context, InlineKeyboardButton } from "./dep.ts";
import type { MenuButton } from "./types.ts";
import type { MessagePayload } from "./template.ts";

import { isInlineKeyboard } from "./typeguards/inline-keyboard.ts";

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
   * @param messagePayload Optional message payload that will be used to override sent message payload in MenuRegistry's transformer
   * @param menuKeyboard 2D array of button objects with full handler information for internal use
   * @param inlineKeyboard The inline keyboard button layout for Telegram API compatibility
   */
  constructor(
    public readonly templateMenuId: string,
    public readonly renderedMenuId: string,
    public readonly messagePayload: MessagePayload | undefined,
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

  /**
   * Legacy property for backwards compatibility with text-only menus.
   * Returns the text from the messagePayload if it's a text message, undefined otherwise.
   *
   * @deprecated Use messagePayload instead
   */
  get messageText(): string | undefined {
    return this.messagePayload?.type === "text" ? this.messagePayload.text : undefined;
  }
}

/**
 * Type guard function to check if a value is a Menu instance.
 * Useful for type narrowing when handling mixed types that might contain menus.
 *
 * @param value The value to check
 * @returns True if the value is a Menu instance, false otherwise
 *
 * @example
 * ```ts
 * function processInput(input: unknown) {
 *   if (isMenu(input)) {
 *     console.log(input.templateMenuId); // TypeScript knows this is safe
 *   }
 * }
 * ```
 */
export function isMenu<C extends Context>(value: unknown): value is Menu<C> {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    typeof obj.templateMenuId === "string" &&
    typeof obj.renderedMenuId === "string" &&
    (typeof obj.messagePayload === "object" || obj.messagePayload === undefined) &&
    Array.isArray(obj.menuKeyboard) &&
    isInlineKeyboard(obj.inline_keyboard)
  );
}
