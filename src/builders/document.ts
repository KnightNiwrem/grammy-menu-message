import type { Context, InputFile } from "../dep.ts";
import { BaseMenuBuilder } from "./base.ts";
import { DocumentMenu } from "../menu/document.ts";

/**
 * DocumentMenuBuilder produces menus that send a document attachment together
 * with an inline keyboard assembled through {@link BaseMenuBuilder} helpers.
 * Provide an {@link InputFile} or URL for the document and optionally add
 * accompanying text via the constructor or {@link BaseMenuBuilder.addText}.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const documentMenu = new DocumentMenuBuilder<Context>(
 *   "https://example.com/file.pdf",
 * )
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class DocumentMenuBuilder<C extends Context> extends BaseMenuBuilder<C> {
  /** The document media to be sent with the menu */
  document: InputFile | string;

  /** Differentiates what kind of MenuBuilder it is */
  readonly kind = "document" as const;

  /**
   * Creates a new DocumentMenuBuilder instance.
   *
   * @param document The document file as InputFile or URL string
   * @param text Optional caption sent alongside the rendered document
   */
  constructor(document: InputFile | string, text?: string) {
    super(text);
    this.document = document;
  }

  /**
   * Renders the builder into a DocumentMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu builder this was rendered from
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
