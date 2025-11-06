import type { Context, InlineKeyboardButton } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { BaseMenu } from "./base.ts";

/**
 * Menu represents a rendered menu that carries no media.
 * The optional text payload is forwarded when present, but a Menu can also be purely keyboard-only.
 *
 * @template C The grammY Context type
 */
export class Menu<C extends Context> extends BaseMenu<C> {
  readonly kind = "text" as const;

  /**
   * Creates a new Menu instance.
   *
   * @param templateMenuId Identifier of the template the menu was rendered from
   * @param renderedMenuId Unique identifier for this rendered menu instance
   * @param menuKeyboard Two-dimensional array of full button metadata for callback routing
   * @param inlineKeyboard Inline keyboard layout that will be sent to Telegram
   * @param text Optional text payload that accompanies the keyboard
   */
  constructor(
    templateMenuId: string,
    renderedMenuId: string,
    menuKeyboard: MenuButton<C>[][],
    inlineKeyboard: InlineKeyboardButton[][],
    public readonly text?: string,
  ) {
    super(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);
  }
}
