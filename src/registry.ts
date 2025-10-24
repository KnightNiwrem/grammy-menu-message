import { Composer, Context } from "grammy";
import type { MiddlewareFn, StorageAdapter } from "grammy";
import { nanoid } from "nanoid";
import type { MenuTemplate } from "./template.ts";
import type { Menu } from "./menu.ts";

/**
 * MenuRegistry manages registered menu templates indexed by their template IDs.
 * Allows users to register and retrieve MenuTemplate instances.
 * When provided with a StorageAdapter, persists rendered menu ID to template ID mappings.
 */
export class MenuRegistry {
  private templates: Map<string, MenuTemplate> = new Map();
  private renderedMenus: Map<string, Menu> = new Map();
  private composer: Composer<Context>;
  private storage: StorageAdapter<string> | undefined;
  private storageLoaded = false;

  constructor(storage?: StorageAdapter<string>) {
    this.storage = storage;
    this.composer = new Composer<Context>();
    this.composer.on("callback_query").lazy(
      async (ctx): Promise<MiddlewareFn<Context>> => {
        const callbackData = ctx.callbackQuery?.data;
        if (!callbackData) {
          return (_ctx, next) => next();
        }

        if (!this.storageLoaded) {
          await this.loadMenuMappingsFromStorage();
        }

        for (const menu of this.renderedMenus.values()) {
          const middleware = menu.getMiddleware(callbackData);
          if (middleware) {
            return middleware;
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
  register(templateId: string, template: MenuTemplate): void {
    this.templates.set(templateId, template);
  }

  /**
   * Retrieves a registered MenuTemplate by its ID.
   * @param templateId The unique identifier of the menu template
   * @returns The MenuTemplate instance, or undefined if not found
   */
  get(templateId: string): MenuTemplate | undefined {
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
   * Unregisters a MenuTemplate by its ID.
   * @param templateId The unique identifier of the menu template
   * @returns true if the template was removed, false if it didn't exist
   */
  unregister(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Renders a menu from a registered template and appends it to the internal registry.
   * If storage adapter is provided, persists the rendered menu ID to template ID mapping.
   * @param templateId The unique identifier of the menu template to render
   * @returns Promise resolving to the rendered Menu instance, or undefined if template not found
   * @throws If storage write operation fails
   */
  async menu(templateId: string): Promise<Menu | undefined> {
    const template = this.get(templateId);
    if (!template) {
      return undefined;
    }

    const renderedMenuId = nanoid();
    const renderedMenu = template.render(renderedMenuId);
    this.renderedMenus.set(renderedMenuId, renderedMenu);

    if (this.storage) {
      await this.storage.write(renderedMenuId, templateId);
    }

    return renderedMenu;
  }

  /**
   * Returns the middleware of the owned Composer.
   * @returns The middleware function for handling callback queries
   */
  middleware(): MiddlewareFn<Context> {
    return this.composer.middleware();
  }

  private async loadMenuMappingsFromStorage(): Promise<void> {
    if (!this.storage) {
      this.storageLoaded = true;
      return;
    }

    // Use readAllEntries if available to restore persisted menu mappings
    if (this.storage.readAllEntries) {
      try {
        for await (
          const [renderedMenuId, templateId] of this.storage.readAllEntries()
        ) {
          const template = this.get(templateId);
          if (template) {
            const renderedMenu = template.render(renderedMenuId);
            this.renderedMenus.set(renderedMenuId, renderedMenu);
          }
        }
      } catch (err) {
        throw new Error(`Failed to load menu mappings from storage: ${err}`);
      }
    }

    this.storageLoaded = true;
  }
}
