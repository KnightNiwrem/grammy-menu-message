import type { InlineKeyboardButton } from "grammy/types";
import { Menu } from "./menu.ts";

/**
 * MenuTemplate defines the structure of a menu using a builder pattern.
 * It provides methods to add callback buttons and organize them into rows.
 */
export class MenuTemplate {
  private rows: InlineKeyboardButton[][] = [];
  private currentRow: InlineKeyboardButton[] = [];

  /**
   * Adds a callback button to the current row.
   * @param label The text displayed on the button
   * @param callbackData The callback data sent when the button is pressed
   * @returns this for method chaining
   */
  rawCb(label: string, callbackData: string): this {
    this.currentRow.push({
      text: label,
      callback_data: callbackData,
    });
    return this;
  }

  /**
   * Finalizes the current row and starts a new one.
   * @returns this for method chaining
   */
  row(): this {
    if (this.currentRow.length > 0) {
      this.rows.push(this.currentRow);
      this.currentRow = [];
    }
    return this;
  }

  /**
   * Renders the template into a Menu with the configured inline keyboard.
   * @returns A Menu instance with the configured buttons
   */
  render(): Menu {
    const finalRows = [...this.rows];
    if (this.currentRow.length > 0) {
      finalRows.push(this.currentRow);
    }
    return new Menu(finalRows);
  }
}
