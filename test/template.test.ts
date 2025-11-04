import { Context, describe, expect, it } from "./deps.ts";
import { TextMenuTemplate } from "../src/template.ts";

describe("TextMenuTemplate", () => {
  describe("button methods", () => {
    it("should add rawCb button", () => {
      const template = new TextMenuTemplate<Context>("Test message").rawCb("Test", "callback_data");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Test", callback_data: "callback_data" }]]);
    });

    it("should add cb button with handler", async () => {
      let handlerCalled = false;
      const handler = async () => {
        await Promise.resolve();
        handlerCalled = true;
      };

      const template = new TextMenuTemplate<Context>("Test message").cb("Test", handler);
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard[0][0].text).toBe("Test");
      expect(menu.inline_keyboard[0][0]).toHaveProperty("callback_data");
      expect(menu.menuKeyboard[0][0]).toHaveProperty("handler");

      // Verify handler is stored
      const button = menu.menuKeyboard[0][0];
      if ("handler" in button) {
        await button.handler({} as Context, async () => {});
        expect(handlerCalled).toBe(true);
      }
    });

    it("should add url button", () => {
      const template = new TextMenuTemplate<Context>("Test message").url("Visit", "https://example.com");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Visit", url: "https://example.com" }]]);
    });

    it("should add webApp button with string URL", () => {
      const template = new TextMenuTemplate<Context>("Test message").webApp("Open App", "https://app.example.com");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Open App", web_app: { url: "https://app.example.com" } }]]);
    });

    it("should add webApp button with WebAppInfo object", () => {
      const webAppInfo = { url: "https://app.example.com" };
      const template = new TextMenuTemplate<Context>("Test message").webApp("Open App", webAppInfo);
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Open App", web_app: webAppInfo }]]);
    });

    it("should add login button with string URL", () => {
      const template = new TextMenuTemplate<Context>("Test message").login("Login", "https://example.com/login");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Login", login_url: { url: "https://example.com/login" } }]]);
    });

    it("should add login button with LoginUrl object", () => {
      const loginUrl = { url: "https://example.com/login", forward_text: "Login with example.com" };
      const template = new TextMenuTemplate<Context>("Test message").login("Login", loginUrl);
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Login", login_url: loginUrl }]]);
    });

    it("should add switchInline button", () => {
      const template = new TextMenuTemplate<Context>("Test message").switchInline("Share", "test query");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Share", switch_inline_query: "test query" }]]);
    });

    it("should add switchInline button with default empty query", () => {
      const template = new TextMenuTemplate<Context>("Test message").switchInline("Share");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Share", switch_inline_query: "" }]]);
    });

    it("should add switchInlineCurrent button", () => {
      const template = new TextMenuTemplate<Context>("Test message").switchInlineCurrent("Insert", "inline query");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Insert", switch_inline_query_current_chat: "inline query" }]]);
    });

    it("should add switchInlineChosen button", () => {
      const query = { allow_user_chats: true };
      const template = new TextMenuTemplate<Context>("Test message").switchInlineChosen("Choose", query);
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Choose", switch_inline_query_chosen_chat: query }]]);
    });

    it("should add switchInlineChosen button with default empty query", () => {
      const template = new TextMenuTemplate<Context>("Test message").switchInlineChosen("Choose");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Choose", switch_inline_query_chosen_chat: {} }]]);
    });

    it("should add copyText button with string", () => {
      const template = new TextMenuTemplate<Context>("Test message").copyText("Copy", "Text to copy");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Copy", copy_text: { text: "Text to copy" } }]]);
    });

    it("should add copyText button with CopyTextButton object", () => {
      const copyTextButton = { text: "Text to copy" };
      const template = new TextMenuTemplate<Context>("Test message").copyText("Copy", copyTextButton);
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Copy", copy_text: copyTextButton }]]);
    });

    it("should add game button", () => {
      const template = new TextMenuTemplate<Context>("Test message").game("Play Game");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Play Game", callback_game: {} }]]);
    });

    it("should add pay button", () => {
      const template = new TextMenuTemplate<Context>("Test message").pay("Pay Now");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([[{ text: "Pay Now", pay: true }]]);
    });
  });

  describe("row method", () => {
    it("should create a new row", () => {
      const template = new TextMenuTemplate<Context>("Test message")
        .cb("Button 1", async () => {})
        .row()
        .cb("Button 2", async () => {});

      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard.length).toBe(2);
      expect(menu.inline_keyboard[0].length).toBe(1);
      expect(menu.inline_keyboard[1].length).toBe(1);
    });

    it("should allow multiple buttons in the same row", () => {
      const template = new TextMenuTemplate<Context>("Test message")
        .cb("Button 1", async () => {})
        .cb("Button 2", async () => {})
        .row()
        .cb("Button 3", async () => {});

      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard.length).toBe(2);
      expect(menu.inline_keyboard[0].length).toBe(2);
      expect(menu.inline_keyboard[1].length).toBe(1);
    });

    it("should handle consecutive row calls", () => {
      const template = new TextMenuTemplate<Context>("Test message")
        .cb("Button 1", async () => {})
        .row()
        .row()
        .cb("Button 2", async () => {});

      const menu = template.render("template", "rendered");

      // Empty rows should be ignored
      expect(menu.inline_keyboard.length).toBe(2);
    });

    it("should return this for method chaining", () => {
      const template = new TextMenuTemplate<Context>("Test message");
      const result = template.row();
      expect(result).toBe(template);
    });
  });

  describe("render method", () => {
    it("should render a menu with correct IDs", () => {
      const template = new TextMenuTemplate<Context>("Test message").cb("Test", async () => {});
      const menu = template.render("my-template", "my-rendered");

      expect(menu.templateMenuId).toBe("my-template");
      expect(menu.renderedMenuId).toBe("my-rendered");
    });

    it("should generate unique callback_data for each button", () => {
      const template = new TextMenuTemplate<Context>("Test message")
        .cb("B1", async () => {})
        .cb("B2", async () => {})
        .row()
        .cb("B3", async () => {});

      const menu = template.render("template", "rendered-id");

      const btn1 = menu.inline_keyboard[0][0];
      const btn2 = menu.inline_keyboard[0][1];
      const btn3 = menu.inline_keyboard[1][0];

      if ("callback_data" in btn1) {
        expect(btn1.callback_data).toBe("rendered-id:0:0");
      }
      if ("callback_data" in btn2) {
        expect(btn2.callback_data).toBe("rendered-id:0:1");
      }
      if ("callback_data" in btn3) {
        expect(btn3.callback_data).toBe("rendered-id:1:0");
      }
    });

    it("should not modify native buttons' callback_data", () => {
      const template = new TextMenuTemplate<Context>("Test message").rawCb("Raw", "my-data");
      const menu = template.render("template", "rendered");

      const btn = menu.inline_keyboard[0][0];
      if ("callback_data" in btn) {
        expect(btn.callback_data).toBe("my-data");
      }
    });

    it("should handle empty template", () => {
      const template = new TextMenuTemplate<Context>("Test message");
      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard).toEqual([]);
      expect(menu.menuKeyboard).toEqual([]);
    });

    it("should create separate instances on multiple renders", () => {
      const template = new TextMenuTemplate<Context>("Test message").cb("Test", async () => {});

      const menu1 = template.render("template", "render1");
      const menu2 = template.render("template", "render2");

      expect(menu1.renderedMenuId).not.toBe(menu2.renderedMenuId);
      expect(menu1.inline_keyboard).not.toBe(menu2.inline_keyboard);
      expect(menu1.menuKeyboard).not.toBe(menu2.menuKeyboard);
    });

    it("should preserve handler references in menuKeyboard", () => {
      const handler = async () => {};
      const template = new TextMenuTemplate<Context>("Test message").cb("Test", handler);
      const menu = template.render("template", "rendered");

      const button = menu.menuKeyboard[0][0];
      if ("handler" in button) {
        expect(button.handler).toBe(handler);
      } else {
        throw new Error("Expected handler in button");
      }
    });

    it("should include payload in menuButton when provided", () => {
      const template = new TextMenuTemplate<Context>("Test message").cb("Test", async () => {}, "my-payload");
      const menu = template.render("template", "rendered");

      const button = menu.menuKeyboard[0][0];
      if ("payload" in button) {
        expect(button.payload).toBe("my-payload");
      }
    });

    it("should finalize last row even without explicit row() call", () => {
      const template = new TextMenuTemplate<Context>("Test message")
        .cb("Button 1", async () => {})
        .cb("Button 2", async () => {});

      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard.length).toBe(1);
      expect(menu.inline_keyboard[0].length).toBe(2);
    });
  });

  describe("method chaining", () => {
    it("should support fluent interface", () => {
      const template = new TextMenuTemplate<Context>("Test message")
        .cb("B1", async () => {})
        .cb("B2", async () => {})
        .row()
        .url("B3", "https://example.com")
        .row()
        .webApp("B4", "https://app.com");

      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard.length).toBe(3);
    });
  });

  describe("mixed button types", () => {
    it("should handle menu buttons and native buttons in the same row", () => {
      const template = new TextMenuTemplate<Context>("Test message")
        .cb("Callback", async () => {})
        .url("URL", "https://example.com")
        .rawCb("Raw", "raw-data");

      const menu = template.render("template", "rendered");

      expect(menu.inline_keyboard[0].length).toBe(3);
      expect(menu.inline_keyboard[0][0]).toHaveProperty("callback_data");
      expect(menu.inline_keyboard[0][1]).toHaveProperty("url");

      const btn = menu.inline_keyboard[0][2];
      if ("callback_data" in btn) {
        expect(btn.callback_data).toBe("raw-data");
      }
    });
  });
});
