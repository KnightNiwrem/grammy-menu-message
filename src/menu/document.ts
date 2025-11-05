import type { Context, InlineKeyboardButton, InputFile } from "../dep.ts";
import type { MenuButton } from "../types.ts";

import { BaseMenu } from "./base.ts";

/**
 * DocumentMenu represents a rendered document menu with document media.
 *
 * @template C The grammY Context type
 */
export class DocumentMenu<C extends Context> extends BaseMenu<C> {
  readonly kind = "document" as const;

  /**
   * Creates a new DocumentMenu instance.
   *
   * @param templateMenuId Unique identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @param document The document file as InputFile or URL string
   * @param menuKeyboard 2D array of button objects with full handler information for internal use
   * @param inlineKeyboard The inline keyboard button layout for Telegram API compatibility
   */
  constructor(
    templateMenuId: string,
    renderedMenuId: string,
    public readonly document: InputFile | string,
    menuKeyboard: MenuButton<C>[][],
    inlineKeyboard: InlineKeyboardButton[][],
  ) {
    super(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);
  }
}
