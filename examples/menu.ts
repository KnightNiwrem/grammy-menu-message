/**
 * Example bot demonstrating the Menu class for inline keyboards.
 *
 * To run this example:
 * 1. Set your bot token: export BOT_TOKEN="your-token-here"
 * 2. Run: deno run --allow-net --allow-env examples/menu.ts
 */

import { Bot } from "grammy";
import type { Context } from "grammy";
import { Menu } from "../src/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) {
  console.error("BOT_TOKEN environment variable is required!");
  Deno.exit(1);
}

const bot = new Bot<Context>(token);

// Create a main menu
const mainMenu = new Menu("main");

mainMenu.text("🍕 Order Pizza", async (ctx) => {
  await ctx.editMessageText("Pizza selected! Choose size:", {
    reply_markup: { inline_keyboard: pizzaMenu.inline_keyboard },
  });
});

mainMenu.text("🍔 Order Burger", async (ctx) => {
  await ctx.editMessageText("Burger selected! Choose size:", {
    reply_markup: { inline_keyboard: burgerMenu.inline_keyboard },
  });
});

mainMenu.row();

mainMenu.text("ℹ️ About", async (ctx) => {
  await ctx.editMessageText(
    "This is a demo bot showcasing the grammY Menu class!\n\n" +
      "Features:\n" +
      "- Easy inline keyboard creation\n" +
      "- Automatic callback_data management\n" +
      "- Simple callback handling\n\n" +
      "Built with grammY 🤖",
    {
      reply_markup: { inline_keyboard: backMenu.inline_keyboard },
    },
  );
});

mainMenu.text("❌ Cancel", async (ctx) => {
  await ctx.editMessageText("Order cancelled. Use /menu to start again.");
});

// Create a pizza size menu
const pizzaMenu = new Menu("pizza");

pizzaMenu.text("Small", async (ctx) => {
  await ctx.editMessageText("✅ Ordered Small Pizza!\n\nUse /menu for more.");
});

pizzaMenu.text("Medium", async (ctx) => {
  await ctx.editMessageText("✅ Ordered Medium Pizza!\n\nUse /menu for more.");
});

pizzaMenu.text("Large", async (ctx) => {
  await ctx.editMessageText("✅ Ordered Large Pizza!\n\nUse /menu for more.");
});

pizzaMenu.row();

pizzaMenu.text("« Back", async (ctx) => {
  await ctx.editMessageText("What would you like to order?", {
    reply_markup: { inline_keyboard: mainMenu.inline_keyboard },
  });
});

// Create a burger size menu
const burgerMenu = new Menu("burger");

burgerMenu.text("Single", async (ctx) => {
  await ctx.editMessageText("✅ Ordered Single Burger!\n\nUse /menu for more.");
});

burgerMenu.text("Double", async (ctx) => {
  await ctx.editMessageText("✅ Ordered Double Burger!\n\nUse /menu for more.");
});

burgerMenu.text("Triple", async (ctx) => {
  await ctx.editMessageText("✅ Ordered Triple Burger!\n\nUse /menu for more.");
});

burgerMenu.row();

burgerMenu.text("« Back", async (ctx) => {
  await ctx.editMessageText("What would you like to order?", {
    reply_markup: { inline_keyboard: mainMenu.inline_keyboard },
  });
});

// Create a simple back menu
const backMenu = new Menu("back");

backMenu.text("« Back to Menu", async (ctx) => {
  await ctx.editMessageText("What would you like to order?", {
    reply_markup: { inline_keyboard: mainMenu.inline_keyboard },
  });
});

// Register all menu middleware
bot.use(mainMenu.middleware());
bot.use(pizzaMenu.middleware());
bot.use(burgerMenu.middleware());
bot.use(backMenu.middleware());

// Start command
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Welcome! 👋\n\n" +
      "This bot demonstrates the Menu class for creating inline keyboards.\n\n" +
      "Use /menu to see the demo!",
  );
});

// Menu command - show the main menu
bot.command("menu", async (ctx) => {
  await ctx.reply("What would you like to order?", {
    reply_markup: { inline_keyboard: mainMenu.inline_keyboard },
  });
});

// Help command
bot.command("help", async (ctx) => {
  await ctx.reply(
    "Commands:\n" +
      "/start - Show welcome message\n" +
      "/menu - Display the order menu\n" +
      "/help - Show this help message",
  );
});

console.log("Menu demo bot is running...");
bot.start();
