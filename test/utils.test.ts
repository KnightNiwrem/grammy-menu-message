import { describe, expect, it } from "./deps.ts";
import {
  isCallbackButton,
  isCopyTextButton,
  isGameButton,
  isInlineKeyboardButton,
  isLoginButton,
  isMessage,
  isPayButton,
  isSwitchInlineButton,
  isSwitchInlineChosenChatButton,
  isSwitchInlineCurrentChatButton,
  isUrlButton,
  isWebAppButton,
} from "../src/utils.ts";

describe("utils", () => {
  describe("isMessage", () => {
    it("should return true for valid Message objects", () => {
      const validMessage = {
        message_id: 123,
        chat: {
          id: 456,
          type: "private",
        },
        date: 1234567890,
      };

      expect(isMessage(validMessage)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isMessage(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isMessage(undefined)).toBe(false);
    });

    it("should return false for non-object types", () => {
      expect(isMessage("string")).toBe(false);
      expect(isMessage(123)).toBe(false);
      expect(isMessage(true)).toBe(false);
    });

    it("should return false for objects missing message_id", () => {
      const invalid = {
        chat: { id: 456 },
      };
      expect(isMessage(invalid)).toBe(false);
    });

    it("should return false for objects with non-number message_id", () => {
      const invalid = {
        message_id: "123",
        chat: { id: 456 },
      };
      expect(isMessage(invalid)).toBe(false);
    });

    it("should return false for objects missing chat", () => {
      const invalid = {
        message_id: 123,
      };
      expect(isMessage(invalid)).toBe(false);
    });

    it("should return false for objects with null chat", () => {
      const invalid = {
        message_id: 123,
        chat: null,
      };
      expect(isMessage(invalid)).toBe(false);
    });

    it("should return false for objects with non-object chat", () => {
      const invalid = {
        message_id: 123,
        chat: "string",
      };
      expect(isMessage(invalid)).toBe(false);
    });

    it("should return false for objects missing chat.id", () => {
      const invalid = {
        message_id: 123,
        chat: {},
      };
      expect(isMessage(invalid)).toBe(false);
    });

    it("should return false for objects with non-number chat.id", () => {
      const invalid = {
        message_id: 123,
        chat: { id: "456" },
      };
      expect(isMessage(invalid)).toBe(false);
    });

    it("should return true even without other Message properties", () => {
      // Only checks required properties
      const minimal = {
        message_id: 123,
        chat: { id: 456 },
      };
      expect(isMessage(minimal)).toBe(true);
    });
  });

  describe("isInlineKeyboardButton", () => {
    it("should return true for CallbackButton", () => {
      const button = { text: "Click me", callback_data: "action_1" };
      expect(isInlineKeyboardButton(button)).toBe(true);
    });

    it("should return true for UrlButton", () => {
      const button = { text: "Visit", url: "https://example.com" };
      expect(isInlineKeyboardButton(button)).toBe(true);
    });

    it("should return true for WebAppButton", () => {
      const button = { text: "Open App", web_app: { url: "https://app.com" } };
      expect(isInlineKeyboardButton(button)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isInlineKeyboardButton(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isInlineKeyboardButton(undefined)).toBe(false);
    });

    it("should return false for non-object types", () => {
      expect(isInlineKeyboardButton("string")).toBe(false);
      expect(isInlineKeyboardButton(123)).toBe(false);
      expect(isInlineKeyboardButton(true)).toBe(false);
    });

    it("should return false for objects without text property", () => {
      const button = { callback_data: "action_1" };
      expect(isInlineKeyboardButton(button)).toBe(false);
    });

    it("should return false for objects with non-string text", () => {
      const button = { text: 123, callback_data: "action_1" };
      expect(isInlineKeyboardButton(button)).toBe(false);
    });
  });

  describe("isCallbackButton", () => {
    it("should return true for CallbackButton", () => {
      const button: unknown = { text: "Click", callback_data: "data_1" };
      if (isInlineKeyboardButton(button)) {
        expect(isCallbackButton(button)).toBe(true);
      }
    });

    it("should return false for UrlButton", () => {
      const button: unknown = { text: "Link", url: "https://example.com" };
      if (isInlineKeyboardButton(button)) {
        expect(isCallbackButton(button)).toBe(false);
      }
    });
  });

  describe("isUrlButton", () => {
    it("should return true for UrlButton", () => {
      const button: unknown = { text: "Link", url: "https://example.com" };
      if (isInlineKeyboardButton(button)) {
        expect(isUrlButton(button)).toBe(true);
      }
    });

    it("should return false for CallbackButton", () => {
      const button: unknown = { text: "Click", callback_data: "data_1" };
      if (isInlineKeyboardButton(button)) {
        expect(isUrlButton(button)).toBe(false);
      }
    });
  });

  describe("isWebAppButton", () => {
    it("should return true for WebAppButton", () => {
      const button: unknown = { text: "App", web_app: { url: "https://app.com" } };
      if (isInlineKeyboardButton(button)) {
        expect(isWebAppButton(button)).toBe(true);
      }
    });

    it("should return false for UrlButton", () => {
      const button: unknown = { text: "Link", url: "https://example.com" };
      if (isInlineKeyboardButton(button)) {
        expect(isWebAppButton(button)).toBe(false);
      }
    });
  });

  describe("isLoginButton", () => {
    it("should return true for LoginButton", () => {
      const button: unknown = {
        text: "Login",
        login_url: { url: "https://example.com/login" },
      };
      if (isInlineKeyboardButton(button)) {
        expect(isLoginButton(button)).toBe(true);
      }
    });

    it("should return false for CallbackButton", () => {
      const button: unknown = { text: "Click", callback_data: "data_1" };
      if (isInlineKeyboardButton(button)) {
        expect(isLoginButton(button)).toBe(false);
      }
    });
  });

  describe("isSwitchInlineButton", () => {
    it("should return true for SwitchInlineButton", () => {
      const button: unknown = { text: "Share", switch_inline_query: "query" };
      if (isInlineKeyboardButton(button)) {
        expect(isSwitchInlineButton(button)).toBe(true);
      }
    });

    it("should return false for UrlButton", () => {
      const button: unknown = { text: "Link", url: "https://example.com" };
      if (isInlineKeyboardButton(button)) {
        expect(isSwitchInlineButton(button)).toBe(false);
      }
    });
  });

  describe("isSwitchInlineCurrentChatButton", () => {
    it("should return true for SwitchInlineCurrentChatButton", () => {
      const button: unknown = {
        text: "Share Here",
        switch_inline_query_current_chat: "query",
      };
      if (isInlineKeyboardButton(button)) {
        expect(isSwitchInlineCurrentChatButton(button)).toBe(true);
      }
    });

    it("should return false for CallbackButton", () => {
      const button: unknown = { text: "Click", callback_data: "data_1" };
      if (isInlineKeyboardButton(button)) {
        expect(isSwitchInlineCurrentChatButton(button)).toBe(false);
      }
    });
  });

  describe("isSwitchInlineChosenChatButton", () => {
    it("should return true for SwitchInlineChosenChatButton", () => {
      const button: unknown = {
        text: "Choose Chat",
        switch_inline_query_chosen_chat: {
          allow_user_chats: true,
        },
      };
      if (isInlineKeyboardButton(button)) {
        expect(isSwitchInlineChosenChatButton(button)).toBe(true);
      }
    });

    it("should return false for UrlButton", () => {
      const button: unknown = { text: "Link", url: "https://example.com" };
      if (isInlineKeyboardButton(button)) {
        expect(isSwitchInlineChosenChatButton(button)).toBe(false);
      }
    });
  });

  describe("isCopyTextButton", () => {
    it("should return true for CopyTextButtonButton", () => {
      const button: unknown = { text: "Copy", copy_text: "Text to copy" };
      if (isInlineKeyboardButton(button)) {
        expect(isCopyTextButton(button)).toBe(true);
      }
    });

    it("should return false for CallbackButton", () => {
      const button: unknown = { text: "Click", callback_data: "data_1" };
      if (isInlineKeyboardButton(button)) {
        expect(isCopyTextButton(button)).toBe(false);
      }
    });
  });

  describe("isGameButton", () => {
    it("should return true for GameButton", () => {
      const button: unknown = { text: "Play Game", callback_game: {} };
      if (isInlineKeyboardButton(button)) {
        expect(isGameButton(button)).toBe(true);
      }
    });

    it("should return false for CallbackButton", () => {
      const button: unknown = { text: "Click", callback_data: "data_1" };
      if (isInlineKeyboardButton(button)) {
        expect(isGameButton(button)).toBe(false);
      }
    });
  });

  describe("isPayButton", () => {
    it("should return true for PayButton", () => {
      const button: unknown = { text: "Pay", pay: true };
      if (isInlineKeyboardButton(button)) {
        expect(isPayButton(button)).toBe(true);
      }
    });

    it("should return false for UrlButton", () => {
      const button: unknown = { text: "Link", url: "https://example.com" };
      if (isInlineKeyboardButton(button)) {
        expect(isPayButton(button)).toBe(false);
      }
    });
  });
});
