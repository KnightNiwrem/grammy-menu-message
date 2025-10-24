import { Menu } from "./menu.ts";

type ButtonDef = { text: string; callback_data: string };
type RowDef = ButtonDef[];

/**
 * MenuTemplate defines the structure of a menu using a builder pattern.
 * It provides methods to add callback buttons and organize them into rows.
 * Objects are created fresh on each render() call.
 */
export class MenuTemplate {
  private operations: Array<{
    type: "button" | "row";
    data?: ButtonDef;
  }> = [];

  /**
   * Adds a callback button to the current row.
   * @param label The text displayed on the button
   * @param callbackData The callback data sent when the button is pressed
   * @returns this for method chaining
   */
  rawCb(label: string, callbackData: string): this {
    this.operations.push({
      type: "button",
      data: { text: label, callback_data: callbackData },
    });
    return this;
  }

  /**
   * Finalizes the current row and starts a new one.
   * @returns this for method chaining
   */
  row(): this {
    this.operations.push({ type: "row" });
    return this;
  }

  /**
   * Renders the template into a Menu with a fresh inline keyboard instance.
   * @returns A Menu instance with newly constructed buttons
   */
  render(): Menu {
    const rows: RowDef[] = [];
    let currentRow: RowDef = [];

    for (const op of this.operations) {
      if (op.type === "button" && op.data) {
        currentRow.push(op.data);
      } else if (op.type === "row") {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
      }
    }

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return new Menu(rows);
  }
}
