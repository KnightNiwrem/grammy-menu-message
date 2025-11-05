import type { Context, InputFile } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { DocumentMenu } from "../menu/document.ts";

/**
 * DocumentMenuTemplate extends BaseMenuTemplate to include a document media field.
 * Used for creating menus with document content and inline keyboards.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const documentMenu = new DocumentMenuTemplate<Context>(
 *   "https://example.com/document.pdf",
 *   "Choose an option:"
 * )
 *   .cb("Option 1", async (ctx) => { await ctx.answerCallbackQuery("1"); })
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class DocumentMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new DocumentMenuTemplate instance.
   *
   * @param document The document file as InputFile or URL string
   * @param messageText Optional text that will be used in the menu
   */
  constructor(document: InputFile | string, messageText?: string) {
    super(messageText);
    this.document = document;
  }

  /** The document media to be sent with the menu */
  document: InputFile | string;

  /** Differentiates the media type */
  readonly kind = "document" as const;

  /**
   * Renders the template into a DocumentMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A DocumentMenu instance with newly constructed button arrays
   */
  override render(templateMenuId: string, renderedMenuId: string): DocumentMenu<C> {
    const baseMenu = super.render(templateMenuId, renderedMenuId);
    return new DocumentMenu(
      templateMenuId,
      renderedMenuId,
      this.document,
      baseMenu.menuKeyboard,
      baseMenu.inline_keyboard,
    );
  }
}
