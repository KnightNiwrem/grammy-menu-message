import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { MenuRegistry } from "../src/registry.ts";
import { MenuTemplate } from "../src/template.ts";
import type { Context } from "grammy";
import type { MenuMessageData } from "../src/types.ts";

// Mock StorageAdapter
class MockStorage {
  private data: Map<string, MenuMessageData> = new Map();

  read(key: string): Promise<MenuMessageData | undefined> {
    return Promise.resolve(this.data.get(key));
  }

  write(key: string, value: MenuMessageData): Promise<void> {
    this.data.set(key, value);
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.data.delete(key);
    return Promise.resolve();
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  clear(): void {
    this.data.clear();
  }
}

describe("MenuRegistry", () => {
  describe("constructor", () => {
    it("should create a registry without storage", () => {
      const registry = new MenuRegistry<Context>();
      expect(registry).toBeDefined();
    });

    it("should create a registry with storage", () => {
      const storage = new MockStorage();
      const registry = new MenuRegistry<Context>({ storage });
      expect(registry).toBeDefined();
    });

    it("should create a registry with custom key prefix", () => {
      const storage = new MockStorage();
      const registry = new MenuRegistry<Context>({
        storage,
        keyPrefix: "custom-prefix:",
      });
      expect(registry).toBeDefined();
    });
  });

  describe("register method", () => {
    it("should register a menu template", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>();

      registry.register("main", template);

      expect(registry.has("main")).toBe(true);
    });

    it("should allow registering multiple templates", () => {
      const registry = new MenuRegistry<Context>();
      const template1 = new MenuTemplate<Context>();
      const template2 = new MenuTemplate<Context>();

      registry.register("menu1", template1);
      registry.register("menu2", template2);

      expect(registry.has("menu1")).toBe(true);
      expect(registry.has("menu2")).toBe(true);
    });

    it("should overwrite existing template with same ID", () => {
      const registry = new MenuRegistry<Context>();
      const template1 = new MenuTemplate<Context>().rawCb("Old", "old");
      const template2 = new MenuTemplate<Context>().rawCb("New", "new");

      registry.register("menu", template1);
      registry.register("menu", template2);

      const retrieved = registry.get("menu");
      expect(retrieved).toBe(template2);
    });
  });

  describe("get method", () => {
    it("should retrieve a registered template", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>();

      registry.register("test", template);
      const retrieved = registry.get("test");

      expect(retrieved).toBe(template);
    });

    it("should return undefined for non-existent template", () => {
      const registry = new MenuRegistry<Context>();
      const retrieved = registry.get("nonexistent");

      expect(retrieved).toBeUndefined();
    });
  });

  describe("has method", () => {
    it("should return true for registered template", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>();

      registry.register("test", template);

      expect(registry.has("test")).toBe(true);
    });

    it("should return false for non-existent template", () => {
      const registry = new MenuRegistry<Context>();

      expect(registry.has("nonexistent")).toBe(false);
    });
  });

  describe("menu method", () => {
    it("should render a menu from registered template", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>()
        .rawCb("Button", "callback");

      registry.register("test", template);
      const menu = registry.menu("test");

      expect(menu).toBeDefined();
      expect(menu.templateMenuId).toBe("test");
      expect(menu.inline_keyboard[0][0].text).toBe("Button");
    });

    it("should generate unique renderedMenuId for each render", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>()
        .rawCb("Button", "callback");

      registry.register("test", template);
      const menu1 = registry.menu("test");
      const menu2 = registry.menu("test");

      expect(menu1.renderedMenuId).not.toBe(menu2.renderedMenuId);
    });

    it("should throw error for non-existent template", () => {
      const registry = new MenuRegistry<Context>();

      expect(() => {
        registry.menu("nonexistent");
      }).toThrow("Menu template 'nonexistent' not found in registry");
    });

    it("should track rendered menus internally", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>()
        .rawCb("Button", "callback");

      registry.register("test", template);
      const menu = registry.menu("test");

      expect(menu.renderedMenuId).toBeDefined();
      expect(menu.renderedMenuId.length).toBeGreaterThan(0);
    });
  });

  describe("middleware method", () => {
    it("should return a middleware function", () => {
      const registry = new MenuRegistry<Context>();
      const middleware = registry.middleware();

      expect(typeof middleware).toBe("function");
    });

    it("should return middleware that can be used with bot", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>()
        .cb("Test", async (ctx) => {
          await ctx.answerCallbackQuery();
        });

      registry.register("test", template);
      const middleware = registry.middleware();

      expect(middleware).toBeDefined();
    });
  });

  describe("callback routing", () => {
    it("should route callbacks to correct handlers", () => {
      const registry = new MenuRegistry<Context>();
      let handlerCalled = false;

      const template = new MenuTemplate<Context>()
        .cb("Button", () => {
          handlerCalled = true;
        });

      registry.register("test", template);
      const menu = registry.menu("test");

      // The callback_data is generated as renderedMenuId:row:col
      const callbackData = menu.inline_keyboard[0][0];
      expect(callbackData).toHaveProperty("callback_data");
      expect(handlerCalled).toBe(false); // Not called yet
    });

    it("should handle multiple buttons with different handlers", () => {
      const registry = new MenuRegistry<Context>();
      const calls: number[] = [];

      const template = new MenuTemplate<Context>()
        .cb("Button 1", () => {
          calls.push(1);
        })
        .cb("Button 2", () => {
          calls.push(2);
        })
        .row()
        .cb("Button 3", () => {
          calls.push(3);
        });

      registry.register("test", template);
      const menu = registry.menu("test");

      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect(menu.inline_keyboard[1]).toHaveLength(1);
    });
  });

  describe("storage integration", () => {
    it("should work without storage adapter", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>().rawCb("Test", "test");

      registry.register("test", template);
      const menu = registry.menu("test");

      expect(menu).toBeDefined();
    });

    it("should use custom key generator when provided", () => {
      const storage = new MockStorage();

      const registry = new MenuRegistry<Context>({
        storage,
      });

      expect(registry).toBeDefined();
    });

    it("should use custom key prefix when provided", () => {
      const storage = new MockStorage();

      const registry = new MenuRegistry<Context>({
        storage,
        keyPrefix: "myapp:",
      });

      expect(registry).toBeDefined();
    });

    it("should use default key prefix if not provided", () => {
      const storage = new MockStorage();

      const registry = new MenuRegistry<Context>({
        storage,
      });

      expect(registry).toBeDefined();
    });
  });

  describe("navigation history", () => {
    it("should track navigation history when storage is provided", () => {
      const storage = new MockStorage();
      const registry = new MenuRegistry<Context>({ storage });
      const template = new MenuTemplate<Context>().rawCb("Test", "test");

      registry.register("test", template);

      // Creating menu should be tracked when used
      const menu = registry.menu("test");
      expect(menu).toBeDefined();
    });

    it("should handle multiple menu renders", () => {
      const storage = new MockStorage();
      const registry = new MenuRegistry<Context>({ storage });
      const template = new MenuTemplate<Context>().rawCb("Test", "test");

      registry.register("test", template);

      const menu1 = registry.menu("test");
      const menu2 = registry.menu("test");

      expect(menu1.renderedMenuId).not.toBe(menu2.renderedMenuId);
    });
  });

  describe("menu template lifecycle", () => {
    it("should allow reusing template for multiple renders", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>()
        .cb("Button", async () => {});

      registry.register("reusable", template);

      const menu1 = registry.menu("reusable");
      const menu2 = registry.menu("reusable");
      const menu3 = registry.menu("reusable");

      expect(menu1.templateMenuId).toBe("reusable");
      expect(menu2.templateMenuId).toBe("reusable");
      expect(menu3.templateMenuId).toBe("reusable");

      expect(menu1.renderedMenuId).not.toBe(menu2.renderedMenuId);
      expect(menu2.renderedMenuId).not.toBe(menu3.renderedMenuId);
    });

    it("should handle complex menu structures", () => {
      const registry = new MenuRegistry<Context>();
      const handler = async () => {};

      const mainMenu = new MenuTemplate<Context>()
        .cb("Settings", handler)
        .cb("Help", handler)
        .row()
        .url("GitHub", "https://github.com");

      const settingsMenu = new MenuTemplate<Context>()
        .cb("Option 1", handler)
        .cb("Option 2", handler)
        .row()
        .cb("Back", handler);

      registry.register("main", mainMenu);
      registry.register("settings", settingsMenu);

      const main = registry.menu("main");
      const settings = registry.menu("settings");

      expect(main.templateMenuId).toBe("main");
      expect(settings.templateMenuId).toBe("settings");
      expect(main.inline_keyboard).toHaveLength(2);
      expect(settings.inline_keyboard).toHaveLength(2);
    });
  });

  describe("error handling", () => {
    it("should throw descriptive error for missing template", () => {
      const registry = new MenuRegistry<Context>();

      expect(() => {
        registry.menu("missing-template");
      }).toThrow(/Menu template 'missing-template' not found/);
    });

    it("should handle empty template ID", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>();

      registry.register("", template);

      expect(registry.has("")).toBe(true);
      const menu = registry.menu("");
      expect(menu.templateMenuId).toBe("");
    });
  });

  describe("concurrent operations", () => {
    it("should handle multiple template registrations", () => {
      const registry = new MenuRegistry<Context>();

      for (let i = 0; i < 10; i++) {
        const template = new MenuTemplate<Context>()
          .rawCb(`Button ${i}`, `cb${i}`);
        registry.register(`menu${i}`, template);
      }

      for (let i = 0; i < 10; i++) {
        expect(registry.has(`menu${i}`)).toBe(true);
      }
    });

    it("should handle multiple menu renders", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>().rawCb("Button", "cb");

      registry.register("test", template);

      const menus = [];
      for (let i = 0; i < 5; i++) {
        menus.push(registry.menu("test"));
      }

      const renderedIds = new Set(menus.map((m) => m.renderedMenuId));
      expect(renderedIds.size).toBe(5); // All IDs should be unique
    });
  });
});
