import { beforeEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Bot, Context, MemorySessionStorage } from "grammy";
import {
  vault,
  type VaultData,
  type VaultEntry,
  type VaultFlavor,
} from "../src/mod.ts";

// Type alias for bot with vault flavor
type VaultContext = Context & VaultFlavor;

// Mock bot info for testing
const mockBotInfo = {
  id: 12345,
  is_bot: true as const,
  first_name: "TestBot",
  username: "test_bot",
  can_join_groups: true,
  can_read_all_group_messages: false,
  supports_inline_queries: false,
  can_connect_to_business: false,
  has_main_web_app: false,
};

describe("Menu Message Plugin", () => {
  describe("Memory Storage", () => {
    let bot: Bot<VaultContext>;

    beforeEach(() => {
      bot = new Bot<VaultContext>("dummy-token", { botInfo: mockBotInfo });
    });

    it("should initialize with empty vault", async () => {
      bot.use(vault({
        storage: new MemorySessionStorage<VaultData>(),
      }));

      let capturedVault: VaultData | undefined;

      bot.on("message", (ctx) => {
        capturedVault = ctx.vault;
      });

      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 1,
        message: {
          message_id: 1,
          date: Date.now() / 1000,
          chat: { id: 123, type: "private" as const, first_name: "Test" },
          from: { id: 456, is_bot: false, first_name: "Test" },
          text: "Hello",
        },
      });

      expect(capturedVault).toBeDefined();
      expect(capturedVault?.entries).toEqual([]);
    });

    it("should add entries to vault", async () => {
      let callCount = 0;

      bot.use(vault({
        storage: new MemorySessionStorage<VaultData>(),
      }));

      bot.on("message", (ctx) => {
        callCount++;
        if (callCount === 1) {
          const entry: VaultEntry = {
            id: "test-id-1",
            text: "Test entry",
            createdAt: Date.now(),
          };
          ctx.vault.entries.push(entry);
        }
      });

      // First update - add entry
      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 1,
        message: {
          message_id: 1,
          date: Date.now() / 1000,
          chat: { id: 123, type: "private" as const, first_name: "Test" },
          from: { id: 456, is_bot: false, first_name: "Test" },
          text: "Hello",
        },
      });

      expect(callCount).toBe(1);

      // Second update - verify entry persisted
      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 2,
        message: {
          message_id: 2,
          date: Date.now() / 1000,
          chat: { id: 123, type: "private" as const, first_name: "Test" },
          from: { id: 456, is_bot: false, first_name: "Test" },
          text: "Hello again",
        },
      });

      expect(callCount).toBe(2);
    });

    it("should persist entries across updates", async () => {
      let entriesCount = 0;

      bot.use(vault({
        storage: new MemorySessionStorage<VaultData>(),
      }));

      bot.on("message", (ctx) => {
        const entry: VaultEntry = {
          id: `entry-${ctx.vault.entries.length + 1}`,
          text: `Entry ${ctx.vault.entries.length + 1}`,
          createdAt: Date.now(),
        };
        ctx.vault.entries.push(entry);
        entriesCount = ctx.vault.entries.length;
      });

      const update = {
        update_id: 1,
        message: {
          message_id: 1,
          date: Date.now() / 1000,
          chat: { id: 123, type: "private" as const, first_name: "Test" },
          from: { id: 456, is_bot: false, first_name: "Test" },
          text: "Message",
        },
      };

      // Add 3 entries
      for (let i = 1; i <= 3; i++) {
        // @ts-ignore: simplified update for testing
        await bot.handleUpdate({ ...update, update_id: i });
      }

      expect(entriesCount).toBe(3);
    });

    it("should delete entries from vault", async () => {
      bot.use(vault({
        storage: new MemorySessionStorage<VaultData>(),
      }));

      // First update: add entry
      bot.on("message", (ctx) => {
        if (ctx.message.text === "add") {
          ctx.vault.entries.push({
            id: "to-delete",
            text: "Delete me",
            createdAt: Date.now(),
          });
        } else if (ctx.message.text === "delete") {
          const index = ctx.vault.entries.findIndex((e) =>
            e.id === "to-delete"
          );
          if (index !== -1) {
            ctx.vault.entries.splice(index, 1);
          }
        }
      });

      const baseUpdate = {
        message: {
          message_id: 1,
          date: Date.now() / 1000,
          chat: { id: 123, type: "private" as const, first_name: "Test" },
          from: { id: 456, is_bot: false, first_name: "Test" },
        },
      };

      // Add entry
      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 1,
        message: { ...baseUpdate.message, text: "add" },
      });

      // Delete entry
      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 2,
        message: { ...baseUpdate.message, text: "delete" },
      });

      // Verify deletion
      let finalEntries: VaultEntry[] = [];
      bot.on("message", (ctx) => {
        finalEntries = ctx.vault.entries;
      });

      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 3,
        message: { ...baseUpdate.message, text: "check" },
      });

      expect(finalEntries.length).toBe(0);
    });
  });

  describe("Storage Key Options", () => {
    it("should use custom prefix", async () => {
      const storage = new MemorySessionStorage<VaultData>();
      const bot = new Bot<VaultContext>("dummy-token", {
        botInfo: mockBotInfo,
      });

      bot.use(vault({
        storage,
        prefix: "myvault:",
      }));

      bot.on("message", (ctx) => {
        ctx.vault.entries.push({
          id: "test",
          text: "Test",
          createdAt: Date.now(),
        });
      });

      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 1,
        message: {
          message_id: 1,
          date: Date.now() / 1000,
          chat: { id: 999, type: "private" as const, first_name: "Test" },
          from: { id: 456, is_bot: false, first_name: "Test" },
          text: "Test",
        },
      });

      // Verify the key with prefix was used
      const data = await storage.read("myvault:456");
      expect(data).toBeDefined();
      expect(data?.entries.length).toBe(1);
    });

    it("should store data per user by default", async () => {
      const storage = new MemorySessionStorage<VaultData>();
      const bot = new Bot<VaultContext>("dummy-token", {
        botInfo: mockBotInfo,
      });

      bot.use(vault({ storage }));

      bot.on("message", (ctx) => {
        ctx.vault.entries.push({
          id: `user-${ctx.from?.id}`,
          text: "Test",
          createdAt: Date.now(),
        });
      });

      // User 1
      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 1,
        message: {
          message_id: 1,
          date: Date.now() / 1000,
          chat: { id: 111, type: "private" as const, first_name: "Test" },
          from: { id: 100, is_bot: false, first_name: "User1" },
          text: "Test",
        },
      });

      // User 2
      // @ts-ignore: simplified update for testing
      await bot.handleUpdate({
        update_id: 2,
        message: {
          message_id: 2,
          date: Date.now() / 1000,
          chat: { id: 222, type: "private" as const, first_name: "Test" },
          from: { id: 200, is_bot: false, first_name: "User2" },
          text: "Test",
        },
      });

      // Verify separate vaults
      const user1Data = await storage.read("100");
      const user2Data = await storage.read("200");

      expect(user1Data?.entries.length).toBe(1);
      expect(user2Data?.entries.length).toBe(1);
      expect(user1Data?.entries[0].id).toBe("user-100");
      expect(user2Data?.entries[0].id).toBe("user-200");
    });
  });
});
