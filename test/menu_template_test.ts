import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { MenuTemplate } from "../src/template.ts";

describe("MenuTemplate", () => {
  describe("rawCb method", () => {
    it("should add a callback button to the current row", () => {
      const template = new MenuTemplate();
      template.rawCb("Click me", "btn_1");
      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(1);
      expect(menu.inline_keyboard[0]).toHaveLength(1);
      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Click me",
        callback_data: "btn_1",
      });
    });

    it("should allow method chaining", () => {
      const template = new MenuTemplate();
      const result = template.rawCb("Button", "data");
      expect(result).toBe(template);
    });

    it("should add multiple buttons in the same row", () => {
      const template = new MenuTemplate();
      template.rawCb("Left", "left").rawCb("Right", "right");
      const menu = template.render();

      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect(
        (menu.inline_keyboard[0][0] as { callback_data?: string })
          .callback_data,
      ).toBe("left");
      expect(
        (menu.inline_keyboard[0][1] as { callback_data?: string })
          .callback_data,
      ).toBe("right");
    });
  });

  describe("url method", () => {
    it("should add a URL button", () => {
      const template = new MenuTemplate();
      template.url("Visit", "https://example.com");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Visit",
        url: "https://example.com",
      });
    });

    it("should accept tg:// URLs", () => {
      const template = new MenuTemplate();
      template.url("Open", "tg://user?id=123");
      const menu = template.render();

      expect((menu.inline_keyboard[0][0] as { url?: string }).url).toBe(
        "tg://user?id=123",
      );
    });

    it("should allow chaining with other methods", () => {
      const template = new MenuTemplate();
      template.url("Link", "https://example.com").rawCb("Button", "data");
      const menu = template.render();

      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect((menu.inline_keyboard[0][0] as { url?: string }).url).toBe(
        "https://example.com",
      );
      expect(
        (menu.inline_keyboard[0][1] as { callback_data?: string })
          .callback_data,
      ).toBe("data");
    });
  });

  describe("webApp method", () => {
    it("should add a web app button with string URL", () => {
      const template = new MenuTemplate();
      template.webApp("Web App", "https://example.com/app");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Web App",
        web_app: { url: "https://example.com/app" },
      });
    });

    it("should add a web app button with WebAppInfo object", () => {
      const template = new MenuTemplate();
      template.webApp("Web App", { url: "https://example.com/app" });
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Web App",
        web_app: { url: "https://example.com/app" },
      });
    });
  });

  describe("login method", () => {
    it("should add a login button with string URL", () => {
      const template = new MenuTemplate();
      template.login("Login", "https://example.com/auth");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Login",
        login_url: { url: "https://example.com/auth" },
      });
    });

    it("should add a login button with LoginUrl object", () => {
      const template = new MenuTemplate();
      template.login("Login", {
        url: "https://example.com/auth",
        forward_text: "Login to Example",
      });
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Login",
        login_url: {
          url: "https://example.com/auth",
          forward_text: "Login to Example",
        },
      });
    });
  });

  describe("switchInline method", () => {
    it("should add a switch inline button with empty query", () => {
      const template = new MenuTemplate();
      template.switchInline("Share");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Share",
        switch_inline_query: "",
      });
    });

    it("should add a switch inline button with query", () => {
      const template = new MenuTemplate();
      template.switchInline("Search", "cats");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Search",
        switch_inline_query: "cats",
      });
    });
  });

  describe("switchInlineCurrent method", () => {
    it("should add a switch inline current button with empty query", () => {
      const template = new MenuTemplate();
      template.switchInlineCurrent("Share");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Share",
        switch_inline_query_current_chat: "",
      });
    });

    it("should add a switch inline current button with query", () => {
      const template = new MenuTemplate();
      template.switchInlineCurrent("Share Here", "dogs");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Share Here",
        switch_inline_query_current_chat: "dogs",
      });
    });
  });

  describe("switchInlineChosen method", () => {
    it("should add a switch inline chosen button with default query", () => {
      const template = new MenuTemplate();
      template.switchInlineChosen("Choose Chat");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Choose Chat",
        switch_inline_query_chosen_chat: {},
      });
    });

    it("should add a switch inline chosen button with custom query", () => {
      const template = new MenuTemplate();
      template.switchInlineChosen("Share", { allow_user_chats: true });
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Share",
        switch_inline_query_chosen_chat: { allow_user_chats: true },
      });
    });
  });

  describe("copyText method", () => {
    it("should add a copy text button with string", () => {
      const template = new MenuTemplate();
      template.copyText("Copy", "Hello, World!");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Copy",
        copy_text: { text: "Hello, World!" },
      });
    });

    it("should add a copy text button with CopyTextButton object", () => {
      const template = new MenuTemplate();
      template.copyText("Copy", { text: "Secret code: 12345" });
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Copy",
        copy_text: { text: "Secret code: 12345" },
      });
    });
  });

  describe("game method", () => {
    it("should add a game button", () => {
      const template = new MenuTemplate();
      template.game("Play Game");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Play Game",
        callback_game: {},
      });
    });
  });

  describe("pay method", () => {
    it("should add a payment button", () => {
      const template = new MenuTemplate();
      template.pay("Pay Now");
      const menu = template.render();

      expect(menu.inline_keyboard[0][0]).toEqual({
        text: "Pay Now",
        pay: true,
      });
    });
  });

  describe("row method", () => {
    it("should create a new row", () => {
      const template = new MenuTemplate();
      template.rawCb("First", "1").row().rawCb("Second", "2");
      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(2);
      expect(
        (menu.inline_keyboard[0][0] as { callback_data?: string })
          .callback_data,
      ).toBe("1");
      expect(
        (menu.inline_keyboard[1][0] as { callback_data?: string })
          .callback_data,
      ).toBe("2");
    });

    it("should not create empty rows", () => {
      const template = new MenuTemplate();
      template.rawCb("Button", "btn").row().row().rawCb("Next", "next");
      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(2);
    });

    it("should allow multiple buttons per row", () => {
      const template = new MenuTemplate();
      template
        .rawCb("A", "a")
        .rawCb("B", "b")
        .row()
        .rawCb("C", "c")
        .rawCb("D", "d");
      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(2);
      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect(menu.inline_keyboard[1]).toHaveLength(2);
    });
  });

  describe("render method", () => {
    it("should return a Menu instance", () => {
      const template = new MenuTemplate();
      template.rawCb("Test", "test");
      const menu = template.render();

      expect(menu).toHaveProperty("inline_keyboard");
    });

    it("should create fresh instance each time render is called", () => {
      const template = new MenuTemplate();
      template.rawCb("Button", "data");

      const menu1 = template.render();
      const menu2 = template.render();

      expect(menu1.inline_keyboard).not.toBe(menu2.inline_keyboard);
      expect(menu1.inline_keyboard).toEqual(menu2.inline_keyboard);
    });

    it("should handle empty template", () => {
      const template = new MenuTemplate();
      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(0);
    });

    it("should finalize pending row on render", () => {
      const template = new MenuTemplate();
      template.rawCb("A", "a").rawCb("B", "b");
      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(1);
      expect(menu.inline_keyboard[0]).toHaveLength(2);
    });
  });

  describe("complex scenarios", () => {
    it("should build a mixed button keyboard", () => {
      const template = new MenuTemplate();
      template
        .url("Website", "https://example.com")
        .rawCb("Callback", "data")
        .row()
        .switchInline("Share", "query")
        .game("Play")
        .row()
        .pay("Purchase");

      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(3);
      expect(menu.inline_keyboard[0]).toHaveLength(2);
      expect(menu.inline_keyboard[1]).toHaveLength(2);
      expect(menu.inline_keyboard[2]).toHaveLength(1);
    });

    it("should support full builder pattern chain", () => {
      const template = new MenuTemplate()
        .rawCb("Button 1", "1")
        .rawCb("Button 2", "2")
        .row()
        .url("Link", "https://example.com")
        .webApp("App", "https://example.com/app")
        .row()
        .switchInline("Share", "text")
        .switchInlineCurrent("Current", "")
        .row()
        .login("Login", "https://example.com/auth")
        .copyText("Copy", "text")
        .row()
        .game("Game")
        .pay("Pay");

      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(5);
    });

    it("should correctly structure multi-row keyboard", () => {
      const template = new MenuTemplate()
        .rawCb("1", "1")
        .rawCb("2", "2")
        .rawCb("3", "3")
        .row()
        .rawCb("4", "4")
        .rawCb("5", "5")
        .row()
        .rawCb("6", "6");

      const menu = template.render();

      expect(menu.inline_keyboard).toHaveLength(3);
      expect(menu.inline_keyboard[0]).toHaveLength(3);
      expect(menu.inline_keyboard[1]).toHaveLength(2);
      expect(menu.inline_keyboard[2]).toHaveLength(1);
    });
  });

  describe("immutability on render", () => {
    it("should not mutate template state when rendering multiple times", () => {
      const template = new MenuTemplate();
      template.rawCb("Button", "data").row();

      const menu1 = template.render();
      const menu2 = template.render();
      const menu3 = template.render();

      expect(menu1.inline_keyboard).toEqual(menu2.inline_keyboard);
      expect(menu2.inline_keyboard).toEqual(menu3.inline_keyboard);
      expect(menu1.inline_keyboard).not.toBe(menu2.inline_keyboard);
      expect(menu2.inline_keyboard).not.toBe(menu3.inline_keyboard);
    });
  });
});
