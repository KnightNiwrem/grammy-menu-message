import { Composer, Context } from "grammy";
import type { MiddlewareFn, StorageAdapter } from "grammy";
import { nanoid } from "nanoid";
import type { MenuTemplate } from "./template.ts";
import { Menu } from "./menu.ts";
import type { MenuMessageData, MenuNavigationHistoryRecord } from "./types.ts";

/**
 * MenuRegistry manages registered menu templates and their rendered instances.
 * Indexes templates by their template IDs and tracks rendered menus for callback routing.
 * When provided with a StorageAdapter, persists navigation history for menu messages.
 */
export class MenuRegistry<C extends Context> {
  private templates: Map<string, MenuTemplate<C>> = new Map();
  private renderedMenus: Map<string, Menu<C>> = new Map();
  private composer: Composer<C>;
  private storage: StorageAdapter<MenuMessageData> | undefined;
  private storageKeyPrefix: string;
  private loadedStorageKeyIds: Set<string> = new Set();

  /**
   * Creates a new MenuRegistry instance.
   * @param options Configuration options for the registry
   * @param options.storage StorageAdapter for persisting menu navigation history
   * @param options.keyPrefix Optional prefix for storage keys (defaults to "menu-message:")
   */
  constructor(options?: {
    keyPrefix?: string;
    storage: StorageAdapter<MenuMessageData>;
  }) {
    this.storage = options?.storage;
    this.storageKeyPrefix = options?.keyPrefix ?? "menu-message:";

    this.composer = new Composer<C>();
    this.composer.use(async (ctx, next) => {
      ctx.api.config.use(async (prev, method, payload, signal) => {
        if (
          !payload || !("reply_markup" in payload) || !payload.reply_markup
        ) {
          return prev(method, payload, signal);
        }

        const menu = payload.reply_markup;
        if (!(menu instanceof Menu)) {
          return prev(method, payload, signal);
        }

        const inlineKeyboard = menu.inline_keyboard;
        payload = {
          ...payload,
          reply_markup: { inline_keyboard: inlineKeyboard },
        };

        const result = await prev(method, payload, signal);

        if (
          this.storage && result && typeof result === "object" &&
          "message_id" in result
        ) {
          const msgId = result.message_id;
          const chatId = ctx.chatId ?? "global";
          const keyId = `${this.storageKeyPrefix}regular:${chatId}:${msgId}`;
          const menuMessageData = await this.storage.read(keyId) ??
            MenuRegistry.createEmptyMenuMessageData();
          const menuNavigationHistoryRecord: MenuNavigationHistoryRecord = {
            renderedMenuId: menu.renderedMenuId,
            templateMenuId: menu.templateMenuId,
            timestamp: Date.now(),
          };
          menuMessageData.navigationHistory.push(menuNavigationHistoryRecord);
          await this.storage.write(keyId, menuMessageData);
        }
        return result;
      });
      await next();
    });
    this.composer.on("callback_query:data").lazy(
      async (ctx): Promise<MiddlewareFn<C>> => {
        const callbackData = ctx.callbackQuery.data;
        const chatId = ctx.chatId ?? "global";
        const msgId = ctx.msgId ?? "global";
        const keyId = `${this.storageKeyPrefix}regular:${chatId}:${msgId}`;
        if (!this.loadedStorageKeyIds.has(keyId)) {
          await this.loadMenuMessageData(keyId);
        }

        for (const menu of this.renderedMenus.values()) {
          for (const row of menu.menuKeyboard) {
            for (const button of row) {
              if (button.callback_data === callbackData && button.handler) {
                return button.handler;
              }
            }
          }
        }
        return (_ctx, next) => next();
      },
    );
  }

  /**
   * Registers a MenuTemplate with the given template ID.
   * @param templateMenuId The unique identifier for the menu template
   * @param template The MenuTemplate instance to register
   */
  register(templateMenuId: string, template: MenuTemplate<C>): void {
    this.templates.set(templateMenuId, template);
  }

  /**
   * Retrieves a registered MenuTemplate by its ID.
   * @param templateMenuId The unique identifier of the menu template
   * @returns The MenuTemplate instance, or undefined if not found
   */
  get(templateMenuId: string): MenuTemplate<C> | undefined {
    return this.templates.get(templateMenuId);
  }

  /**
   * Checks if a menu template is registered.
   * @param templateMenuId The unique identifier of the menu template
   * @returns true if the template is registered, false otherwise
   */
  has(templateMenuId: string): boolean {
    return this.templates.has(templateMenuId);
  }

  /**
   * Renders a menu from a registered template and tracks it in the internal registry.
   * Generates a unique renderedMenuId for this specific instance.
   * @param templateMenuId The unique identifier of the menu template to render
   * @returns The rendered Menu instance
   * @throws If the template is not found in the registry
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
   * @returns The middleware function for handling callback queries
   */
  middleware(): MiddlewareFn<C> {
    return this.composer.middleware();
  }

  private async loadMenuMessageData(keyId: string): Promise<void> {
    if (!this.storage || this.loadedStorageKeyIds.has(keyId)) {
      this.loadedStorageKeyIds.add(keyId);
      return;
    }

    const menuMessageData = await this.storage.read(keyId);
    if (!menuMessageData) {
      this.loadedStorageKeyIds.add(keyId);
      return;
    }

    for (const navigationHistoryRecord of menuMessageData.navigationHistory) {
      const renderedMenuId = navigationHistoryRecord.renderedMenuId;
      const templateMenuId = navigationHistoryRecord.templateMenuId;

      const template = this.get(templateMenuId);
      if (!template) {
        continue;
      }

      const renderedMenu = template.render(templateMenuId, renderedMenuId);
      this.renderedMenus.set(renderedMenuId, renderedMenu);
    }
    this.loadedStorageKeyIds.add(keyId);
  }

  private static createEmptyMenuMessageData(): MenuMessageData {
    return { navigationHistory: [] };
  }
}
