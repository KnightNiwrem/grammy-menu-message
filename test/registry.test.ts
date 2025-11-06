import { Bot, Context, describe, expect, it } from "./deps.ts";
import { MenuRegistry } from "../src/registry.ts";
import { MenuTemplate } from "../src/templates/template.ts";

describe("MenuRegistry", () => {
  describe("constructor", () => {
    it("should create a registry with default options", () => {
      const registry = new MenuRegistry<Context>();
      expect(registry).toBeInstanceOf(MenuRegistry);
    });

    it("should create a registry with custom keyPrefix", () => {
      const registry = new MenuRegistry<Context>({ keyPrefix: "custom" });
      expect(registry).toBeInstanceOf(MenuRegistry);
    });
  });

  describe("register", () => {
    it("should register a template", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>("Test message");

      registry.register("test", template);
      expect(registry.has("test")).toBe(true);
    });

    it("should allow registering multiple templates", () => {
      const registry = new MenuRegistry<Context>();
      const template1 = new MenuTemplate<Context>("Test message");
      const template2 = new MenuTemplate<Context>("Test message");

      registry.register("template1", template1);
      registry.register("template2", template2);

      expect(registry.has("template1")).toBe(true);
      expect(registry.has("template2")).toBe(true);
    });

    it("should allow overwriting a template", () => {
      const registry = new MenuRegistry<Context>();
      const template1 = new MenuTemplate<Context>("Test message").cb("Button 1", async () => {});
      const template2 = new MenuTemplate<Context>("Test message").cb("Button 2", async () => {});

      registry.register("test", template1);
      registry.register("test", template2);

      const retrieved = registry.get("test");
      expect(retrieved).toBe(template2);
    });
  });

  describe("get", () => {
    it("should retrieve a registered template", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>("Test message");

      registry.register("test", template);
      const retrieved = registry.get("test");

      expect(retrieved).toBe(template);
    });

    it("should return undefined for unregistered template", () => {
      const registry = new MenuRegistry<Context>();
      const retrieved = registry.get("nonexistent");

      expect(retrieved).toBeUndefined();
    });
  });

  describe("has", () => {
    it("should return true for registered template", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>("Test message");

      registry.register("test", template);
      expect(registry.has("test")).toBe(true);
    });

    it("should return false for unregistered template", () => {
      const registry = new MenuRegistry<Context>();
      expect(registry.has("nonexistent")).toBe(false);
    });
  });

  describe("menu", () => {
    it("should render a menu from a registered template", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>("Test message").cb("Test", async () => {});

      registry.register("test", template);
      const menu = registry.menu("test");

      expect(menu).toBeDefined();
      expect(menu.templateMenuId).toBe("test");
      expect(menu.renderedMenuId).toBeDefined();
    });

    it("should generate unique renderedMenuIds for multiple renders", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>("Test message").cb("Test", async () => {});

      registry.register("test", template);
      const menu1 = registry.menu("test");
      const menu2 = registry.menu("test");

      expect(menu1.renderedMenuId).not.toBe(menu2.renderedMenuId);
    });

    it("should throw error for unregistered template", () => {
      const registry = new MenuRegistry<Context>();

      expect(() => registry.menu("nonexistent")).toThrow(
        "Menu template 'nonexistent' not found in registry",
      );
    });
  });

  describe("middleware", () => {
    it("should return a middleware function", () => {
      const registry = new MenuRegistry<Context>();
      const middleware = registry.middleware();

      expect(typeof middleware).toBe("function");
    });

    it("should be usable with a bot", () => {
      const bot = new Bot("test-token");
      const registry = new MenuRegistry<Context>();

      // Should not throw
      bot.use(registry.middleware());
    });
  });

  describe("integration", () => {
    it("should work end-to-end with template registration and rendering", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>("Test message")
        .cb("Option 1", async () => {})
        .cb("Option 2", async () => {})
        .row()
        .url("Visit", "https://example.com");

      registry.register("main", template);
      const menu = registry.menu("main");

      expect(menu.inline_keyboard.length).toBe(2);
      expect(menu.inline_keyboard[0].length).toBe(2);
      expect(menu.inline_keyboard[1].length).toBe(1);
    });
  });
});
