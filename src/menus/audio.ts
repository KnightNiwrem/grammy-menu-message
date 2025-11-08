import type { Context, InlineKeyboardButton, InputFile } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { BaseMenu } from "./base.ts";

/**
 * AudioMenu represents a rendered menu that sends audio along with optional text.
 *
 * @template C The grammY Context type
 */
export class AudioMenu<C extends Context> extends BaseMenu<C> {
  readonly kind = "audio" as const;

  /**
   * Creates a new AudioMenu instance.
   *
   * @param templateMenuId Identifier of the template the menu was rendered from
   * @param renderedMenuId Unique identifier for this rendered menu instance
   * @param menuKeyboard Two-dimensional array of full button metadata for callback routing
   * @param inlineKeyboard Inline keyboard layout that will be sent to Telegram
   * @param audio Audio file or URL that Telegram will deliver with the menu
   * @param text Optional caption text to accompany the audio
   */
  constructor(
    templateMenuId: string,
    renderedMenuId: string,
    menuKeyboard: MenuButton<C>[][],
    inlineKeyboard: InlineKeyboardButton[][],
    public readonly audio: InputFile | string,
    public readonly text?: string,
  ) {
    super(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);
  }
}
