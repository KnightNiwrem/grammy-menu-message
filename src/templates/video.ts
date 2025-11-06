import type { Context, InputFile } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { VideoMenu } from "../menu/video.ts";

/**
 * VideoMenuTemplate extends BaseMenuTemplate to include a video media field.
 * Used for creating menus with video content and inline keyboards.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const videoMenu = new VideoMenuTemplate<Context>(
 *   "https://example.com/video.mp4",
 *   "Choose an option:"
 * )
 *   .cb("Option 1", async (ctx) => { await ctx.answerCallbackQuery("1"); })
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class VideoMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new VideoMenuTemplate instance.
   *
   * @param video The video file as InputFile or URL string
   * @param messageText Optional text that will be used in the menu
   */
  constructor(video: InputFile | string, text?: string) {
    super(text);
    this.video = video;
  }

  /** The video media to be sent with the menu */
  video: InputFile | string;

  /** Differentiates the media type */
  readonly kind = "video" as const;

  /**
   * Renders the template into a VideoMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A VideoMenu instance with newly constructed button arrays
   */
  override render(templateMenuId: string, renderedMenuId: string): VideoMenu<C> {
    const baseMenu = super.render(templateMenuId, renderedMenuId);
    return new VideoMenu(
      templateMenuId,
      renderedMenuId,
      baseMenu.menuKeyboard,
      baseMenu.inline_keyboard,
      this.video,
      this.text,
    );
  }
}
