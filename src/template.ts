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
 * Options for photo messages.
 */
export interface PhotoOptions {
  caption?: string;
  parseMode?: string;
  captionEntities?: unknown[];
  showCaptionAboveMedia?: boolean;
  hasSpoiler?: boolean;
}

/**
 * Options for video messages.
 */
export interface VideoOptions {
  caption?: string;
  parseMode?: string;
  captionEntities?: unknown[];
  showCaptionAboveMedia?: boolean;
  hasSpoiler?: boolean;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  supportsStreaming?: boolean;
}

/**
 * Options for animation messages.
 */
export interface AnimationOptions {
  caption?: string;
  parseMode?: string;
  captionEntities?: unknown[];
  showCaptionAboveMedia?: boolean;
  hasSpoiler?: boolean;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
}

/**
 * Options for audio messages.
 */
export interface AudioOptions {
  caption?: string;
  parseMode?: string;
  captionEntities?: unknown[];
  duration?: number;
  performer?: string;
  title?: string;
  thumbnail?: string;
}

/**
 * Options for document messages.
 */
export interface DocumentOptions {
  caption?: string;
  parseMode?: string;
  captionEntities?: unknown[];
  thumbnail?: string;
  disableContentTypeDetection?: boolean;
}

/**
 * Options for voice messages.
 */
export interface VoiceOptions {
  caption?: string;
  parseMode?: string;
  captionEntities?: unknown[];
  duration?: number;
}

/**
 * Options for location messages.
 */
export interface LocationOptions {
  horizontalAccuracy?: number;
  livePeriod?: number;
  heading?: number;
  proximityAlertRadius?: number;
}

/**
 * Options for venue messages.
 */
export interface VenueOptions {
  foursquareId?: string;
  foursquareType?: string;
  googlePlaceId?: string;
  googlePlaceType?: string;
}

/**
 * Options for contact messages.
 */
export interface ContactOptions {
  lastName?: string;
  vcard?: string;
}

/**
 * Options for poll messages.
 */
export interface PollOptions {
  isAnonymous?: boolean;
  type?: "quiz" | "regular";
  allowsMultipleAnswers?: boolean;
  correctOptionId?: number;
  explanation?: string;
  explanationParseMode?: string;
  explanationEntities?: unknown[];
  openPeriod?: number;
  closeDate?: number;
  isClosed?: boolean;
}

/**
 * Message payload types for different Telegram message types.
 */
export type MessagePayload =
  | { type: "text"; text?: string }
  | { type: "photo"; photo: string; options?: PhotoOptions }
  | { type: "video"; video: string; options?: VideoOptions }
  | { type: "animation"; animation: string; options?: AnimationOptions }
  | { type: "audio"; audio: string; options?: AudioOptions }
  | { type: "document"; document: string; options?: DocumentOptions }
  | { type: "voice"; voice: string; options?: VoiceOptions }
  | { type: "location"; latitude: number; longitude: number; options?: LocationOptions }
  | {
    type: "venue";
    latitude: number;
    longitude: number;
    title: string;
    address: string;
    options?: VenueOptions;
  }
  | { type: "contact"; phoneNumber: string; firstName: string; options?: ContactOptions }
  | { type: "poll"; question: string; pollOptions: string[]; options?: PollOptions };

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
   * @param options Optional photo-specific options (caption, parse mode, etc.)
   * @returns A PhotoMenuTemplate with the photo attached
   */
  photo(photo: string, options?: PhotoOptions): PhotoMenuTemplate<C> {
    return new PhotoMenuTemplate<C>([...this.operations], photo, options);
  }

  /**
   * Attaches a video to this menu and returns a VideoMenuTemplate.
   *
   * @param video Video to send (file_id, HTTP URL, or file path)
   * @param options Optional video-specific options
   * @returns A VideoMenuTemplate with the video attached
   */
  video(video: string, options?: VideoOptions): VideoMenuTemplate<C> {
    return new VideoMenuTemplate<C>([...this.operations], video, options);
  }

  /**
   * Attaches an animation to this menu and returns an AnimationMenuTemplate.
   *
   * @param animation Animation to send (file_id, HTTP URL, or file path)
   * @param options Optional animation-specific options
   * @returns An AnimationMenuTemplate with the animation attached
   */
  animation(animation: string, options?: AnimationOptions): AnimationMenuTemplate<C> {
    return new AnimationMenuTemplate<C>([...this.operations], animation, options);
  }

  /**
   * Attaches audio to this menu and returns an AudioMenuTemplate.
   *
   * @param audio Audio file to send (file_id, HTTP URL, or file path)
   * @param options Optional audio-specific options
   * @returns An AudioMenuTemplate with the audio attached
   */
  audio(audio: string, options?: AudioOptions): AudioMenuTemplate<C> {
    return new AudioMenuTemplate<C>([...this.operations], audio, options);
  }

  /**
   * Attaches a document to this menu and returns a DocumentMenuTemplate.
   *
   * @param document Document to send (file_id, HTTP URL, or file path)
   * @param options Optional document-specific options
   * @returns A DocumentMenuTemplate with the document attached
   */
  document(document: string, options?: DocumentOptions): DocumentMenuTemplate<C> {
    return new DocumentMenuTemplate<C>([...this.operations], document, options);
  }

  /**
   * Attaches a voice message to this menu and returns a VoiceMenuTemplate.
   *
   * @param voice Voice message to send (file_id, HTTP URL, or file path)
   * @param options Optional voice-specific options
   * @returns A VoiceMenuTemplate with the voice message attached
   */
  voice(voice: string, options?: VoiceOptions): VoiceMenuTemplate<C> {
    return new VoiceMenuTemplate<C>([...this.operations], voice, options);
  }

  /**
   * Attaches a location to this menu and returns a LocationMenuTemplate.
   *
   * @param latitude Latitude of the location
   * @param longitude Longitude of the location
   * @param options Optional location-specific options
   * @returns A LocationMenuTemplate with the location attached
   */
  location(latitude: number, longitude: number, options?: LocationOptions): LocationMenuTemplate<C> {
    return new LocationMenuTemplate<C>([...this.operations], latitude, longitude, options);
  }

  /**
   * Attaches a venue to this menu and returns a VenueMenuTemplate.
   *
   * @param latitude Latitude of the venue
   * @param longitude Longitude of the venue
   * @param title Name of the venue
   * @param address Address of the venue
   * @param options Optional venue-specific options
   * @returns A VenueMenuTemplate with the venue attached
   */
  venue(
    latitude: number,
    longitude: number,
    title: string,
    address: string,
    options?: VenueOptions,
  ): VenueMenuTemplate<C> {
    return new VenueMenuTemplate<C>([...this.operations], latitude, longitude, title, address, options);
  }

  /**
   * Attaches a contact to this menu and returns a ContactMenuTemplate.
   *
   * @param phoneNumber Contact's phone number
   * @param firstName Contact's first name
   * @param options Optional contact-specific options
   * @returns A ContactMenuTemplate with the contact attached
   */
  contact(phoneNumber: string, firstName: string, options?: ContactOptions): ContactMenuTemplate<C> {
    return new ContactMenuTemplate<C>([...this.operations], phoneNumber, firstName, options);
  }

  /**
   * Attaches a poll to this menu and returns a PollMenuTemplate.
   *
   * @param question Poll question
   * @param pollOptions List of answer options (2-10 strings)
   * @param options Optional poll-specific options
   * @returns A PollMenuTemplate with the poll attached
   */
  poll(question: string, pollOptions: string[], options?: PollOptions): PollMenuTemplate<C> {
    return new PollMenuTemplate<C>([...this.operations], question, pollOptions, options);
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
    const payload: MessagePayload = { type: "text", text: this.messageText };
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
    private options?: PhotoOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = { type: "photo", photo: this.photo, options: this.options };
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
    private options?: VideoOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = { type: "video", video: this.video, options: this.options };
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
    private options?: AnimationOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = { type: "animation", animation: this.animation, options: this.options };
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
    private options?: AudioOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = { type: "audio", audio: this.audio, options: this.options };
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
    private options?: DocumentOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = { type: "document", document: this.document, options: this.options };
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
    private options?: VoiceOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = { type: "voice", voice: this.voice, options: this.options };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * LocationMenuTemplate represents a menu with an attached location.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class LocationMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private latitude: number,
    private longitude: number,
    private options?: LocationOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "location",
      latitude: this.latitude,
      longitude: this.longitude,
      options: this.options,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * VenueMenuTemplate represents a menu with an attached venue.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class VenueMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private latitude: number,
    private longitude: number,
    private title: string,
    private address: string,
    private options?: VenueOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "venue",
      latitude: this.latitude,
      longitude: this.longitude,
      title: this.title,
      address: this.address,
      options: this.options,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * ContactMenuTemplate represents a menu with an attached contact.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class ContactMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private phoneNumber: string,
    private firstName: string,
    private options?: ContactOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "contact",
      phoneNumber: this.phoneNumber,
      firstName: this.firstName,
      options: this.options,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}

/**
 * PollMenuTemplate represents a menu with an attached poll.
 * This template type does not allow attaching additional media.
 *
 * @template C The grammY Context type
 */
export class PollMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  constructor(
    operations: Operation<C>[],
    private question: string,
    private pollOptions: string[],
    private options?: PollOptions,
  ) {
    super();
    this.operations = operations;
  }

  render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = this.buildKeyboards(renderedMenuId);
    const payload: MessagePayload = {
      type: "poll",
      question: this.question,
      pollOptions: this.pollOptions,
      options: this.options,
    };
    return new Menu(templateMenuId, renderedMenuId, payload, menuKeyboard, inlineKeyboard);
  }
}
