/**
 * Basic menu example demonstrating simple callback buttons and URL buttons.
 *
 * Run: BOT_TOKEN=your_token deno run --allow-env --allow-net examples/basic.ts
 */
import { Bot } from "./deps.ts";
import { MenuRegistry, MenuTemplate } from "../src/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) {
  console.error("BOT_TOKEN environment variable is required!");
  Deno.exit(1);
}

const bot = new Bot(token);
const registry = new MenuRegistry();

// Main menu with callback buttons and URL buttons
const mainMenu = new MenuTemplate("Welcome! Choose an option:")
  .cb("Say Hello", async (ctx) => {
    await ctx.reply("Hello! 👋");
  })
  .cb("Show Time", async (ctx) => {
    const now = new Date().toLocaleTimeString();
    await ctx.reply(`Current time: ${now}`);
  })
  .row()
  .url("grammY Docs", "https://grammy.dev")
  .url("GitHub", "https://github.com")
  .row()
  .cb("About", async (ctx) => {
    await ctx.reply("This is a basic menu example using grammY Menu Message.");
  });

registry.register("main", mainMenu);

// Register middleware
bot.use(registry.middleware());

// Start command - shows the main menu
bot.command("start", async (ctx) => {
  const menu = registry.menu("main");
  await ctx.reply("Starting...", { reply_markup: menu });
});

// Menu command - alternative way to access the menu
bot.command("menu", async (ctx) => {
  const menu = registry.menu("main");
  await ctx.reply("Here's the menu:", { reply_markup: menu });
});

console.log("Bot started...");
bot.start();
