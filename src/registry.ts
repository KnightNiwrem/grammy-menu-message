import type { MiddlewareFn, StorageAdapter } from "./dep.ts";
import type { MenuTemplate } from "./template.ts";
import type { MenuNavigationHistoryRecord, NavigationHistoryData, RenderedMenuData } from "./types.ts";

import { Composer, Context, MemorySessionStorage, nanoid } from "./dep.ts";
import { Menu } from "./menu.ts";
import { isMessage } from "./typeguards/message.ts";
import { inlineNavStorageKey, regularNavStorageKey, renderedMenuStorageKey } from "./utils.ts";

/**
 * MenuRegistry manages registered menu templates and their rendered instances.
 * Provides middleware to handle menu callback queries and automatic persistence
 * of navigation history when storage adapters are configured.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const registry = new MenuRegistry<Context>();
 * const template = new MenuTemplate<Context>()
 *   .cb("Button", async (ctx) => {
 *     await ctx.answerCallbackQuery("Clicked!");
 *   })
 *   .row();
 * registry.register("main", template);
 * bot.use(registry.middleware());
 * ```
 */
export class MenuRegistry<C extends Context> {
  private templates: Map<string, MenuTemplate<C>> = new Map();
  private renderedMenus: Map<string, Menu<C>> = new Map();

  private composer: Composer<C>;

  private storageKeyPrefix: string;
  private menuStorage: StorageAdapter<RenderedMenuData>;
  private navigationStorage: StorageAdapter<NavigationHistoryData>;

  /**
   * Creates a new MenuRegistry instance.
   *
   * @param options Configuration options for the registry
   * @param options.menuStorage StorageAdapter for persisting rendered menu metadata (defaults to MemorySessionStorage)
   * @param options.navigationStorage StorageAdapter for persisting menu navigation history (defaults to MemorySessionStorage)
   * @param options.keyPrefix Optional prefix for storage keys (defaults to "menu-message")
   *
   * @example
   * ```typescript
   * // Using memory storage (default)
   * const registry = new MenuRegistry<Context>();
   *
   * // With custom storage adapters
   * const registry = new MenuRegistry<Context>({
   *   menuStorage: new RedisAdapter(),
   *   navigationStorage: new RedisAdapter(),
   *   keyPrefix: "mybot"
   * });
   * ```
   */
  constructor(options?: {
    keyPrefix?: string;
    menuStorage?: StorageAdapter<RenderedMenuData>;
    navigationStorage?: StorageAdapter<NavigationHistoryData>;
  }) {
    this.storageKeyPrefix = options?.keyPrefix ?? "menu-message";
    this.menuStorage = options?.menuStorage ?? new MemorySessionStorage<RenderedMenuData>();
    this.navigationStorage = options?.navigationStorage ?? new MemorySessionStorage<NavigationHistoryData>();

    this.composer = new Composer<C>();
    // The transformer needs to do the following:
    // 1. Whichever Menu that is sent must be added to menuStorage
    // 2. Whichever Menu that is sent, must be appended to navigationStorage
    // 3. Override the message text with the Menu's messageText
    this.composer.use(async (ctx, next) => {
      ctx.api.config.use(async (prev, method, payload, signal) => {
        if (!payload) {
          return prev(method, payload, signal);
        }

        const menusToStore: Menu<C>[] = [];

        // Handle top-level reply_markup
        if ("reply_markup" in payload && payload.reply_markup instanceof Menu) {
          const menu = payload.reply_markup;
          const inlineKeyboard = menu.inline_keyboard;
          payload = {
            ...payload,
            text: menu.messageText,
            reply_markup: { inline_keyboard: inlineKeyboard },
          };
          menusToStore.push(menu);
        }

        // Handle results array (e.g., answerInlineQuery)
        if ("results" in payload && Array.isArray(payload.results)) {
          payload.results = payload.results.map((result) => {
            if (
              result && typeof result === "object" && "reply_markup" in result && result.reply_markup instanceof Menu
            ) {
              const menu = result.reply_markup;
              const inlineKeyboard = menu.inline_keyboard;
              menusToStore.push(menu);
              return {
                ...result,
                message_text: menu.messageText,
                reply_markup: { inline_keyboard: inlineKeyboard },
              };
            }
            return result;
          });
        }

        if (menusToStore.length === 0) {
          return prev(method, payload, signal);
        }

        const response = await prev(method, payload, signal);
        if (!response.ok) {
          return response;
        }
        const result = response.result;
        const timestamp = Date.now();

        // Now that we have sent out the menus, we should store them in menuStorage
        for (const menu of menusToStore) {
          const key = renderedMenuStorageKey(this.storageKeyPrefix, menu.renderedMenuId);
          await this.menuStorage.write(key, { timestamp, templateMenuId: menu.templateMenuId });
          this.renderedMenus.set(menu.renderedMenuId, menu);
        }

        // Navigation implies sending/editing only 1 menu
        if (menusToStore.length !== 1) {
          return response;
        }
        const menu = menusToStore[0];

        // Determine navKeyId based on response to store to navigationStorage, if able
        let navKeyId: string | undefined;
        if (isMessage(result)) {
          navKeyId = regularNavStorageKey(this.storageKeyPrefix, result.chat.id, result.message_id);
        }
        if (result === true && "inline_message_id" in payload && !!payload.inline_message_id) {
          navKeyId = inlineNavStorageKey(this.storageKeyPrefix, payload.inline_message_id);
        }

        // Store new navigation history entry, if it is a navigation
        if (navKeyId) {
          const navigationStorageData = await this.navigationStorage.read(navKeyId) ??
            MenuRegistry.createEmptyNavigationHistory();
          const navHistory = navigationStorageData.navigationHistory;
          if (navHistory.length > 0 && navHistory[navHistory.length - 1].renderedMenuId !== menu.renderedMenuId) {
            const menuNavigationHistoryRecord: MenuNavigationHistoryRecord = {
              timestamp,
              renderedMenuId: menu.renderedMenuId,
              templateMenuId: menu.templateMenuId,
            };
            navHistory.push(menuNavigationHistoryRecord);
            await this.navigationStorage.write(navKeyId, navigationStorageData);
          }
        }

        return response;
      });
      await next();
    });
    // The middleware need to do the following:
    // 1. If the callback_data belongs to a rendered Menu, it must provide the button handler to use
    this.composer.on("callback_query:data").lazy(
      async (ctx): Promise<MiddlewareFn<C>> => {
        const callbackData = ctx.callbackQuery.data;
        const [renderedMenuId, rowString, colString] = callbackData.split(":");

        // Extract message identifiers for navigation history lookup
        let navKeyId: string | undefined;
        if ("message" in ctx.callbackQuery && ctx.callbackQuery.message) {
          const message = ctx.callbackQuery.message;
          navKeyId = regularNavStorageKey(this.storageKeyPrefix, message.chat.id, message.message_id);
        } else if ("inline_message_id" in ctx.callbackQuery && ctx.callbackQuery.inline_message_id) {
          navKeyId = inlineNavStorageKey(this.storageKeyPrefix, ctx.callbackQuery.inline_message_id);
        }
        if (!navKeyId) {
          return (_ctx, next) => next();
        }

        // Verify this menu is still active by checking navigation history
        const navigationData = await this.navigationStorage.read(navKeyId);
        if (navigationData && navigationData.navigationHistory.length > 0) {
          const activeMenu = navigationData.navigationHistory[navigationData.navigationHistory.length - 1];
          if (activeMenu.renderedMenuId !== renderedMenuId) {
            console.warn(
              `Callback query for rendered menu ${renderedMenuId} for navigationStorage key ${navKeyId}, but active menu is ${activeMenu.renderedMenuId}. Ignoring stale callback.`,
            );
            return (_ctx, next) => next();
          }
        }

        // Check stored rendered menu information if not yet available
        let renderedMenu = this.renderedMenus.get(renderedMenuId);
        if (!renderedMenu) {
          if (!this.menuStorage) {
            // If no rendered menu found, and no storage to check, probably callback_data has nothing to do with us
            return (_ctx, next) => next();
          }
          const renderedMenuData = await this.menuStorage.read(
            renderedMenuStorageKey(this.storageKeyPrefix, renderedMenuId),
          );
          if (!renderedMenuData) {
            // If no rendered menu found anywhere for this candidate rendered menu id, probably nothing to do with us
            return (_ctx, next) => next();
          }

          const templateMenuId = renderedMenuData.templateMenuId;
          const templateMenu = this.get(templateMenuId);
          if (!templateMenu) {
            // If we did find a rendered menu for this, warn and pass as it may be a rare random key conflict
            console.warn(
              `Found template menu id of ${templateMenuId} for rendered menu id of ${renderedMenuId}, but no template menu was registered for this template menun id!`,
            );
            return (_ctx, next) => next();
          }

          renderedMenu = templateMenu.render(templateMenuId, renderedMenuId);
          this.renderedMenus.set(renderedMenuId, renderedMenu);
        }

        const row = parseInt(rowString);
        const col = parseInt(colString);
        if (
          !renderedMenuId || isNaN(row) || isNaN(col) || row < 0 || col < 0 ||
          row >= renderedMenu.menuKeyboard.length || col >= renderedMenu.menuKeyboard[row].length
        ) {
          // If row and col makes no sense, warn and pass as maybe nothing to do with us
          console.warn(
            `Found rendered menu for id of ${renderedMenuId}, but unable to find correct button for row ${rowString} and col ${colString}!`,
          );
          return (_ctx, next) => next();
        }

        const button = renderedMenu.menuKeyboard[row][col];
        if ("handler" in button) {
          return async (ctx, next) => {
            // Answer callback query for buttons relevant to us
            await ctx.answerCallbackQuery();
            await button.handler(ctx, next, button.payload);
          };
        }
        return (_ctx, next) => next();
      },
    );
  }

  /**
   * Registers a MenuTemplate with the given template ID.
   * Templates must be registered before they can be rendered via the menu() method.
   *
   * @param templateMenuId The unique identifier for the menu template
   * @param template The MenuTemplate instance to register
   *
   * @example
   * ```typescript
   * const template = new MenuTemplate<Context>().cb("Hello", handler);
   * registry.register("greeting", template);
   * ```
   */
  register(templateMenuId: string, template: MenuTemplate<C>): void {
    this.templates.set(templateMenuId, template);
  }

  /**
   * Retrieves a registered MenuTemplate by its ID.
   *
   * @param templateMenuId The unique identifier of the menu template
   * @returns The MenuTemplate instance, or undefined if not found
   *
   * @example
   * ```typescript
   * const template = registry.get("main");
   * if (template) {
   *   // Use the template
   * }
   * ```
   */
  get(templateMenuId: string): MenuTemplate<C> | undefined {
    return this.templates.get(templateMenuId);
  }

  /**
   * Checks if a menu template is registered.
   *
   * @param templateMenuId The unique identifier of the menu template
   * @returns true if the template is registered, false otherwise
   *
   * @example
   * ```typescript
   * if (registry.has("main")) {
   *   const menu = registry.menu("main");
   * }
   * ```
   */
  has(templateMenuId: string): boolean {
    return this.templates.has(templateMenuId);
  }

  /**
   * Renders a menu from a registered template and tracks it in the internal registry.
   * Generates a unique renderedMenuId for this specific instance using nanoid.
   *
   * @param templateMenuId The unique identifier of the menu template to render
   * @returns The rendered Menu instance
   * @throws {Error} If the template is not found in the registry
   *
   * @example
   * ```typescript
   * const menu = registry.menu("main");
   * await ctx.reply("Choose an option:", { reply_markup: menu });
   * ```
   */
  menu(templateMenuId: string): Menu<C> {
    const template = this.get(templateMenuId);
    if (!template) {
      throw new Error(
        `Menu template '${templateMenuId}' not found in registry`,
      );
    }

    const renderedMenuId = nanoid();
    const renderedMenu = template.render(templateMenuId, renderedMenuId);
    this.renderedMenus.set(renderedMenuId, renderedMenu);
    return renderedMenu;
  }

  /**
   * Returns the middleware of the owned Composer.
   * This middleware handles menu transformations and callback query routing.
   * Must be registered with the bot to enable menu functionality.
   *
   * @returns The middleware function for handling callback queries and menu transformations
   *
   * @example
   * ```typescript
   * const registry = new MenuRegistry<Context>();
   * bot.use(registry.middleware());
   * ```
   */
  middleware(): MiddlewareFn<C> {
    return this.composer.middleware();
  }

  /**
   * Creates an empty navigation history data structure.
   *
   * @returns A new NavigationHistoryData object with an empty navigation history array
   */
  private static createEmptyNavigationHistory(): NavigationHistoryData {
    return { navigationHistory: [] };
  }
}
