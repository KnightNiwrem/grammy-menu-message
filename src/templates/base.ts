import type {
  Context,
  CopyTextButton,
  InlineKeyboardButton,
  LoginUrl,
  SwitchInlineQueryChosenChat,
  WebAppInfo,
} from "../dep.ts";
import type { MenuButton, MenuButtonHandler } from "../types.ts";

import { BaseMenu } from "../menu/base.ts";
import { TextMenu } from "../menu/text.ts";

type Operation<C extends Context> =
  | { type: "nativeButton"; data: InlineKeyboardButton }
  | { type: "menuButton"; label: string; handler: MenuButtonHandler<C>; payload?: string }
  | { type: "row" };

/**
 * BaseMenuTemplate is the abstract builder backing every menu template.
 * Subclasses compose inline keyboards declaratively and later render them into
 * concrete menu objects with fresh callback payloads on each invocation.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const template = new TextMenuTemplate<Context>()
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .cb("Option 2", async (ctx) => ctx.answerCallbackQuery("2"))
 *   .row()
 *   .url("Visit Website", "https://example.com");
 * ```
 */
export abstract class BaseMenuTemplate<C extends Context> {
  private operations: Operation<C>[] = [];
  /** Optional text payload that accompanies the rendered menu */
  text?: string;

  /**
   * Creates a new BaseMenuTemplate instance.
   *
   * @param text Optional text or caption forwarded when the template renders a menu
   */
  constructor(text?: string) {
    this.text = text;
  }

  /**
   * Sets or replaces the optional message text that will accompany the menu.
   *
   * @param text The text to send alongside the rendered menu
   * @returns this for method chaining
   */
  addText(text: string): this {
    this.text = text;
    return this;
  }

  /**
   * Adds a raw callback button to the current row.
   * The callback_data is provided directly without middleware handling.
   * Useful when you want to handle callbacks outside of the menu system.
   *
   * @param label The text displayed on the button
   * @param callbackData The callback data sent when the button is pressed
   * @returns this for method chaining
   */
  rawCb(label: string, callbackData: string): this {
    this.operations.push({
      type: "nativeButton",
      data: { text: label, callback_data: callbackData },
    });
    return this;
  }

  /**
   * Adds a callback button with middleware handler to the current row.
   * The callback_data is generated automatically during render using the button's position.
   * The handler will be invoked by the MenuRegistry middleware when the button is pressed.
   *
   * @param label The text displayed on the button
   * @param handler The middleware function to handle the callback
   * @param payload Optional data passed to the handler (reserved for future use)
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * template.cb("Click me", async (ctx) => {
   *   await ctx.answerCallbackQuery("Button clicked!");
   * });
   * ```
   */
  cb(label: string, handler: MenuButtonHandler<C>, payload?: string): this {
    this.operations.push({
      type: "menuButton",
      label,
      handler,
      payload,
    });
    return this;
  }

  /**
   * Adds a URL button to the current row.
   * When pressed, opens the specified URL in the user's browser.
   *
   * @param text The text displayed on the button
   * @param url HTTP or tg:// URL to be opened when the button is pressed
   * @returns this for method chaining
   */
  url(text: string, url: string): this {
    this.operations.push({
      type: "nativeButton",
      data: { text, url },
    });
    return this;
  }

  /**
   * Adds a web app button to the current row.
   * When pressed, opens the specified Web App with additional data.
   *
   * @param text The text displayed on the button
   * @param url An HTTPS URL of a Web App, or a WebAppInfo object
   * @returns this for method chaining
   */
  webApp(text: string, url: string | WebAppInfo): this {
    this.operations.push({
      type: "nativeButton",
      data: {
        text,
        web_app: typeof url === "string" ? { url } : url,
      },
    });
    return this;
  }

  /**
   * Adds a login button to the current row.
   * Used for Telegram Login Widget integration.
   *
   * @param text The text displayed on the button
   * @param loginUrl The login URL as string or LoginUrl object with additional parameters
   * @returns this for method chaining
   */
  login(text: string, loginUrl: string | LoginUrl): this {
    this.operations.push({
      type: "nativeButton",
      data: {
        text,
        login_url: typeof loginUrl === "string" ? { url: loginUrl } : loginUrl,
      },
    });
    return this;
  }

  /**
   * Adds an inline query button to the current row.
   * Pressing the button prompts the user to select a chat and inserts the bot's username with the query.
   *
   * @param text The text displayed on the button
   * @param query The optional inline query string to prefill (defaults to empty string)
   * @returns this for method chaining
   */
  switchInline(text: string, query = ""): this {
    this.operations.push({
      type: "nativeButton",
      data: { text, switch_inline_query: query },
    });
    return this;
  }

  /**
   * Adds an inline query button for the current chat to the current row.
   * Pressing the button inserts the bot's username and query in the current chat's input field.
   *
   * @param text The text displayed on the button
   * @param query The optional inline query string to prefill (defaults to empty string)
   * @returns this for method chaining
   */
  switchInlineCurrent(text: string, query = ""): this {
    this.operations.push({
      type: "nativeButton",
      data: { text, switch_inline_query_current_chat: query },
    });
    return this;
  }

  /**
   * Adds an inline query button with chosen chat filter to the current row.
   * Allows the user to choose from specific chat types when selecting where to insert the query.
   *
   * @param text The text displayed on the button
   * @param query The query object describing which chats can be picked (defaults to empty object)
   * @returns this for method chaining
   */
  switchInlineChosen(text: string, query: SwitchInlineQueryChosenChat = {}): this {
    this.operations.push({
      type: "nativeButton",
      data: { text, switch_inline_query_chosen_chat: query },
    });
    return this;
  }

  /**
   * Adds a copy text button to the current row.
   * Pressing the button copies the specified text to the user's clipboard.
   *
   * @param text The text displayed on the button
   * @param copyText The text to be copied to the clipboard, or a CopyTextButton object
   * @returns this for method chaining
   */
  copyText(text: string, copyText: string | CopyTextButton): this {
    this.operations.push({
      type: "nativeButton",
      data: { text, copy_text: typeof copyText === "string" ? { text: copyText } : copyText },
    });
    return this;
  }

  /**
   * Adds a game button to the current row.
   * This type of button must always be the first button in the first row.
   * @param text The text displayed on the button
   * @returns this for method chaining
   */
  game(text: string): this {
    this.operations.push({
      type: "nativeButton",
      data: { text, callback_game: {} },
    });
    return this;
  }

  /**
   * Adds a payment button to the current row.
   * This type of button must always be the first button in the first row and
   * can only be used in invoice messages.
   * @param text The text displayed on the button
   * @returns this for method chaining
   */
  pay(text: string): this {
    this.operations.push({
      type: "nativeButton",
      data: { text, pay: true },
    });
    return this;
  }

  /**
   * Finalizes the current row and starts a new one.
   * Call this method to move subsequent buttons to a new row in the keyboard.
   *
   * @returns this for method chaining
   */
  row(): this {
    this.operations.push({ type: "row" });
    return this;
  }

  /**
   * Renders the template into a Menu with a fresh inline keyboard instance.
  * Each render produces a unique Menu with automatically generated callback data
  * based on button positions within the keyboard grid.
  * The base implementation emits a TextMenu; media templates override this to
  * attach their respective payloads while reusing the keyboard metadata.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
  * @returns A rendered TextMenu carrying the constructed keyboards
   */
  render(templateMenuId: string, renderedMenuId: string): BaseMenu<C> {
    const inlineKeyboard: InlineKeyboardButton[][] = [];
    const menuKeyboard: MenuButton<C>[][] = [];
    let inlineRow: InlineKeyboardButton[] = [];
    let menuRow: MenuButton<C>[] = [];

    for (const op of this.operations) {
      if (op.type === "nativeButton") {
        inlineRow.push(op.data);
        menuRow.push(op.data);
      } else if (op.type === "menuButton") {
        const row = inlineKeyboard.length;
        const col = inlineRow.length;
        const callbackData = `${renderedMenuId}:${row}:${col}`;
        const inlineButton: InlineKeyboardButton = {
          text: op.label,
          callback_data: callbackData,
        };
        inlineRow.push(inlineButton);
        const menuButton: MenuButton<C> = {
          ...inlineButton,
          handler: op.handler,
          payload: op.payload,
        };
        menuRow.push(menuButton);
      } else if (op.type === "row") {
        if (inlineRow.length > 0) {
          inlineKeyboard.push(inlineRow);
          menuKeyboard.push(menuRow);
          inlineRow = [];
          menuRow = [];
        }
      }
    }

    if (inlineRow.length > 0) {
      inlineKeyboard.push(inlineRow);
      menuKeyboard.push(menuRow);
    }

    return new TextMenu(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard, this.text);
  }
}
