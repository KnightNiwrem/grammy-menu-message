import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { MenuTemplate } from "../src/template.ts";
import type { Context } from "grammy";

describe("MenuTemplate", () => {
  describe("button methods", () => {
    it("should add callback button with rawCb", () => {
      const template = new MenuTemplate<Context>();
      const result = template.rawCb("Click me", "callback_data");

      expect(result).toBe(template); // Check chaining
      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard[0][0].text).toBe("Click me");
      expect(menu.inline_keyboard[0][0]).toHaveProperty(
        "callback_data",
        "callback_data",
      );
    });

    it("should add callback button with middleware using cb", () => {
      const template = new MenuTemplate<Context>();
      const handler = async () => {};
      const result = template.cb("Button", handler);

      expect(result).toBe(template);
      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard[0][0].text).toBe("Button");
      expect(menu.menuKeyboard[0][0].handler).toBe(handler);
    });

    it("should add callback button with payload", () => {
      const template = new MenuTemplate<Context>();
      const handler = async () => {};
      template.cb("Button", handler, "custom-payload");

      const menu = template.render("tmpl", "rend");
      expect(menu.menuKeyboard[0][0].payload).toBe("custom-payload");
    });

    it("should add URL button", () => {
      const template = new MenuTemplate<Context>();
      const result = template.url("GitHub", "https://github.com");

      expect(result).toBe(template);
      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard[0][0].text).toBe("GitHub");
      expect(menu.inline_keyboard[0][0]).toHaveProperty(
        "url",
        "https://github.com",
      );
    });

    it("should add web app button with string URL", () => {
      const template = new MenuTemplate<Context>();
      template.webApp("Open App", "https://example.com/app");

      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard[0][0].text).toBe("Open App");
      expect(menu.inline_keyboard[0][0]).toHaveProperty("web_app");
      const button = menu.inline_keyboard[0][0];
      if ("web_app" in button) {
        expect(button.web_app.url).toBe("https://example.com/app");
      }
    });

    it("should add web app button with WebAppInfo object", () => {
      const template = new MenuTemplate<Context>();
      template.webApp("Open App", { url: "https://example.com/app" });

      const menu = template.render("tmpl", "rend");
      const button = menu.inline_keyboard[0][0];
      if ("web_app" in button) {
        expect(button.web_app.url).toBe("https://example.com/app");
      }
    });

    it("should add login button with string URL", () => {
      const template = new MenuTemplate<Context>();
      template.login("Login", "https://example.com/login");

      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard[0][0].text).toBe("Login");
      const button = menu.inline_keyboard[0][0];
      if ("login_url" in button) {
        expect(button.login_url.url).toBe("https://example.com/login");
      }
    });

    it("should add login button with LoginUrl object", () => {
      const template = new MenuTemplate<Context>();
      template.login("Login", {
        url: "https://example.com/login",
        forward_text: "Login to proceed",
      });

      const menu = template.render("tmpl", "rend");
      const button = menu.inline_keyboard[0][0];
      if ("login_url" in button) {
        expect(button.login_url.url).toBe("https://example.com/login");
        expect(button.login_url.forward_text).toBe("Login to proceed");
      }
    });

    it("should add switch inline query button", () => {
      const template = new MenuTemplate<Context>();
      template.switchInline("Share", "query text");

      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard[0][0].text).toBe("Share");
      const button = menu.inline_keyboard[0][0];
      if ("switch_inline_query" in button) {
        expect(button.switch_inline_query).toBe("query text");
      }
    });

    it("should add switch inline query button with empty query", () => {
      const template = new MenuTemplate<Context>();
      template.switchInline("Share");

      const menu = template.render("tmpl", "rend");
      const button = menu.inline_keyboard[0][0];
      if ("switch_inline_query" in button) {
        expect(button.switch_inline_query).toBe("");
      }
    });

    it("should add switch inline query current chat button", () => {
      const template = new MenuTemplate<Context>();
      template.switchInlineCurrent("Search here", "search query");

      const menu = template.render("tmpl", "rend");
      const button = menu.inline_keyboard[0][0];
      if ("switch_inline_query_current_chat" in button) {
        expect(button.switch_inline_query_current_chat).toBe("search query");
      }
    });

    it("should add switch inline query chosen chat button", () => {
      const template = new MenuTemplate<Context>();
      template.switchInlineChosen("Choose chat", {
        allow_user_chats: true,
        allow_bot_chats: false,
      });

      const menu = template.render("tmpl", "rend");
      const button = menu.inline_keyboard[0][0];
      if ("switch_inline_query_chosen_chat" in button) {
        expect(button.switch_inline_query_chosen_chat.allow_user_chats).toBe(
          true,
        );
        expect(button.switch_inline_query_chosen_chat.allow_bot_chats).toBe(
          false,
        );
      }
    });

    it("should add switch inline query chosen chat button with default empty object", () => {
      const template = new MenuTemplate<Context>();
      template.switchInlineChosen("Choose chat");

      const menu = template.render("tmpl", "rend");
      const button = menu.inline_keyboard[0][0];
      expect(button).toHaveProperty("switch_inline_query_chosen_chat");
    });

    it("should add copy text button with string", () => {
      const template = new MenuTemplate<Context>();
      template.copyText("Copy", "Text to copy");

      const menu = template.render("tmpl", "rend");
      const button = menu.inline_keyboard[0][0];
      if ("copy_text" in button) {
        expect(button.copy_text.text).toBe("Text to copy");
      }
    });

    it("should add copy text button with CopyTextButton object", () => {
      const template = new MenuTemplate<Context>();
      template.copyText("Copy", { text: "Text to copy" });

      const menu = template.render("tmpl", "rend");
      const button = menu.inline_keyboard[0][0];
      if ("copy_text" in button) {
        expect(button.copy_text.text).toBe("Text to copy");
      }
    });

    it("should add game button", () => {
      const template = new MenuTemplate<Context>();
      template.game("Play Game");

      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard[0][0].text).toBe("Play Game");
      const button = menu.inline_keyboard[0][0];
      expect(button).toHaveProperty("callback_game");
    });

    it("should add pay button", () => {
      const template = new MenuTemplate<Context>();
      template.pay("Pay Now");

      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard[0][0].text).toBe("Pay Now");
      const button = menu.inline_keyboard[0][0];
      if ("pay" in button) {
        expect(button.pay).toBe(true);
      }
    });
  });

  describe("row method", () => {
    it("should create new rows", () => {
      const template = new MenuTemplate<Context>();
      template
        .rawCb("Button 1", "cb1")
        .rawCb("Button 2", "cb2")
        .row()
        .rawCb("Button 3", "cb3");

      const menu = template.render("tmpl", "rend");
      expect(menu.inline_keyboard).toHaveLength(2);
      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect(menu.inline_keyboard[1]).toHaveLength(1);
    });

    it("should handle multiple consecutive row calls", () => {
      const template = new MenuTemplate<Context>();
      template
        .rawCb("Button 1", "cb1")
        .row()
        .row()
        .rawCb("Button 2", "cb2");

      const menu = template.render("tmpl", "rend");
      // Consecutive rows should not create empty rows
      expect(menu.inline_keyboard).toHaveLength(2);
    });

    it("should support method chaining", () => {
      const template = new MenuTemplate<Context>();
      const result = template
        .rawCb("A", "a")
        .row()
        .rawCb("B", "b");

      expect(result).toBe(template);
    });
  });

  describe("render method", () => {
    it("should generate unique callback_data for cb buttons", () => {
      const template = new MenuTemplate<Context>();
      const handler = async () => {};
      template
        .cb("Btn1", handler)
        .cb("Btn2", handler)
        .row()
        .cb("Btn3", handler);

      const renderedMenuId = "test-rendered-123";
      const menu = template.render("tmpl", renderedMenuId);

      expect(menu.inline_keyboard[0][0]).toHaveProperty(
        "callback_data",
        `${renderedMenuId}:0:0`,
      );
      expect(menu.inline_keyboard[0][1]).toHaveProperty(
        "callback_data",
        `${renderedMenuId}:0:1`,
      );
      expect(menu.inline_keyboard[1][0]).toHaveProperty(
        "callback_data",
        `${renderedMenuId}:1:0`,
      );
    });

    it("should create separate Menu instances on each render", () => {
      const template = new MenuTemplate<Context>();
      template.rawCb("Button", "cb");

      const menu1 = template.render("tmpl", "rend1");
      const menu2 = template.render("tmpl", "rend2");

      expect(menu1).not.toBe(menu2);
      expect(menu1.inline_keyboard).not.toBe(menu2.inline_keyboard);
      expect(menu1.renderedMenuId).toBe("rend1");
      expect(menu2.renderedMenuId).toBe("rend2");
    });

    it("should handle empty template", () => {
      const template = new MenuTemplate<Context>();
      const menu = template.render("tmpl", "rend");

      expect(menu.inline_keyboard).toEqual([]);
      expect(menu.menuKeyboard).toEqual([]);
    });

    it("should handle template with only row calls", () => {
      const template = new MenuTemplate<Context>();
      template.row().row();

      const menu = template.render("tmpl", "rend");

      expect(menu.inline_keyboard).toEqual([]);
    });

    it("should properly separate inline and menu keyboards", () => {
      const template = new MenuTemplate<Context>();
      const handler = async () => {};
      template
        .cb("CB Button", handler)
        .url("URL Button", "https://example.com");

      const menu = template.render("tmpl", "rend");

      // Inline keyboard should have callback_data for cb button
      expect(menu.inline_keyboard[0][0]).toHaveProperty("callback_data");
      expect(menu.inline_keyboard[0][1]).toHaveProperty("url");

      // Menu keyboard should have handler for cb button
      expect(menu.menuKeyboard[0][0].handler).toBe(handler);
      // URL button doesn't have handler
      expect(menu.menuKeyboard[0][1]).not.toHaveProperty("handler");
    });

    it("should handle complex keyboard layout", () => {
      const template = new MenuTemplate<Context>();
      const handler = async () => {};

      template
        .cb("A", handler)
        .cb("B", handler)
        .cb("C", handler)
        .row()
        .url("D", "https://d.com")
        .url("E", "https://e.com")
        .row()
        .rawCb("F", "f-data")
        .row()
        .webApp("G", "https://g.com");

      const menu = template.render("tmpl", "rend-xyz");

      expect(menu.inline_keyboard).toHaveLength(4);
      expect(menu.inline_keyboard[0]).toHaveLength(3);
      expect(menu.inline_keyboard[1]).toHaveLength(2);
      expect(menu.inline_keyboard[2]).toHaveLength(1);
      expect(menu.inline_keyboard[3]).toHaveLength(1);

      // Check callback data generation
      expect(menu.inline_keyboard[0][0]).toHaveProperty(
        "callback_data",
        "rend-xyz:0:0",
      );
      expect(menu.inline_keyboard[0][1]).toHaveProperty(
        "callback_data",
        "rend-xyz:0:1",
      );
      expect(menu.inline_keyboard[0][2]).toHaveProperty(
        "callback_data",
        "rend-xyz:0:2",
      );
    });

    it("should preserve button labels", () => {
      const template = new MenuTemplate<Context>();
      template
        .cb("Label 1", async () => {})
        .url("Label 2", "https://example.com")
        .rawCb("Label 3", "cb3");

      const menu = template.render("tmpl", "rend");

      expect(menu.inline_keyboard[0][0].text).toBe("Label 1");
      expect(menu.inline_keyboard[0][1].text).toBe("Label 2");
      expect(menu.inline_keyboard[0][2].text).toBe("Label 3");
    });

    it("should use provided templateMenuId and renderedMenuId", () => {
      const template = new MenuTemplate<Context>();
      template.rawCb("Button", "cb");

      const menu = template.render("my-template", "my-rendered-123");

      expect(menu.templateMenuId).toBe("my-template");
      expect(menu.renderedMenuId).toBe("my-rendered-123");
    });
  });

  describe("method chaining", () => {
    it("should support chaining all button methods", () => {
      const template = new MenuTemplate<Context>();

      const result = template
        .rawCb("A", "a")
        .cb("B", async () => {})
        .url("C", "https://c.com")
        .webApp("D", "https://d.com")
        .login("E", "https://e.com")
        .switchInline("F")
        .switchInlineCurrent("G")
        .switchInlineChosen("H")
        .copyText("I", "text")
        .game("J")
        .pay("K")
        .row();

      expect(result).toBe(template);
    });

    it("should allow building complex menus with chaining", () => {
      const template = new MenuTemplate<Context>();
      const handler = async () => {};

      template
        .cb("Option 1", handler)
        .cb("Option 2", handler)
        .row()
        .cb("Back", handler)
        .url("Help", "https://help.example.com");

      const menu = template.render("tmpl", "rend");

      expect(menu.inline_keyboard).toHaveLength(2);
      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect(menu.inline_keyboard[1]).toHaveLength(2);
    });
  });
});
