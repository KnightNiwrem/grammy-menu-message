import type { Context, InputFile } from "../dep.ts";
import { BaseMenuBuilder } from "./base.ts";
import { PhotoMenu } from "../menu/photo.ts";

/**
 * PhotoMenuBuilder constructs menus that send a photo attachment while
 * reusing the keyboard builder provided by {@link BaseMenuBuilder}.
 * Pass in a {@link InputFile} or URL for the photo and optionally provide a
 * {@link BaseMenuBuilder.addText} to add a caption.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const photoMenu = new PhotoMenuBuilder<Context>(
 *   "https://example.com/photo.jpg",
 * )
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class PhotoMenuBuilder<C extends Context> extends BaseMenuBuilder<C> {
  /** The photo media to be sent with the menu */
  photo: InputFile | string;

  /** Differentiates what kind of MenuBuilder it is */
  readonly kind = "photo" as const;

  /**
   * Creates a new PhotoMenuBuilder instance.
   *
   * @param photo The photo file as InputFile or URL string
   * @param text Optional caption sent alongside the rendered photo
   */
  constructor(photo: InputFile | string, text?: string) {
    super(text);
    this.photo = photo;
  }

  /**
   * Renders the builder into a PhotoMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu builder this was rendered from
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
