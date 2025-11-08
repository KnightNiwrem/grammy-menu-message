import type { Context, InputFile } from "../dep.ts";
import { BaseMenuBuilder } from "./base.ts";
import { VideoMenu } from "../menus/video.ts";

/**
 * VideoMenuBuilder creates menus that deliver a video along with a keyboard
 * assembled through {@link BaseMenuBuilder}'s fluent API.
 * Provide an {@link InputFile} or URL for the video and optionally add caption
 * text through the constructor or {@link BaseMenuBuilder.addText}.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const videoMenu = new VideoMenuBuilder<Context>(
 *   "https://example.com/video.mp4",
 * )
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class VideoMenuBuilder<C extends Context> extends BaseMenuBuilder<C> {
  /** The video media to be sent with the menu */
  video: InputFile | string;

  /** Differentiates what kind of MenuBuilder it is */
  readonly kind = "video" as const;

  /**
   * Creates a new VideoMenuBuilder instance.
   *
   * @param video The video file as InputFile or URL string
   * @param text Optional caption sent alongside the rendered video
   */
  constructor(video: InputFile | string, text?: string) {
    super(text);
    this.video = video;
  }

  /**
   * Renders the builder into a VideoMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu builder this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A VideoMenu carrying the generated keyboard and optional text
   */
  override render(templateMenuId: string, renderedMenuId: string): VideoMenu<C> {
    const { inlineKeyboard, menuKeyboard } = super._renderKeyboards(renderedMenuId);
    return new VideoMenu(
      templateMenuId,
      renderedMenuId,
      menuKeyboard,
      inlineKeyboard,
      this.video,
      this.text,
    );
  }
}
