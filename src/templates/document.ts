import type { Context, InputFile } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { DocumentMenu } from "../menu/document.ts";

/**
 * DocumentMenuTemplate produces menus that send a document attachment together
 * with an inline keyboard assembled through {@link BaseMenuTemplate} helpers.
 * Provide an {@link InputFile} or URL for the document and optionally specify
 * accompanying text via the constructor or {@link BaseMenuTemplate.addText}.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const documentMenu = new DocumentMenuTemplate<Context>(
 *   "https://example.com/document.pdf",
 * )
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class DocumentMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /** The document media to be sent with the menu */
  document: InputFile | string;

  /** Differentiates what kind of MenuTemplate it is */
  readonly kind = "document" as const;

  /**
   * Creates a new DocumentMenuTemplate instance.
   *
   * @param document The document file as InputFile or URL string
   * @param text Optional caption sent alongside the rendered document
   */
  constructor(document: InputFile | string, text?: string) {
    super(text);
    this.document = document;
  }

  /**
   * Renders the template into a DocumentMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A DocumentMenu carrying the generated keyboard and optional text
   */
  override render(templateMenuId: string, renderedMenuId: string): DocumentMenu<C> {
    const { inlineKeyboard, menuKeyboard } = super._renderKeyboards(renderedMenuId);
    return new DocumentMenu(
      templateMenuId,
      renderedMenuId,
      menuKeyboard,
      inlineKeyboard,
      this.document,
      this.text,
    );
  }
}
