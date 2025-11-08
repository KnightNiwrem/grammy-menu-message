import type { Context, InputFile } from "../dep.ts";
import { BaseMenuBuilder } from "./base.ts";
import { AudioMenu } from "../menu/audio.ts";

/**
 * AudioMenuBuilder wraps the generic menu builder with audio media support.
 * Pass in an {@link InputFile} or URL pointing to the audio track and optionally
 * add caption text through the constructor or {@link BaseMenuBuilder.addText}.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const audioMenu = new AudioMenuBuilder<Context>(
 *   "https://example.com/audio.mp3",
 * )
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class AudioMenuBuilder<C extends Context> extends BaseMenuBuilder<C> {
  /** The audio media to be sent with the menu */
  audio: InputFile | string;

  /** Differentiates what kind of MenuBuilder it is */
  readonly kind = "audio" as const;

  /**
   * Creates a new AudioMenuBuilder instance.
   *
   * @param audio The audio file as InputFile or URL string
   * @param text Optional caption sent alongside the rendered audio
   */
  constructor(audio: InputFile | string, text?: string) {
    super(text);
    this.audio = audio;
  }

  /**
   * Renders the builder into an AudioMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu builder this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns An AudioMenu carrying the generated keyboard and optional text
   */
  override render(templateMenuId: string, renderedMenuId: string): AudioMenu<C> {
    const { inlineKeyboard, menuKeyboard } = super._renderKeyboards(renderedMenuId);
    return new AudioMenu(
      templateMenuId,
      renderedMenuId,
      menuKeyboard,
      inlineKeyboard,
      this.audio,
      this.text,
    );
  }
}
