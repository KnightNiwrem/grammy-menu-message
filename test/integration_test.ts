import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { MenuRegistry, MenuTemplate } from "../src/mod.ts";
import type { Context } from "grammy";
import type { MenuMessageData } from "../src/types.ts";

// Mock StorageAdapter for integration tests
class IntegrationMockStorage {
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

  getData(): Map<string, MenuMessageData> {
    return this.data;
  }
}

describe("Integration Tests", () => {
  describe("Menu system workflow", () => {
    it("should support complete menu creation workflow", () => {
      const registry = new MenuRegistry<Context>();

      // Create main menu
      const mainMenu = new MenuTemplate<Context>()
        .cb("Settings", async () => {})
        .cb("Help", async () => {})
        .row()
        .url("GitHub", "https://github.com");

      // Create settings menu
      const settingsMenu = new MenuTemplate<Context>()
        .cb("Option 1", async () => {})
        .cb("Option 2", async () => {})
        .row()
        .cb("Back to Main", async () => {});

      // Register menus
      registry.register("main", mainMenu);
      registry.register("settings", settingsMenu);

      // Render menus
      const main = registry.menu("main");
      const settings = registry.menu("settings");

      // Verify main menu
      expect(main.templateMenuId).toBe("main");
      expect(main.inline_keyboard).toHaveLength(2);
      expect(main.inline_keyboard[0]).toHaveLength(2);
      expect(main.inline_keyboard[0][0].text).toBe("Settings");
      expect(main.inline_keyboard[0][1].text).toBe("Help");
      expect(main.inline_keyboard[1][0].text).toBe("GitHub");

      // Verify settings menu
      expect(settings.templateMenuId).toBe("settings");
      expect(settings.inline_keyboard).toHaveLength(2);
      expect(settings.inline_keyboard[0]).toHaveLength(2);
      expect(settings.inline_keyboard[1]).toHaveLength(1);
    });

    it("should handle menu navigation with multiple renders", () => {
      const registry = new MenuRegistry<Context>();

      const menu = new MenuTemplate<Context>()
        .cb("Option A", async () => {})
        .cb("Option B", async () => {});

      registry.register("nav", menu);

      // Simulate multiple user interactions
      const render1 = registry.menu("nav");
      const render2 = registry.menu("nav");
      const render3 = registry.menu("nav");

      // Each render should have unique ID
      const ids = new Set([
        render1.renderedMenuId,
        render2.renderedMenuId,
        render3.renderedMenuId,
      ]);
      expect(ids.size).toBe(3);

      // But all should reference the same template
      expect(render1.templateMenuId).toBe("nav");
      expect(render2.templateMenuId).toBe("nav");
      expect(render3.templateMenuId).toBe("nav");
    });

    it("should support dynamic menu building", () => {
      const registry = new MenuRegistry<Context>();

      // Build menu dynamically
      const template = new MenuTemplate<Context>();
      const options = ["Apple", "Banana", "Cherry"];

      for (const option of options) {
        template.cb(option, async () => {});
      }
      template.row().cb("Done", async () => {});

      registry.register("dynamic", template);
      const menu = registry.menu("dynamic");

      expect(menu.inline_keyboard).toHaveLength(2);
      expect(menu.inline_keyboard[0]).toHaveLength(3);
      expect(menu.inline_keyboard[0][0].text).toBe("Apple");
      expect(menu.inline_keyboard[0][1].text).toBe("Banana");
      expect(menu.inline_keyboard[0][2].text).toBe("Cherry");
      expect(menu.inline_keyboard[1][0].text).toBe("Done");
    });
  });

  describe("Button types integration", () => {
    it("should support mixing different button types", () => {
      const template = new MenuTemplate<Context>()
        .cb("Callback", async () => {})
        .url("URL", "https://example.com")
        .row()
        .webApp("WebApp", "https://app.example.com")
        .switchInline("Share")
        .row()
        .copyText("Copy", "Text to copy");

      const registry = new MenuRegistry<Context>();
      registry.register("mixed", template);
      const menu = registry.menu("mixed");

      expect(menu.inline_keyboard).toHaveLength(3);

      // First row: callback and URL
      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect(menu.inline_keyboard[0][0]).toHaveProperty("callback_data");
      expect(menu.inline_keyboard[0][1]).toHaveProperty("url");

      // Second row: web app and switch inline
      expect(menu.inline_keyboard[1]).toHaveLength(2);
      expect(menu.inline_keyboard[1][0]).toHaveProperty("web_app");
      expect(menu.inline_keyboard[1][1]).toHaveProperty("switch_inline_query");

      // Third row: copy text
      expect(menu.inline_keyboard[2]).toHaveLength(1);
      expect(menu.inline_keyboard[2][0]).toHaveProperty("copy_text");
    });

    it("should handle all button types in single menu", () => {
      const template = new MenuTemplate<Context>()
        .cb("CB", async () => {})
        .rawCb("Raw", "raw-data")
        .row()
        .url("URL", "https://url.com")
        .webApp("App", "https://app.com")
        .row()
        .login("Login", "https://login.com")
        .switchInline("Inline")
        .row()
        .switchInlineCurrent("Current")
        .switchInlineChosen("Chosen")
        .row()
        .copyText("Copy", "text")
        .game("Game")
        .row()
        .pay("Pay");

      const registry = new MenuRegistry<Context>();
      registry.register("all-types", template);
      const menu = registry.menu("all-types");

      expect(menu.inline_keyboard).toHaveLength(6);

      // Verify each row has expected number of buttons
      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect(menu.inline_keyboard[1]).toHaveLength(2);
      expect(menu.inline_keyboard[2]).toHaveLength(2);
      expect(menu.inline_keyboard[3]).toHaveLength(2);
      expect(menu.inline_keyboard[4]).toHaveLength(2);
      expect(menu.inline_keyboard[5]).toHaveLength(1);
    });
  });

  describe("Storage integration", () => {
    it("should work with storage adapter", () => {
      const storage = new IntegrationMockStorage();
      const registry = new MenuRegistry<Context>({ storage });

      const template = new MenuTemplate<Context>()
        .cb("Button", async () => {});

      registry.register("stored", template);
      const menu = registry.menu("stored");

      expect(menu).toBeDefined();
      expect(storage.getData().size).toBe(0); // Not written until menu is used in reply
    });

    it("should support custom storage key configuration", () => {
      const storage = new IntegrationMockStorage();
      const keyGenerator = (ctx: Context) =>
        `user-${ctx.from?.id ?? "unknown"}`;
      const keyPrefix = "mybot:";

      const registry = new MenuRegistry<Context>({
        storage,
        keyGenerator,
        keyPrefix,
      });

      const template = new MenuTemplate<Context>()
        .cb("Test", async () => {});

      registry.register("test", template);
      const menu = registry.menu("test");

      expect(menu).toBeDefined();
    });
  });

  describe("Complex menu hierarchies", () => {
    it("should handle multi-level menu system", () => {
      const registry = new MenuRegistry<Context>();

      // Main menu
      const main = new MenuTemplate<Context>()
        .cb("Products", async () => {})
        .cb("Settings", async () => {})
        .row()
        .cb("About", async () => {});

      // Products submenu
      const products = new MenuTemplate<Context>()
        .cb("Product A", async () => {})
        .cb("Product B", async () => {})
        .row()
        .cb("Back", async () => {});

      // Settings submenu
      const settings = new MenuTemplate<Context>()
        .cb("Language", async () => {})
        .cb("Notifications", async () => {})
        .row()
        .cb("Back", async () => {});

      registry.register("main", main);
      registry.register("products", products);
      registry.register("settings", settings);

      // Verify all menus are accessible
      expect(registry.has("main")).toBe(true);
      expect(registry.has("products")).toBe(true);
      expect(registry.has("settings")).toBe(true);

      // Render all menus
      const mainMenu = registry.menu("main");
      const productsMenu = registry.menu("products");
      const settingsMenu = registry.menu("settings");

      expect(mainMenu.inline_keyboard).toHaveLength(2);
      expect(productsMenu.inline_keyboard).toHaveLength(2);
      expect(settingsMenu.inline_keyboard).toHaveLength(2);
    });

    it("should support menu reusability across different contexts", () => {
      const registry = new MenuRegistry<Context>();

      const confirmTemplate = new MenuTemplate<Context>()
        .cb("Yes", async () => {})
        .cb("No", async () => {});

      registry.register("confirm", confirmTemplate);

      // Use the same template multiple times
      const confirm1 = registry.menu("confirm");
      const confirm2 = registry.menu("confirm");
      const confirm3 = registry.menu("confirm");

      // All should have the same structure
      expect(confirm1.inline_keyboard[0]).toHaveLength(2);
      expect(confirm2.inline_keyboard[0]).toHaveLength(2);
      expect(confirm3.inline_keyboard[0]).toHaveLength(2);

      // But different rendered IDs
      expect(confirm1.renderedMenuId).not.toBe(confirm2.renderedMenuId);
      expect(confirm2.renderedMenuId).not.toBe(confirm3.renderedMenuId);

      // Same template ID
      expect(confirm1.templateMenuId).toBe("confirm");
      expect(confirm2.templateMenuId).toBe("confirm");
      expect(confirm3.templateMenuId).toBe("confirm");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty menus", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>();

      registry.register("empty", template);
      const menu = registry.menu("empty");

      expect(menu.inline_keyboard).toEqual([]);
      expect(menu.menuKeyboard).toEqual([]);
    });

    it("should handle menus with only rows", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>()
        .row()
        .row()
        .row();

      registry.register("rows-only", template);
      const menu = registry.menu("rows-only");

      expect(menu.inline_keyboard).toEqual([]);
    });

    it("should handle single button menus", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>()
        .cb("Only Button", async () => {});

      registry.register("single", template);
      const menu = registry.menu("single");

      expect(menu.inline_keyboard).toHaveLength(1);
      expect(menu.inline_keyboard[0]).toHaveLength(1);
    });

    it("should handle very wide menus", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>();

      // Add 10 buttons in a single row
      for (let i = 0; i < 10; i++) {
        template.cb(`Btn ${i}`, async () => {});
      }

      registry.register("wide", template);
      const menu = registry.menu("wide");

      expect(menu.inline_keyboard).toHaveLength(1);
      expect(menu.inline_keyboard[0]).toHaveLength(10);
    });

    it("should handle many rows", () => {
      const registry = new MenuRegistry<Context>();
      const template = new MenuTemplate<Context>();

      // Add 20 rows with one button each
      for (let i = 0; i < 20; i++) {
        template.cb(`Row ${i}`, async () => {}).row();
      }

      registry.register("tall", template);
      const menu = registry.menu("tall");

      expect(menu.inline_keyboard).toHaveLength(20);
      menu.inline_keyboard.forEach((row) => {
        expect(row).toHaveLength(1);
      });
    });
  });

  describe("Callback data generation", () => {
    it("should generate unique callback data for each button position", () => {
      const template = new MenuTemplate<Context>()
        .cb("A", async () => {})
        .cb("B", async () => {})
        .cb("C", async () => {})
        .row()
        .cb("D", async () => {})
        .cb("E", async () => {})
        .row()
        .cb("F", async () => {});

      const registry = new MenuRegistry<Context>();
      registry.register("test", template);
      const menu = registry.menu("test");

      const renderedId = menu.renderedMenuId;

      // Check callback data format: renderedMenuId:row:col
      expect(menu.inline_keyboard[0][0]).toHaveProperty(
        "callback_data",
        `${renderedId}:0:0`,
      );
      expect(menu.inline_keyboard[0][1]).toHaveProperty(
        "callback_data",
        `${renderedId}:0:1`,
      );
      expect(menu.inline_keyboard[0][2]).toHaveProperty(
        "callback_data",
        `${renderedId}:0:2`,
      );
      expect(menu.inline_keyboard[1][0]).toHaveProperty(
        "callback_data",
        `${renderedId}:1:0`,
      );
      expect(menu.inline_keyboard[1][1]).toHaveProperty(
        "callback_data",
        `${renderedId}:1:1`,
      );
      expect(menu.inline_keyboard[2][0]).toHaveProperty(
        "callback_data",
        `${renderedId}:2:0`,
      );
    });

    it("should preserve raw callback data", () => {
      const template = new MenuTemplate<Context>()
        .rawCb("Raw Button", "my-custom-data")
        .cb("Managed Button", async () => {});

      const registry = new MenuRegistry<Context>();
      registry.register("test", template);
      const menu = registry.menu("test");

      // Raw button keeps its custom callback data
      expect(menu.inline_keyboard[0][0]).toHaveProperty(
        "callback_data",
        "my-custom-data",
      );

      // Managed button gets generated callback data
      const managedButton = menu.inline_keyboard[0][1];
      if ("callback_data" in managedButton) {
        expect(managedButton.callback_data).toContain(menu.renderedMenuId);
      }
    });
  });
});
