import type { Context } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { TextMenu } from "../menu/text.ts";

/**
 * TextMenuTemplate is the plain template variant that renders menus without
 * media attachments. Supply optional text via the constructor or
 * {@link BaseMenuTemplate.addText}; when omitted, the menu becomes keyboard-only.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const textMenu = new TextMenuTemplate<Context>()
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class TextMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new TextMenuTemplate instance.
   *
   * @param text Optional text content to be sent with the menu
   */
  constructor(text?: string) {
    super(text);
  }

  /**
   * Renders the template into a TextMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A TextMenu carrying the generated keyboard and optional text
   */
  override render(templateMenuId: string, renderedMenuId: string): TextMenu<C> {
    const { inlineKeyboard, menuKeyboard } = super._renderKeyboards(renderedMenuId);
    return new TextMenu(
      templateMenuId,
      renderedMenuId,
      menuKeyboard,
      inlineKeyboard,
      this.text,
    );
  }
}
