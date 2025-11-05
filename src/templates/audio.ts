import type { Context, InputMediaAudio } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";

/**
 * AudioMenuTemplate extends BaseMenuTemplate to include an audio media field.
 * Used for creating menus with audio content and inline keyboards.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const audioMenu = new AudioMenuTemplate<Context>(
 *   { type: "audio", media: "https://example.com/audio.mp3" },
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
   * @param audio The InputMediaAudio object containing audio content
   * @param messageText Optional text that will be used in the menu
   */
  constructor(audio: InputMediaAudio, messageText?: string) {
    super(messageText);
    this.audio = audio;
  }

  /** The audio media to be sent with the menu */
  audio: InputMediaAudio;
}
