import type { Context, InlineKeyboardButton } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { RangeBuilder } from "./range.ts";
import { BaseMenu } from "../menus/base.ts";

export type { Operation } from "./range.ts";

/**
 * BaseMenuBuilder is the abstract builder backing every menu builder.
 * Subclasses compose inline keyboards declaratively and later render them into
 * concrete menu objects with fresh callback payloads on each invocation.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const builder = new MenuBuilder<Context>()
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .cb("Option 2", async (ctx) => ctx.answerCallbackQuery("2"))
 *   .row()
 *   .url("Visit Website", "https://example.com");
 * ```
 */
export abstract class BaseMenuBuilder<C extends Context> extends RangeBuilder<C> {
  /** Optional text payload that accompanies the rendered menu */
  text?: string;

  /**
   * Creates a new BaseMenuBuilder instance.
   *
   * @param text Optional text or caption forwarded when the builder renders a menu
   */
  constructor(text?: string) {
    super();
    this.text = text;
  }

  /**
   * Sets or replaces the optional message text that will accompany the menu.
   *
   * @param text The text to send alongside the rendered menu
   * @returns this for method chaining
   */
  addText(text: string): this {
    this.text = text;
    return this;
  }

  /**
   * @internal
   * Renders the operations into separate inline and menu keyboard structures.
   *
   * **⚠️ WARNING:** This is an internal method. Do not use unless you know exactly what you are doing.
   * This method is called internally during the render process. Direct usage may produce unexpected results
   * or break the menu rendering pipeline. Use the public `render()` method instead.
   *
   * @param renderedMenuId Unique identifier for the rendered menu instance
   * @returns An object containing the constructed inline keyboard and menu keyboard matrices
   */
  _renderKeyboards(
    renderedMenuId: string,
  ): { inlineKeyboard: InlineKeyboardButton[][]; menuKeyboard: MenuButton<C>[][] } {
    const inlineKeyboard: InlineKeyboardButton[][] = [];
    const menuKeyboard: MenuButton<C>[][] = [];
    let inlineRow: InlineKeyboardButton[] = [];
    let menuRow: MenuButton<C>[] = [];

    for (const op of this.operations) {
      if (op.type === "nativeButton") {
        inlineRow.push(op.data);
        menuRow.push(op.data);
      } else if (op.type === "menuButton") {
        const row = inlineKeyboard.length;
        const col = inlineRow.length;
        const callbackData = `${renderedMenuId}:${row}:${col}`;
        const inlineButton: InlineKeyboardButton = {
          text: op.label,
          callback_data: callbackData,
        };
        inlineRow.push(inlineButton);
        const menuButton: MenuButton<C> = {
          ...inlineButton,
          handler: op.handler,
          payload: op.payload,
        };
        menuRow.push(menuButton);
      } else if (op.type === "row") {
        if (inlineRow.length > 0) {
          inlineKeyboard.push(inlineRow);
          menuKeyboard.push(menuRow);
          inlineRow = [];
          menuRow = [];
        }
      }
    }

    if (inlineRow.length > 0) {
      inlineKeyboard.push(inlineRow);
      menuKeyboard.push(menuRow);
    }

    return { inlineKeyboard, menuKeyboard };
  }

  /**
   * Renders the template into a Menu with a fresh inline keyboard instance.
   * Each render produces a unique Menu with automatically generated callback data
   * based on button positions within the keyboard grid.
   * Subclasses override this abstract method to attach their respective media payloads
   * while reusing the keyboard metadata generated from the operations.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A rendered Menu instance with the constructed keyboards and optional media payload
   */
  abstract render(templateMenuId: string, renderedMenuId: string): BaseMenu<C>;
}
