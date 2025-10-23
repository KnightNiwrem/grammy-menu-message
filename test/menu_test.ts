import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import type { Context } from "grammy";
import { Menu } from "../src/menu.ts";

describe("Menu", () => {
  describe("constructor", () => {
    it("should create a menu with an id", () => {
      const menu = new Menu("test-menu");
      expect(menu).toBeDefined();
    });
  });

  describe("text", () => {
    it("should add a button to the menu", () => {
      const menu = new Menu("test");
      menu.text("Button 1", () => {});

      const keyboard = menu.inline_keyboard;
      expect(keyboard).toHaveLength(1);
      expect(keyboard[0]).toHaveLength(1);
      expect(keyboard[0][0].text).toBe("Button 1");
    });

    it("should add multiple buttons to the same row", () => {
      const menu = new Menu("test");
      menu.text("Button 1", () => {});
      menu.text("Button 2", () => {});

      const keyboard = menu.inline_keyboard;
      expect(keyboard).toHaveLength(1);
      expect(keyboard[0]).toHaveLength(2);
      expect(keyboard[0][0].text).toBe("Button 1");
      expect(keyboard[0][1].text).toBe("Button 2");
    });

    it("should support method chaining", () => {
      const menu = new Menu("test");
      const result = menu.text("Button", () => {});
      expect(result).toBe(menu);
    });
  });

  describe("row", () => {
    it("should start a new row", () => {
      const menu = new Menu("test");
      menu.text("Row 1 Button 1", () => {});
      menu.row();
      menu.text("Row 2 Button 1", () => {});

      const keyboard = menu.inline_keyboard;
      expect(keyboard).toHaveLength(2);
      expect(keyboard[0]).toHaveLength(1);
      expect(keyboard[1]).toHaveLength(1);
    });

    it("should support method chaining", () => {
      const menu = new Menu("test");
      const result = menu.row();
      expect(result).toBe(menu);
    });
  });

  describe("inline_keyboard", () => {
    it("should generate correct callback_data format", () => {
      const menu = new Menu("main");
      menu.text("Button 1", () => {});
      menu.text("Button 2", () => {});
      menu.row();
      menu.text("Button 3", () => {});

      const keyboard = menu.inline_keyboard;
      expect(keyboard[0][0].callback_data).toBe("main:0:0");
      expect(keyboard[0][1].callback_data).toBe("main:0:1");
      expect(keyboard[1][0].callback_data).toBe("main:1:0");
    });

    it("should generate a 2D array of InlineKeyboardButton objects", () => {
      const menu = new Menu("test");
      menu.text("A", () => {});
      menu.text("B", () => {});
      menu.row();
      menu.text("C", () => {});

      const keyboard = menu.inline_keyboard;
      expect(keyboard).toHaveLength(2);
      expect(keyboard[0]).toHaveLength(2);
      expect(keyboard[1]).toHaveLength(1);

      keyboard.forEach((row) => {
        row.forEach((button) => {
          expect(button).toHaveProperty("text");
          expect(button).toHaveProperty("callback_data");
        });
      });
    });
  });

  describe("middleware", () => {
    it("should handle matching callback queries", async () => {
      const menu = new Menu("test");
      let called = false;

      menu.text("Click me", () => {
        called = true;
      });

      const middleware = menu.middleware();

      const ctx = {
        callbackQuery: {
          data: "test:0:0",
        },
        answerCallbackQuery: async () => {},
      } as unknown as Context;

      const next = () => Promise.resolve();

      await middleware(ctx, next);

      expect(called).toBe(true);
    });

    it("should call next for non-matching callback queries", async () => {
      const menu = new Menu("test");
      menu.text("Button", () => {});

      const middleware = menu.middleware();

      const ctx = {
        callbackQuery: {
          data: "other-menu:0:0",
        },
      } as unknown as Context;

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
        return Promise.resolve();
      };

      await middleware(ctx, next);

      expect(nextCalled).toBe(true);
    });

    it("should call next when there is no callback query", async () => {
      const menu = new Menu("test");
      menu.text("Button", () => {});

      const middleware = menu.middleware();

      const ctx = {} as Context;

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
        return Promise.resolve();
      };

      await middleware(ctx, next);

      expect(nextCalled).toBe(true);
    });

    it("should answer callback query before calling handler", async () => {
      const menu = new Menu("test");
      const callOrder: string[] = [];

      menu.text("Button", () => {
        callOrder.push("handler");
      });

      const middleware = menu.middleware();

      const ctx = {
        callbackQuery: {
          data: "test:0:0",
        },
        answerCallbackQuery: () => {
          callOrder.push("answer");
        },
      } as unknown as Context;

      const next = () => Promise.resolve();

      await middleware(ctx, next);

      expect(callOrder).toEqual(["answer", "handler"]);
    });

    it("should handle multiple rows and columns", async () => {
      const menu = new Menu("test");
      const results: string[] = [];

      menu.text("A", () => {
        results.push("A");
      });
      menu.text("B", () => {
        results.push("B");
      });
      menu.row();
      menu.text("C", () => {
        results.push("C");
      });

      const middleware = menu.middleware();

      // Test button A (0:0)
      await middleware(
        {
          callbackQuery: { data: "test:0:0" },
          answerCallbackQuery: async () => {},
        } as unknown as Context,
        () => Promise.resolve(),
      );

      // Test button B (0:1)
      await middleware(
        {
          callbackQuery: { data: "test:0:1" },
          answerCallbackQuery: async () => {},
        } as unknown as Context,
        () => Promise.resolve(),
      );

      // Test button C (1:0)
      await middleware(
        {
          callbackQuery: { data: "test:1:0" },
          answerCallbackQuery: async () => {},
        } as unknown as Context,
        () => Promise.resolve(),
      );

      expect(results).toEqual(["A", "B", "C"]);
    });

    it("should pass context to button callback", async () => {
      const menu = new Menu<Context>("test");
      let receivedCtx: Context | undefined;

      menu.text("Button", (ctx) => {
        receivedCtx = ctx;
      });

      const middleware = menu.middleware();

      const testCtx = {
        callbackQuery: { data: "test:0:0" },
        answerCallbackQuery: async () => {},
        update: { update_id: 123 },
      } as unknown as Context;

      await middleware(testCtx, () => Promise.resolve());

      expect(receivedCtx).toBe(testCtx);
    });

    it("should handle invalid callback_data gracefully", async () => {
      const menu = new Menu("test");
      menu.text("Button", () => {});

      const middleware = menu.middleware();

      const invalidData = [
        "test:invalid:0", // Non-numeric row
        "test:0:invalid", // Non-numeric column
        "test:99:0", // Row out of bounds
        "test:0:99", // Column out of bounds
        "test", // Missing parts
        "test:0", // Missing column
        ":", // Empty parts
      ];

      for (const data of invalidData) {
        let nextCalled = false;
        const ctx = {
          callbackQuery: { data },
        } as unknown as Context;

        await middleware(ctx, () => {
          nextCalled = true;
          return Promise.resolve();
        });

        expect(nextCalled).toBe(true);
      }
    });
  });
});
