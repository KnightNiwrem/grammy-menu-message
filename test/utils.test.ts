import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { isMessage } from "../src/utils.ts";

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
});
