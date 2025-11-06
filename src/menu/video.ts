import type { Context, InlineKeyboardButton, InputFile } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { BaseMenu } from "./base.ts";

/**
 * VideoMenu represents a rendered menu that sends a video with optional text.
 *
 * @template C The grammY Context type
 */
export class VideoMenu<C extends Context> extends BaseMenu<C> {
  readonly kind = "video" as const;

  /**
   * Creates a new VideoMenu instance.
   *
   * @param templateMenuId Identifier of the template the menu was rendered from
   * @param renderedMenuId Unique identifier for this rendered menu instance
   * @param menuKeyboard Two-dimensional array of full button metadata for callback routing
   * @param inlineKeyboard Inline keyboard layout that will be sent to Telegram
   * @param video Video file or URL that Telegram will deliver with the menu
   * @param text Optional caption text to accompany the video
   */
  constructor(
    templateMenuId: string,
    renderedMenuId: string,
    menuKeyboard: MenuButton<C>[][],
    inlineKeyboard: InlineKeyboardButton[][],
    public readonly video: InputFile | string,
    public readonly text?: string,
  ) {
    super(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);
  }
}
