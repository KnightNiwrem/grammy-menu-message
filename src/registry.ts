import { Composer, Context } from "grammy";
import type { MiddlewareFn, StorageAdapter } from "grammy";
import { nanoid } from "nanoid";
import type { MenuTemplate } from "./template.ts";
import { Menu } from "./menu.ts";
import type { MenuMessageData, MenuNavigationHistoryRecord } from "./types.ts";

/**
 * MenuRegistry manages registered menu templates indexed by their template IDs.
 * Allows users to register and retrieve MenuTemplate instances.
 * When provided with a StorageAdapter, persists rendered menu ID to template ID mappings.
 */
export class MenuRegistry<C extends Context> {
  private templates: Map<string, MenuTemplate<C>> = new Map();
  private renderedMenus: Map<string, Menu<C>> = new Map();
  private composer: Composer<C>;
  private storage: StorageAdapter<MenuMessageData> | undefined;
  private storageKeyGenerator: (ctx: C) => string;
  private storageKeyPrefix: string;
  private loadedStorageKeyIds: Set<string> = new Set();

  constructor(options?: {
    keyPrefix?: string;
    keyGenerator?: (ctx: C) => string;
    storage: StorageAdapter<MenuMessageData>;
  }) {
    this.storage = options?.storage;
    this.storageKeyGenerator = options?.keyGenerator ??
      ((ctx) => `${ctx.chatId ?? "global"}${ctx.msgId ?? "global"}`);
    this.storageKeyPrefix = options?.keyPrefix ?? "menu-message:";

    this.composer = new Composer<C>();
    this.composer.use(async (ctx, next) => {
      const keyId = `${this.storageKeyPrefix}${this.storageKeyGenerator(ctx)}`;
      ctx.api.config.use(async (prev, method, payload, signal) => {
        if (!payload || !("reply_markup" in payload) || !payload.reply_markup || !("inline_keyboard" in payload.reply_markup)) {
          return prev(method, payload, signal);
        }

        const menu = payload.reply_markup.inline_keyboard;
        if (!(menu instanceof Menu)) {
          return prev(method, payload, signal);
        }

        const inlineKeyboard = menu.inline_keyboard;
        payload = { ...payload, reply_markup: { inline_keyboard: inlineKeyboard } };
        if (this.storage) {
          const menuMessageData = await this.storage.read(keyId) ??
            MenuRegistry.createEmptyMenuMessageData();
          const menuNavigationHistoryRecord: MenuNavigationHistoryRecord = {
            renderedMenuId: menu.renderedMenuId,
            templateMenuId: menu.templateMenuId,
            timestamp: Date.now(),
          }
          menuMessageData.navigationHistory.push(menuNavigationHistoryRecord);
        }
        return prev(method, payload, signal);
      });
      await next();
    });
    this.composer.on("callback_query:data").lazy(
      async (ctx): Promise<MiddlewareFn<C>> => {
        const callbackData = ctx.callbackQuery.data;
        const keyId = `${this.storageKeyPrefix}${
          this.storageKeyGenerator(ctx)
        }`;
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
   * @param templateId The unique identifier for the menu template
   * @param template The MenuTemplate instance to register
   */
  register(templateId: string, template: MenuTemplate<C>): void {
    this.templates.set(templateId, template);
  }

  /**
   * Retrieves a registered MenuTemplate by its ID.
   * @param templateId The unique identifier of the menu template
   * @returns The MenuTemplate instance, or undefined if not found
   */
  get(templateId: string): MenuTemplate<C> | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Checks if a menu template is registered.
   * @param templateId The unique identifier of the menu template
   * @returns true if the template is registered, false otherwise
   */
  has(templateId: string): boolean {
    return this.templates.has(templateId);
  }

  /**
   * Renders a menu from a registered template and appends it to the internal registry.
   * @param templateId The unique identifier of the menu template to render
   * @returns The rendered Menu instance
   * @throws If the template is not found in the registry
   */
  menu(templateId: string): Menu<C> {
    const template = this.get(templateId);
    if (!template) {
      throw new Error(`Menu template '${templateId}' not found in registry`);
    }

    const renderedMenuId = nanoid();
    const renderedMenu = template.render(renderedMenuId);
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
    if (!this.storage || !this.loadedStorageKeyIds.has(keyId)) {
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

      const renderedMenu = template.render(renderedMenuId);
      this.renderedMenus.set(renderedMenuId, renderedMenu);
    }
    this.loadedStorageKeyIds.add(keyId);
  }

  private static createEmptyMenuMessageData(): MenuMessageData {
    return { navigationHistory: [] };
  }
}
