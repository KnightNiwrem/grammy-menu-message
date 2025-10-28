import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Context } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";
import { Menu } from "../src/menu.ts";
import type { MenuButton } from "../src/types.ts";

describe("Menu", () => {
  const templateMenuId = "test-template";
  const renderedMenuId = "test-rendered";

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
});
