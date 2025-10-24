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

  constructor(storage?: StorageAdapter<string>) {
    this.storage = storage;
    this.composer = new Composer<Context>();
    this.composer.on("callback_query").lazy(
      (ctx): Promise<MiddlewareFn<Context>> => {
        const callbackData = ctx.callbackQuery?.data;
        if (!callbackData) {
          return Promise.resolve((_ctx, next) => next());
        }
        for (const menu of this.renderedMenus.values()) {
          const middleware = menu.getMiddleware(callbackData);
          if (middleware) {
            return Promise.resolve(middleware);
          }
        }
        return Promise.resolve((_ctx, next) => next());
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
   * @returns The rendered Menu instance, or undefined if template not found
   */
  menu(templateId: string): Menu | undefined {
    const template = this.get(templateId);
    if (!template) {
      return undefined;
    }

    const renderedMenuId = nanoid();
    const renderedMenu = template.render(renderedMenuId);
    this.renderedMenus.set(renderedMenuId, renderedMenu);

    if (this.storage) {
      this.persistMenuMapping(renderedMenuId, templateId);
    }

    return renderedMenu;
  }

  private async persistMenuMapping(
    renderedMenuId: string,
    templateId: string,
  ): Promise<void> {
    try {
      if (this.storage) {
        await this.storage.write(renderedMenuId, templateId);
      }
    } catch (err) {
      console.error(`Failed to persist rendered menu mapping: ${err}`);
    }
  }

  /**
   * Returns the middleware of the owned Composer.
   * @returns The middleware function for handling callback queries
   */
  middleware(): MiddlewareFn<Context> {
    return this.composer.middleware();
  }
}
