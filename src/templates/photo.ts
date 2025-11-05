import type { Context, InputMediaPhoto } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";

/**
 * PhotoMenuTemplate extends BaseMenuTemplate to include a photo media field.
 * Used for creating menus with photo content and inline keyboards.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const photoMenu = new PhotoMenuTemplate<Context>(
 *   { type: "photo", media: "https://example.com/photo.jpg" },
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
   * @param photo The InputMediaPhoto object containing photo content
   * @param messageText Optional text that will be used in the menu
   */
  constructor(photo: InputMediaPhoto, messageText?: string) {
    super(messageText);
    this.photo = photo;
  }

  /** The photo media to be sent with the menu */
  photo: InputMediaPhoto;
}
