import type { Context } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { TextMenu } from "../menu/text.ts";

/**
 * TextMenuTemplate extends BaseMenuTemplate for menus without media.
 * Optional message text can be supplied; when omitted, only the keyboard is rendered.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const textMenu = new TextMenuTemplate<Context>()
 *   .cb("Option 1", async (ctx) => { await ctx.answerCallbackQuery("1"); })
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class TextMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new TextMenuTemplate instance.
   *
   * @param messageText Optional text content to be sent with the menu
   */
  constructor(text?: string) {
    super(text);
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
      baseMenu.menuKeyboard,
      baseMenu.inline_keyboard,
      this.text,
    );
  }
}
