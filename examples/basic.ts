/**
 * Example bot demonstrating the vault plugin.
 *
 * To run this example:
 * 1. Set your bot token: export BOT_TOKEN="your-token-here"
 * 2. Run: deno run --allow-net --allow-env example.ts
 */

import { Bot, MemorySessionStorage } from "grammy";
import type { Context } from "grammy";
import {
  vault,
  type VaultData,
  type VaultEntry,
  type VaultFlavor,
} from "../src/mod.ts";

type VaultContext = Context & VaultFlavor;

const token = Deno.env.get("BOT_TOKEN");
if (!token) {
  console.error("BOT_TOKEN environment variable is required!");
  Deno.exit(1);
}

const bot = new Bot<VaultContext>(token);

// Install the vault plugin with in-memory storage
bot.use(vault({
  storage: new MemorySessionStorage<VaultData>(),
  prefix: "vault:",
}));

// Start command - show help
bot.command("start", (ctx) => {
  ctx.reply(
    "Welcome! 📝\n\n" +
      "Commands:\n" +
      "/save <text> - Save text to your vault\n" +
      "/list - Show all your saved texts\n" +
      "/delete <id> - Delete an entry by ID\n" +
      "/clear - Clear your entire vault\n" +
      "/count - Show how many entries you have",
  );
});

// Save command - add text to vault
bot.command("save", (ctx) => {
  const text = ctx.match;

  if (!text) {
    return ctx.reply(
      "Please provide text to save!\n\nExample: /save Remember to buy milk",
    );
  }

  const entry: VaultEntry = {
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now(),
  };

  ctx.vault.entries.push(entry);

  ctx.reply(
    `✅ Saved to your vault!\n\n` +
      `Text: ${text}\n` +
      `ID: ${entry.id.slice(0, 8)}...\n\n` +
      `You now have ${ctx.vault.entries.length} ${
        ctx.vault.entries.length === 1 ? "entry" : "entries"
      }.`,
  );
});

// List command - show all entries
bot.command("list", (ctx) => {
  const entries = ctx.vault.entries;

  if (entries.length === 0) {
    return ctx.reply(
      "Your vault is empty! 📭\n\nUse /save <text> to add something.",
    );
  }

  const list = entries.map((e, i) => {
    const date = new Date(e.createdAt).toLocaleString();
    return `${i + 1}. ${e.text}\n` +
      `   🆔 ${e.id.slice(0, 8)}...\n` +
      `   📅 ${date}`;
  }).join("\n\n");

  ctx.reply(
    `Your vault (${entries.length} ${
      entries.length === 1 ? "entry" : "entries"
    }):\n\n${list}`,
  );
});

// Delete command - remove an entry by ID
bot.command("delete", (ctx) => {
  const id = ctx.match;

  if (!id) {
    return ctx.reply("Please provide an entry ID!\n\nExample: /delete abc123");
  }

  const index = ctx.vault.entries.findIndex((e) => e.id.startsWith(id));

  if (index === -1) {
    return ctx.reply("❌ Entry not found!\n\nUse /list to see all entries.");
  }

  const deleted = ctx.vault.entries.splice(index, 1)[0];
  ctx.reply(
    `🗑️ Deleted entry:\n\n${deleted.text}\n\n` +
      `You have ${ctx.vault.entries.length} ${
        ctx.vault.entries.length === 1 ? "entry" : "entries"
      } remaining.`,
  );
});

// Clear command - remove all entries
bot.command("clear", (ctx) => {
  const count = ctx.vault.entries.length;

  if (count === 0) {
    return ctx.reply("Your vault is already empty!");
  }

  ctx.vault.entries = [];
  ctx.reply(
    `🗑️ Cleared ${count} ${count === 1 ? "entry" : "entries"} from your vault.`,
  );
});

// Count command - show number of entries
bot.command("count", (ctx) => {
  const count = ctx.vault.entries.length;
  ctx.reply(
    `📊 You have ${count} ${count === 1 ? "entry" : "entries"} in your vault.`,
  );
});

// Handle any text message as a quick save
bot.on("message:text", (ctx) => {
  if (ctx.message.text.startsWith("/")) {
    // Ignore commands
    return;
  }

  ctx.reply(
    "💡 Tip: Use /save <text> to save this to your vault!\n" +
      "Or use /start to see all commands.",
  );
});

console.log("Bot is running...");
bot.start();
