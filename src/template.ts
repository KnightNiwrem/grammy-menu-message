import type {
  Context,
  CopyTextButton,
  InlineKeyboardButton,
  LoginUrl,
  SwitchInlineQueryChosenChat,
  WebAppInfo,
} from "./dep.ts";
import type { MenuButton, MenuButtonHandler } from "./types.ts";

import { Menu } from "./menu.ts";

type Operation<C extends Context> =
  | { type: "nativeButton"; data: InlineKeyboardButton }
  | { type: "menuButton"; label: string; handler: MenuButtonHandler<C>; payload?: string }
  | { type: "row" };

/**
 * Options for text formatting in messages.
 */
export interface TextOptions {
  /** Text content or caption for media messages */
  text?: string;
  /** Parse mode for formatting (e.g., "Markdown", "HTML") */
  parseMode?: string;
  /** Special entities like bold, italic, mentions, etc. */
  entities?: unknown[];
}

/**
 * Message payload types for menus.
 * Only includes message types that support inline keyboards with text/media content.
 */
export type MessagePayload =
  | { type: "text" } & TextOptions
  | { type: "photo"; photo: string } & TextOptions
  | { type: "video"; video: string } & TextOptions
  | { type: "animation"; animation: string } & TextOptions
  | { type: "audio"; audio: string } & TextOptions
  | { type: "document"; document: string } & TextOptions
  | { type: "voice"; voice: string } & TextOptions;

/**
 * BaseMenuTemplate defines the common structure and button methods for all menu templates.
 * This is the base class that provides button operations without any message type specifics.
 *
 * @template C The grammY Context type
 */
export abstract class BaseMenuTemplate<C extends Context> {
  protected operations: Operation<C>[] = [];

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
   * Helper method to build the inline keyboard and menu keyboard from operations.
   * Used by subclasses in their render() implementations.
   *
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns An object containing the inline keyboard and menu keyboard arrays
   */
  protected buildKeyboards(renderedMenuId: string): {
    inlineKeyboard: InlineKeyboardButton[][];
    menuKeyboard: MenuButton<C>[][];
  } {
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

    return { inlineKeyboard, menuKeyboard };
  }

  /**
   * Renders the template into a Menu with a fresh inline keyboard instance.
   * Each render produces a unique Menu with automatically generated callback data
   * based on button positions within the keyboard grid.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A Menu instance with newly constructed button arrays
   */
  abstract render(templateMenuId: string, renderedMenuId: string): Menu<C>;
}

/**
 * TextMenuTemplate defines a menu with optional text message.
 * This template supports adding media attachments via methods like .photo(), .video(), etc.
 * which return specialized media template types.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const template = new TextMenuTemplate<Context>("Choose an option:")
 *   .cb("Option 1", async (ctx) => { await ctx.answerCallbackQuery("1"); })
 *   .cb("Option 2", async (ctx) => { await ctx.answerCallbackQuery("2"); })
 *   .row()
 *   .url("Visit Website", "https://example.com");
 * ```
 */
export class TextMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  messageText: string | undefined;

  /**
   * Creates a new TextMenuTemplate instance.
   *
   * @param messageText Optional text that will be used to override sent message text payload in MenuRegistry's transformer
   */
  constructor(messageText?: string) {
    super();
    this.messageText = messageText;
  }

  /**
   * Sets the messageText field and returns this for method chaining.
   *
   * @param messageText The text to set, or undefined to clear it
   * @returns this for method chaining
   */
  text(messageText: string | undefined): this {
    this.messageText = messageText;
    return this;
  }

  /**
   * Attaches a photo to this menu and returns a PhotoMenuTemplate.
   * The returned template can still have buttons added but cannot have other media attached.
   *
   * @param photo Photo to send (file_id, HTTP URL, or file path)
   * @param options Optional text options (caption, parse mode, entities)
   * @returns A PhotoMenuTemplate with the photo attached
   */
  photo(photo: string, options?: TextOptions): PhotoMenuTemplate<C> {
    return new PhotoMenuTemplate<C>([...this.operations], photo, options);
  }

  /**
   * Attaches a video to this menu and returns a VideoMenuTemplate.
   *
   * @param video Video to send (file_id, HTTP URL, or file path)
   * @param options Optional text options (caption, parse mode, entities)
   * @returns A VideoMenuTemplate with the video attached
   */
  video(video: string, options?: TextOptions): VideoMenuTemplate<C> {
    return new VideoMenuTemplate<C>([...this.operations], video, options);
  }

  /**
   * Attaches an animation to this menu and returns an AnimationMenuTemplate.
   *
   * @param animation Animation to send (file_id, HTTP URL, or file path)
   * @param options Optional text options (caption, parse mode, entities)
   * @returns An AnimationMenuTemplate with the animation attached
   */
  animation(animation: string, options?: TextOptions): AnimationMenuTemplate<C> {
    return new AnimationMenuTemplate<C>([...this.operations], animation, options);
  }

  /**
   * Attaches audio to this menu and returns an AudioMenuTemplate.
   *
   * @param audio Audio file to send (file_id, HTTP URL, or file path)
   * @param options Optional text options (caption, parse mode, entities)
   * @returns An AudioMenuTemplate with the audio attached
   */
  audio(audio: string, options?: TextOptions): AudioMenuTemplate<C> {
    return new AudioMenuTemplate<C>([...this.operations], audio, options);
  }

  /**
   * Attaches a document to this menu and returns a DocumentMenuTemplate.
   *
   * @param document Document to send (file_id, HTTP URL, or file path)
   * @param options Optional text options (caption, parse mode, entities)
   * @returns A DocumentMenuTemplate with the document attached
   */
  document(document: string, options?: TextOptions): DocumentMenuTemplate<C> {
    return new DocumentMenuTemplate<C>([...this.operations], document, options);
  }

  /**
   * Attaches a voice message to this menu and returns a VoiceMenuTemplate.
   *
   * @param voice Voice message to send (file_id, HTTP URL, or file path)
   * @param options Optional text options (caption, parse mode, entities)
   * @returns A VoiceMenuTemplate with the voice message attached
   */
  voice(voice: string, options?: TextOptions): VoiceMenuTemplate<C> {
    return new VoiceMenuTemplate<C>([...this.operations], voice, options);
  }

  /**
   * Renders the template into a Menu with text message payload.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A Menu instance with text payload
   */
  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "text",
      text: this.messageText,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * PhotoMenuTemplate represents a menu with an attached photo.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class PhotoMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private photo: string,
    private textOptions?: TextOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "photo",
      photo: this.photo,
      ...this.textOptions,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * VideoMenuTemplate represents a menu with an attached video.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class VideoMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private video: string,
    private textOptions?: TextOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "video",
      video: this.video,
      ...this.textOptions,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * AnimationMenuTemplate represents a menu with an attached animation.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class AnimationMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private animation: string,
    private textOptions?: TextOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "animation",
      animation: this.animation,
      ...this.textOptions,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * AudioMenuTemplate represents a menu with an attached audio file.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class AudioMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private audio: string,
    private textOptions?: TextOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "audio",
      audio: this.audio,
      ...this.textOptions,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * DocumentMenuTemplate represents a menu with an attached document.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class DocumentMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private document: string,
    private textOptions?: TextOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "document",
      document: this.document,
      ...this.textOptions,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * VoiceMenuTemplate represents a menu with an attached voice message.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class VoiceMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private voice: string,
    private textOptions?: TextOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "voice",
      voice: this.voice,
      ...this.textOptions,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}
