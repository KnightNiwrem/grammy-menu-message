import { Composer, Context } from "grammy";
import type { NextFunction } from "grammy";
import { nanoid } from "nanoid";
import type { MenuTemplate } from "./template.ts";

/**
 * MenuRegistry manages registered menu templates indexed by their template IDs.
 * Allows users to register and retrieve MenuTemplate instances.
 */
export class MenuRegistry {
  private templates: Map<string, MenuTemplate> = new Map();

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
   * Renders a menu from a registered template and returns a Composer with its middleware.
   * @param templateId The unique identifier of the menu template to render
   * @returns A Composer containing the menu's middleware handlers, or undefined if template not found
   */
  menu(templateId: string): Composer<Context> | undefined {
    const template = this.get(templateId);
    if (!template) {
      return undefined;
    }

    const renderedMenuId = nanoid();
    const renderedMenu = template.render(renderedMenuId);
    const composer = new Composer<Context>();

    // Collect all middleware from the rendered menu into the composer
    for (
      const [callbackData, middleware] of renderedMenu.getMiddlewareEntries()
    ) {
      composer.on("callback_query", async (ctx, next: NextFunction) => {
        if (ctx.callbackQuery.data === callbackData) {
          await middleware(ctx, next);
        } else {
          await next();
        }
      });
    }

    return composer;
  }
}
