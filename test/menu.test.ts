import { Context, describe, expect, it } from "./deps.ts";
import type { InlineKeyboardButton } from "./deps.ts";
import { isMenu, Menu } from "../src/menu.ts";
import type { MenuButton } from "../src/types.ts";

describe("Menu", () => {
  const templateMenuId = "test-template";
  const renderedMenuId = "test-rendered";
  const messageText = "Test message";

  describe("constructor", () => {
    it("should create a Menu with all properties", () => {
      const menuKeyboard: MenuButton<Context>[][] = [[
        {
          text: "Button 1",
          callback_data: "test:0:0",
          handler: async () => {},
        },
      ]];
      const inlineKeyboard = [[{ text: "Button 1", callback_data: "test:0:0" }]];

      const menu = new Menu(templateMenuId, renderedMenuId, messageText, menuKeyboard, inlineKeyboard);

      expect(menu.templateMenuId).toBe(templateMenuId);
      expect(menu.renderedMenuId).toBe(renderedMenuId);
      expect(menu.messageText).toBe(messageText);
      expect(menu.menuKeyboard).toBe(menuKeyboard);
    });

    it("should store readonly properties", () => {
      const menuKeyboard: MenuButton<Context>[][] = [];
      const inlineKeyboard: InlineKeyboardButton[][] = [];

      const menu = new Menu(templateMenuId, renderedMenuId, messageText, menuKeyboard, inlineKeyboard);

      // TypeScript should prevent reassignment, but verify properties exist
      expect(menu.templateMenuId).toBeDefined();
      expect(menu.renderedMenuId).toBeDefined();
      expect(menu.menuKeyboard).toBeDefined();
    });
  });

  describe("inline_keyboard getter", () => {
    it("should return the inline keyboard", () => {
      const inlineKeyboard = [[
        { text: "Button 1", callback_data: "test:0:0" },
        { text: "Button 2", url: "https://example.com" },
      ]];
      const menuKeyboard: MenuButton<Context>[][] = [[
        {
          text: "Button 1",
          callback_data: "test:0:0",
          handler: async () => {},
        },
        { text: "Button 2", url: "https://example.com" },
      ]];

      const menu = new Menu(templateMenuId, renderedMenuId, messageText, menuKeyboard, inlineKeyboard);

      expect(menu.inline_keyboard).toBe(inlineKeyboard);
      expect(menu.inline_keyboard).toEqual(inlineKeyboard);
    });

    it("should return empty array for empty keyboard", () => {
      const menu = new Menu(templateMenuId, renderedMenuId, messageText, [], []);

      expect(menu.inline_keyboard).toEqual([]);
    });

    it("should handle multi-row keyboards", () => {
      const inlineKeyboard = [
        [{ text: "Row 1, Col 1", callback_data: "r1c1" }],
        [{ text: "Row 2, Col 1", callback_data: "r2c1" }, { text: "Row 2, Col 2", callback_data: "r2c2" }],
      ];
      const menuKeyboard: MenuButton<Context>[][] = [
        [{ text: "Row 1, Col 1", callback_data: "r1c1", handler: async () => {} }],
        [
          { text: "Row 2, Col 1", callback_data: "r2c1", handler: async () => {} },
          { text: "Row 2, Col 2", callback_data: "r2c2", handler: async () => {} },
        ],
      ];

      const menu = new Menu(templateMenuId, renderedMenuId, messageText, menuKeyboard, inlineKeyboard);

      expect(menu.inline_keyboard.length).toBe(2);
      expect(menu.inline_keyboard[0].length).toBe(1);
      expect(menu.inline_keyboard[1].length).toBe(2);
    });
  });

  describe("Menu compatibility with grammY", () => {
    it("should have inline_keyboard property for reply_markup", () => {
      const inlineKeyboard = [[{ text: "Test", callback_data: "test" }]];
      const menu = new Menu(templateMenuId, renderedMenuId, messageText, [], inlineKeyboard);

      // Should be usable as reply_markup
      const replyMarkup = { inline_keyboard: menu.inline_keyboard };
      expect(replyMarkup.inline_keyboard).toEqual(inlineKeyboard);
    });
  });

  describe("isMenu type guard", () => {
    it("should return true for Menu instances", () => {
      const menu = new Menu(templateMenuId, renderedMenuId, messageText, [], []);
      expect(isMenu(menu)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isMenu(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isMenu(undefined)).toBe(false);
    });

    it("should return false for strings", () => {
      expect(isMenu("not a menu")).toBe(false);
    });

    it("should return false for numbers", () => {
      expect(isMenu(42)).toBe(false);
    });

    it("should return false for plain objects", () => {
      expect(isMenu({ text: "button" })).toBe(false);
    });

    it("should return false for objects with partial Menu properties", () => {
      expect(isMenu({
        templateMenuId: "test",
        renderedMenuId: "test",
      })).toBe(false);
    });

    it("should return false for objects with wrong property types", () => {
      expect(isMenu({
        templateMenuId: 123, // should be string
        renderedMenuId: "test",
        messageText: "text",
        menuKeyboard: [],
        inline_keyboard: [],
      })).toBe(false);
    });

    it("should return true for objects with all required Menu properties", () => {
      const menuLike = {
        templateMenuId: "test-template",
        renderedMenuId: "test-rendered",
        messageText: "Test message",
        menuKeyboard: [],
        inline_keyboard: [],
      };
      expect(isMenu(menuLike)).toBe(true);
    });

    it("should allow type narrowing in conditionals", () => {
      const menu = new Menu(templateMenuId, renderedMenuId, messageText, [], []);
      const input: unknown = menu;

      if (isMenu(input)) {
        // TypeScript should allow these accesses without type assertion
        expect(input.templateMenuId).toBe(templateMenuId);
        expect(input.renderedMenuId).toBe(renderedMenuId);
        expect(input.messageText).toBe(messageText);
      }
    });
  });
});
