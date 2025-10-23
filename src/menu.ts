import type { Context, MiddlewareFn } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";

/**
 * Callback function for menu button clicks.
 */
export type MenuButtonCallback<C extends Context = Context> = (
  ctx: C,
) => void | Promise<void>;

/**
 * A button in the menu with its label and callback handler.
 */
interface MenuButton<C extends Context = Context> {
  label: string;
  callback: MenuButtonCallback<C>;
}

/**
 * Menu class for creating inline keyboard menus with automatic callback_data management.
 *
 * The Menu class provides a simple API for building Telegram inline keyboards:
 * - Add buttons with labels and callback functions
 * - Organize buttons into rows
 * - Automatically generates callback_data in the format: `<menu_id>:<row>:<column>`
 * - Provides middleware to handle button clicks
 *
 * Example usage:
 * ```ts
 * import { Bot } from "grammy";
 * import { Menu } from "./menu.ts";
 *
 * const bot = new Bot("YOUR_BOT_TOKEN");
 *
 * const menu = new Menu("main");
 *
 * // Add buttons to the first row
 * menu.text("Option 1", (ctx) => ctx.reply("You chose option 1"));
 * menu.text("Option 2", (ctx) => ctx.reply("You chose option 2"));
 *
 * // Start a new row
 * menu.row();
 *
 * // Add buttons to the second row
 * menu.text("Back", (ctx) => ctx.reply("Going back..."));
 *
 * // Register the menu middleware
 * bot.use(menu.middleware());
 *
 * // Send the menu
 * bot.command("start", (ctx) => {
 *   ctx.reply("Choose an option:", {
 *     reply_markup: { inline_keyboard: menu.inline_keyboard }
 *   });
 * });
 * ```
 */
export class Menu<C extends Context = Context> {
  private readonly id: string;
  private readonly buttons: MenuButton<C>[][] = [[]];
  private currentRow = 0;

  /**
   * Creates a new Menu instance.
   *
   * @param id A unique identifier for this menu. Used to generate callback_data.
   */
  constructor(id: string) {
    this.id = id;
  }

  /**
   * Adds a text button to the current row.
   *
   * @param label The button label displayed to the user
   * @param callback The function to call when the button is clicked
   * @returns This menu instance for chaining
   */
  text(label: string, callback: MenuButtonCallback<C>): this {
    this.buttons[this.currentRow].push({ label, callback });
    return this;
  }

  /**
   * Starts a new row of buttons.
   *
   * @returns This menu instance for chaining
   */
  row(): this {
    this.currentRow++;
    this.buttons[this.currentRow] = [];
    return this;
  }

  /**
   * Gets the inline keyboard structure ready to be used with Telegram API.
   *
   * Returns a 2D array of InlineKeyboardButton objects with automatically
   * generated callback_data in the format: `<menu_id>:<row>:<column>`
   */
  get inline_keyboard(): InlineKeyboardButton[][] {
    return this.buttons.map((row, rowIndex) =>
      row.map((button, colIndex) => ({
        text: button.label,
        callback_data: `${this.id}:${rowIndex}:${colIndex}`,
      }))
    );
  }

  /**
   * Creates middleware that handles callback queries for this menu.
   *
   * The middleware intercepts callback queries that match this menu's ID,
   * parses the row and column from the callback_data, and invokes the
   * corresponding button's callback function.
   *
   * @returns Middleware function to handle this menu's callbacks
   */
  middleware(): MiddlewareFn<C> {
    return async (ctx, next) => {
      const callbackQuery = ctx.callbackQuery;

      if (!callbackQuery || !callbackQuery.data) {
        return next();
      }

      const data = callbackQuery.data;
      const parts = data.split(":");

      // Check if this callback is for this menu
      if (parts.length !== 3 || parts[0] !== this.id) {
        return next();
      }

      const row = parseInt(parts[1], 10);
      const col = parseInt(parts[2], 10);

      // Validate row and column
      if (
        isNaN(row) || isNaN(col) ||
        row < 0 || row >= this.buttons.length ||
        col < 0 || col >= this.buttons[row].length
      ) {
        return next();
      }

      // Get the button and invoke its callback
      const button = this.buttons[row][col];

      // Answer the callback query to remove loading state
      await ctx.answerCallbackQuery();

      // Invoke the button's callback
      await button.callback(ctx);

      // Don't call next() - we handled this callback
    };
  }
}
