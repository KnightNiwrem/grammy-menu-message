import type { Context, MiddlewareFn } from "grammy";
import { Menu } from "./menu.ts";

/**
 * MenuRegistry manages a collection of Menu instances indexed by menu IDs.
 *
 * This class provides functionality to register, retrieve, and handle
 * callback routing for multiple Menu instances within a single registry.
 */
export class MenuRegistry {
  private menus: Map<string, Menu>;

  constructor() {
    this.menus = new Map();
  }

  /**
   * Register a Menu instance with a unique menu ID.
   *
   * @param menuId - The unique identifier for this menu
   * @param menu - The Menu instance to register
   * @throws Error if a menu with the same ID is already registered
   */
  register(menuId: string, menu: Menu): void {
    if (this.menus.has(menuId)) {
      throw new Error(`Menu with ID "${menuId}" is already registered`);
    }
    this.menus.set(menuId, menu);
  }

  /**
   * Retrieve a registered Menu by its ID.
   *
   * @param menuId - The menu ID to look up
   * @returns The Menu instance or undefined if not found
   */
  getMenu(menuId: string): Menu | undefined {
    return this.menus.get(menuId);
  }

  /**
   * Check if a menu is registered with the given ID.
   *
   * @param menuId - The menu ID to check
   * @returns True if a menu with this ID exists, false otherwise
   */
  hasMenu(menuId: string): boolean {
    return this.menus.has(menuId);
  }

  /**
   * Unregister a Menu by its ID.
   *
   * @param menuId - The menu ID to unregister
   * @returns True if the menu was removed, false if it didn't exist
   */
  unregister(menuId: string): boolean {
    return this.menus.delete(menuId);
  }

  /**
   * Get all registered menu IDs.
   *
   * @returns An array of all registered menu IDs
   */
  getMenuIds(): string[] {
    return Array.from(this.menus.keys());
  }

  /**
   * Get the callback handler middleware for all registered menus.
   *
   * @returns A middleware function that routes callbacks to the appropriate menu
   */
  getCallbackHandler(): MiddlewareFn<Context> {
    return async (ctx, next) => {
      if (!ctx.callbackQuery?.data) {
        return next();
      }

      const callbackData = ctx.callbackQuery.data;

      for (const menu of this.menus.values()) {
        const callback = menu.getCallback(callbackData);
        if (callback) {
          await callback(ctx, next);
          return;
        }
      }

      return next();
    };
  }
}
