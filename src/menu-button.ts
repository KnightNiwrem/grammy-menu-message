import type { Context, InlineKeyboardButton, NextFunction } from "./dep.deno.ts";

/**
 * Handler function for menu button callbacks.
 * Invoked by the MenuRegistry middleware when a menu button is pressed.
 *
 * @template C The grammY Context type
 * @param ctx The grammY context object for the callback query
 * @param next Function to pass control to the next middleware in the chain
 * @param payload Optional data passed from the button definition (reserved for future use)
 * @returns A Promise that resolves when the handler completes, or void for synchronous handlers
 */
export type MenuButtonHandler<C extends Context> = (
  ctx: C,
  next: NextFunction,
  payload?: string,
) => Promise<void> | void;

/**
 * Represents a callback button with an optional handler function and payload.
 * Extends InlineKeyboardButton to include middleware capabilities for menu buttons
 * created via MenuTemplate.cb(), while allowing native button types from other methods.
 *
 * @template C The grammY Context type
 */
export type MenuButton<C extends Context> =
  | InlineKeyboardButton
  | (InlineKeyboardButton.CallbackButton & {
    handler: MenuButtonHandler<C>;
    payload?: string;
  });
