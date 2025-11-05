import type { Context, InlineKeyboardButton, InputFile } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { BaseMenu } from "./base.ts";

/**
 * VideoMenu represents a rendered video menu with video media.
 *
 * @template C The grammY Context type
 */
export class VideoMenu<C extends Context> extends BaseMenu<C> {
  readonly kind = "video" as const;

  /**
   * Creates a new VideoMenu instance.
   *
   * @param templateMenuId Unique identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @param video The video file as InputFile or URL string
   * @param menuKeyboard 2D array of button objects with full handler information for internal use
   * @param inlineKeyboard The inline keyboard button layout for Telegram API compatibility
   */
  constructor(
    templateMenuId: string,
    renderedMenuId: string,
    public readonly video: InputFile | string,
    menuKeyboard: MenuButton<C>[][],
    inlineKeyboard: InlineKeyboardButton[][],
  ) {
    super(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);
  }
}
