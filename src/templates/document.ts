import type { Context, InputFile } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";

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
  override readonly kind = "document" as const;
}
