import type { Context, InputFile } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { AudioMenu } from "../menu/audio.ts";

/**
 * AudioMenuTemplate extends BaseMenuTemplate to include an audio media field.
 * Used for creating menus with audio content and inline keyboards.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const audioMenu = new AudioMenuTemplate<Context>(
 *   "https://example.com/audio.mp3",
 *   "Choose an option:"
 * )
 *   .cb("Option 1", async (ctx) => { await ctx.answerCallbackQuery("1"); })
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class AudioMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new AudioMenuTemplate instance.
   *
   * @param audio The audio file as InputFile or URL string
   * @param messageText Optional text that will be used in the menu
   */
  constructor(audio: InputFile | string, text?: string) {
    super(text);
    this.audio = audio;
  }

  /** The audio media to be sent with the menu */
  audio: InputFile | string;

  /** Differentiates the media type */
  readonly kind = "audio" as const;

  /**
   * Renders the template into an AudioMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns An AudioMenu instance with newly constructed button arrays
   */
  override render(templateMenuId: string, renderedMenuId: string): AudioMenu<C> {
    const baseMenu = super.render(templateMenuId, renderedMenuId);
    return new AudioMenu(
      templateMenuId,
      renderedMenuId,
      baseMenu.menuKeyboard,
      baseMenu.inline_keyboard,
      this.audio,
      this.text,
    );
  }
}
