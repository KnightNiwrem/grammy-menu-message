import type { InlineKeyboardButton } from "./deps.ts";
import type { MenuButton } from "../src/types.ts";

import { Context, describe, expect, it } from "./deps.ts";
import { isMenu } from "../src/menu/base.ts";
import { Menu } from "../src/menu/menu.ts";

describe("Menu", () => {
  const templateMenuId = "test-template";
  const renderedMenuId = "test-rendered";
  const messageText = "Test message";

  describe("BaseMenu constructor", () => {
    it("should create a Menu with all properties", () => {
      const menuKeyboard: MenuButton<Context>[][] = [[
        {
          text: "Button 1",
          callback_data: "test:0:0",
          handler: async () => {},
        },
      ]];
      const inlineKeyboard = [[{ text: "Button 1", callback_data: "test:0:0" }]];

      const menu = new Menu(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);

      expect(menu.templateMenuId).toBe(templateMenuId);
      expect(menu.renderedMenuId).toBe(renderedMenuId);
      expect(menu.menuKeyboard).toBe(menuKeyboard);
    });

    it("should store readonly properties", () => {
      const menuKeyboard: MenuButton<Context>[][] = [];
      const inlineKeyboard: InlineKeyboardButton[][] = [];

      const menu = new Menu(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);

      // TypeScript should prevent reassignment, but verify properties exist
      expect(menu.templateMenuId).toBeDefined();
      expect(menu.renderedMenuId).toBeDefined();
      expect(menu.menuKeyboard).toBeDefined();
    });
  });

  describe("Menu constructor", () => {
    it("should create a Menu with messageText", () => {
      const menuKeyboard: MenuButton<Context>[][] = [[
        {
          text: "Button 1",
          callback_data: "test:0:0",
          handler: async () => {},
        },
      ]];
      const inlineKeyboard = [[{ text: "Button 1", callback_data: "test:0:0" }]];

      const menu = new Menu(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard, messageText);

      expect(menu.templateMenuId).toBe(templateMenuId);
      expect(menu.renderedMenuId).toBe(renderedMenuId);
      expect(menu.text).toBe(messageText);
      expect(menu.menuKeyboard).toBe(menuKeyboard);
      expect(menu.kind).toBe("text");
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

      const menu = new Menu(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);

      expect(menu.inline_keyboard).toBe(inlineKeyboard);
      expect(menu.inline_keyboard).toEqual(inlineKeyboard);
    });

    it("should return empty array for empty keyboard", () => {
      const menu = new Menu(templateMenuId, renderedMenuId, [], []);

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

      const menu = new Menu(templateMenuId, renderedMenuId, menuKeyboard, inlineKeyboard);

      expect(menu.inline_keyboard.length).toBe(2);
      expect(menu.inline_keyboard[0].length).toBe(1);
      expect(menu.inline_keyboard[1].length).toBe(2);
    });
  });

  describe("Menu compatibility with grammY", () => {
    it("should have inline_keyboard property for reply_markup", () => {
      const inlineKeyboard = [[{ text: "Test", callback_data: "test" }]];
      const menu = new Menu(templateMenuId, renderedMenuId, [], inlineKeyboard);

      // Should be usable as reply_markup
      const replyMarkup = { inline_keyboard: menu.inline_keyboard };
      expect(replyMarkup.inline_keyboard).toEqual(inlineKeyboard);
    });
  });

  describe("isMenu type guard", () => {
    it("should return true for BaseMenu instances", () => {
      const menu = new Menu(templateMenuId, renderedMenuId, [], []);
      expect(isMenu(menu)).toBe(true);
    });

    it("should return true for Menu instances", () => {
      const menu = new Menu(templateMenuId, renderedMenuId, [], [], messageText);
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
        text: "text",
        menuKeyboard: [],
        inline_keyboard: [],
      })).toBe(false);
    });

    it("should return true for objects with all required BaseMenu properties", () => {
      const menuLike = {
        templateMenuId: "test-template",
        renderedMenuId: "test-rendered",
        menuKeyboard: [],
        inline_keyboard: [[{ text: "text", "callback_data": "data" }]],
      };
      expect(isMenu(menuLike)).toBe(true);
    });

    it("should allow type narrowing in conditionals", () => {
      const menu = new Menu(templateMenuId, renderedMenuId, [], []);
      const input: unknown = menu;

      expect(isMenu(input)).toBe(true);
      if (isMenu(input)) {
        // The type guard confirms the object satisfies BaseMenu contract
        const baseMenu = input as typeof menu;
        expect(baseMenu.templateMenuId).toBe(templateMenuId);
        expect(baseMenu.renderedMenuId).toBe(renderedMenuId);
      }
    });
  });
});
