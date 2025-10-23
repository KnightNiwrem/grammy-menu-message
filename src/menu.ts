import type { InlineKeyboard as IInlineKeyboard } from "grammy";
import { InlineKeyboard } from "grammy";

/**
 * Callback function type for menu buttons.
 * Receives the callback_data as a parameter.
 */
export type MenuCallback = (data: string) => void | Promise<void>;

/**
 * Menu class that wraps grammY's InlineKeyboard with callback support.
 *
 * This class maintains an InlineKeyboard instance and a mapping of
 * self-generated callback_data to user-provided callback functions.
 * It exposes the same methods as InlineKeyboard for adding buttons and rows.
 */
export class Menu {
  private keyboard: InlineKeyboard;
  private callbackMap: Map<string, MenuCallback>;
  private callbackCounter: number;

  constructor() {
    this.keyboard = new InlineKeyboard();
    this.callbackMap = new Map();
    this.callbackCounter = 0;
  }

  /**
   * Add a text button with a callback function.
   * Instead of callback_data, accepts a callback function.
   *
   * @param text - The button text
   * @param callback - The function to execute when button is pressed
   * @returns This Menu instance for chaining
   */
  text(text: string, callback: MenuCallback): this {
    const callbackData = this.generateCallbackData();
    this.callbackMap.set(callbackData, callback);
    this.keyboard.text(text, callbackData);
    return this;
  }

  /**
   * Add a URL button.
   *
   * @param text - The button text
   * @param url - The URL to open
   * @returns This Menu instance for chaining
   */
  url(text: string, url: string): this {
    this.keyboard.url(text, url);
    return this;
  }

  /**
   * Add a web app button.
   *
   * @param text - The button text
   * @param url - The web app URL
   * @returns This Menu instance for chaining
   */
  webApp(text: string, url: string): this {
    this.keyboard.webApp(text, url);
    return this;
  }

  /**
   * Add a login button.
   *
   * @param text - The button text
   * @param url - The login URL
   * @returns This Menu instance for chaining
   */
  login(text: string, url: string): this {
    this.keyboard.login(text, url);
    return this;
  }

  /**
   * Add a switch inline button.
   *
   * @param text - The button text
   * @param query - The inline query
   * @returns This Menu instance for chaining
   */
  switchInline(text: string, query?: string): this {
    this.keyboard.switchInline(text, query);
    return this;
  }

  /**
   * Add a switch inline current button.
   *
   * @param text - The button text
   * @param query - The inline query
   * @returns This Menu instance for chaining
   */
  switchInlineCurrent(text: string, query?: string): this {
    this.keyboard.switchInlineCurrent(text, query);
    return this;
  }

  /**
   * Add a switch inline chosen button.
   *
   * @param text - The button text
   * @param query - The query configuration object
   * @returns This Menu instance for chaining
   */
  switchInlineChosen(
    text: string,
    query?: {
      allow_user_chats?: boolean;
      allow_bot_chats?: boolean;
      allow_group_chats?: boolean;
      allow_channel_chats?: boolean;
    },
  ): this {
    this.keyboard.switchInlineChosen(text, query);
    return this;
  }

  /**
   * Add a copy text button.
   *
   * @param text - The button text
   * @param copyText - The text to copy
   * @returns This Menu instance for chaining
   */
  copyText(text: string, copyText: string): this {
    this.keyboard.copyText(text, copyText);
    return this;
  }

  /**
   * Add a game button.
   *
   * @param text - The button text
   * @returns This Menu instance for chaining
   */
  game(text: string): this {
    this.keyboard.game(text);
    return this;
  }

  /**
   * Add a pay button.
   *
   * @param text - The button text
   * @returns This Menu instance for chaining
   */
  pay(text: string): this {
    this.keyboard.pay(text);
    return this;
  }

  /**
   * Start a new row for buttons.
   *
   * @returns This Menu instance for chaining
   */
  row(): this {
    this.keyboard.row();
    return this;
  }

  /**
   * Add another Menu to this Menu.
   *
   * @param other - The Menu to append
   * @returns This Menu instance for chaining
   */
  append(other: Menu): this {
    this.keyboard.append(other.keyboard);
    // Merge callback maps
    for (const [key, callback] of other.callbackMap) {
      this.callbackMap.set(key, callback);
    }
    return this;
  }

  /**
   * Create a clone of this Menu.
   *
   * @returns A new Menu instance with the same keyboard and callbacks
   */
  clone(): Menu {
    const cloned = new Menu();
    cloned.keyboard = this.keyboard.clone();
    cloned.callbackMap = new Map(this.callbackMap);
    cloned.callbackCounter = this.callbackCounter;
    return cloned;
  }

  /**
   * Get the underlying InlineKeyboard instance.
   *
   * @returns The InlineKeyboard instance
   */
  getKeyboard(): IInlineKeyboard {
    return this.keyboard;
  }

  /**
   * Get the callback mapping.
   *
   * @returns The Map of callback_data to callback functions
   */
  getCallbackMap(): Map<string, MenuCallback> {
    return this.callbackMap;
  }

  /**
   * Get a callback function by its callback_data.
   *
   * @param callbackData - The callback data to look up
   * @returns The callback function or undefined if not found
   */
  getCallback(callbackData: string): MenuCallback | undefined {
    return this.callbackMap.get(callbackData);
  }

  /**
   * Generate a self-generated callback_data.
   * Currently uses a simple counter as placeholder.
   *
   * @returns A generated callback_data string
   */
  private generateCallbackData(): string {
    return `cb_${this.callbackCounter++}`;
  }
}
