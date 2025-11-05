import type { Context } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { TextMenu } from "../menu/text.ts";

/**
 * TextMenuTemplate extends BaseMenuTemplate to include message text.
 * Used for creating menus with text content and inline keyboards.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const textMenu = new TextMenuTemplate<Context>(
 *   "Choose an option:"
 * )
 *   .cb("Option 1", async (ctx) => { await ctx.answerCallbackQuery("1"); })
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class TextMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new TextMenuTemplate instance.
   *
   * @param messageText The text content of the menu message
   */
  constructor(messageText: string) {
    super(messageText);
  }

  /**
   * Renders the template into a TextMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A TextMenu instance with newly constructed button arrays
   */
  override render(templateMenuId: string, renderedMenuId: string): TextMenu<C> {
    const baseMenu = super.render(templateMenuId, renderedMenuId);
    return new TextMenu(
      templateMenuId,
      renderedMenuId,
      this.messageText!,
      baseMenu.menuKeyboard,
      baseMenu.inline_keyboard,
    );
  }
}
