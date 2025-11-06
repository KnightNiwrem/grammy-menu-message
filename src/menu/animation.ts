import type { Context, InlineKeyboardButton, InputFile } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { BaseMenu } from "./base.ts";

/**
 * AnimationMenu represents a rendered menu that sends an animation with optional text.
 *
 * @template C The grammY Context type
 */
export class AnimationMenu<C extends Context> extends BaseMenu<C> {
  readonly kind = "animation" as const;

  /**
   * Creates a new AnimationMenu instance.
   *
   * @param templateMenuId Identifier of the template the menu was rendered from
   * @param renderedMenuId Unique identifier for this rendered menu instance
   * @param menuKeyboard Two-dimensional array of full button metadata for callback routing
   * @param inlineKeyboard Inline keyboard layout that will be sent to Telegram
   * @param animation Animation file or URL that Telegram will deliver with the menu
   * @param text Optional caption text to accompany the animation
   */
  constructor(
    templateMenuId: string,
    renderedMenuId: string,
    menuKeyboard: MenuButton<C>[][],
    inlineKeyboard: InlineKeyboardButton[][],
    public readonly animation: InputFile | string,
    public readonly text?: string,
  ) {
    super(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);
  }
}
