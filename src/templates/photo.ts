import type { Context, InputFile } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { PhotoMenu } from "../menu/photo.ts";

/**
 * PhotoMenuTemplate constructs menus that send a photo attachment while
 * reusing the keyboard builder provided by {@link BaseMenuTemplate}.
 * Supply an {@link InputFile} or URL to the photo and optionally call
 * {@link BaseMenuTemplate.addText} to add a caption.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const photoMenu = new PhotoMenuTemplate<Context>(
 *   "https://example.com/photo.jpg",
 * )
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class PhotoMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new PhotoMenuTemplate instance.
   *
   * @param photo The photo file as InputFile or URL string
   * @param text Optional caption sent alongside the rendered photo
   */
  constructor(photo: InputFile | string, text?: string) {
    super(text);
    this.photo = photo;
  }

  /** The photo media to be sent with the menu */
  photo: InputFile | string;

  /** Differentiates the media type */
  readonly kind = "photo" as const;

  /**
   * Renders the template into a PhotoMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A PhotoMenu carrying the generated keyboard and optional text
   */
  override render(templateMenuId: string, renderedMenuId: string): PhotoMenu<C> {
    const { inlineKeyboard, menuKeyboard } = super._renderKeyboards(renderedMenuId);
    return new PhotoMenu(
      templateMenuId,
      renderedMenuId,
      menuKeyboard,
      inlineKeyboard,
      this.photo,
      this.text,
    );
  }
}
