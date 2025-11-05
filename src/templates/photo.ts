import type { Context, InputFile } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { PhotoMenu } from "../menu/photo.ts";

/**
 * PhotoMenuTemplate extends BaseMenuTemplate to include a photo media field.
 * Used for creating menus with photo content and inline keyboards.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const photoMenu = new PhotoMenuTemplate<Context>(
 *   "https://example.com/photo.jpg",
 *   "Choose an option:"
 * )
 *   .cb("Option 1", async (ctx) => { await ctx.answerCallbackQuery("1"); })
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class PhotoMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new PhotoMenuTemplate instance.
   *
   * @param photo The photo file as InputFile or URL string
   * @param messageText Optional text that will be used in the menu
   */
  constructor(photo: InputFile | string, messageText?: string) {
    super(messageText);
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
   * @returns A PhotoMenu instance with newly constructed button arrays
   */
  override render(templateMenuId: string, renderedMenuId: string): PhotoMenu<C> {
    const baseMenu = super.render(templateMenuId, renderedMenuId);
    return new PhotoMenu(
      templateMenuId,
      renderedMenuId,
      this.photo,
      baseMenu.menuKeyboard,
      baseMenu.inline_keyboard,
    );
  }
}
