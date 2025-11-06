/**
 * Advanced example demonstrating various button types and features.
 *
 * Run: BOT_TOKEN=your_token deno run --allow-env --allow-net examples/advanced.ts
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

// Menu demonstrating inline query buttons
const shareMenu = new MenuTemplate("📤 Share Options")
  .switchInline("Share in Another Chat", "Check out this bot!")
  .row()
  .switchInlineCurrent("Share in This Chat", "Amazing bot: ")
  .row()
  .switchInlineChosen("Share with Friends", {
    allow_user_chats: true,
    allow_bot_chats: false,
    allow_group_chats: false,
    allow_channel_chats: false,
  })
  .row()
  .cb("« Back", async (ctx) => {
    const menu = registry.menu("main");
    await ctx.editMessageText("Main Menu", { reply_markup: menu });
  });

// Menu with Web App button
const webAppMenu = new MenuTemplate("🌐 Web Apps")
  .webApp("Open Calculator", "https://example.com/calculator")
  .row()
  .webApp("Open Game", "https://example.com/game")
  .row()
  .cb("« Back", async (ctx) => {
    const menu = registry.menu("main");
    await ctx.editMessageText("Main Menu", { reply_markup: menu });
  });

// Menu with copy text button
const utilsMenu = new MenuTemplate("🔧 Utilities")
  .copyText("Copy Bot ID", `Bot ID: ${bot.botInfo.id}`)
  .row()
  .copyText("Copy Username", `@${bot.botInfo.username}`)
  .row()
  .cb("Show QR Code", async (ctx) => {
    await ctx.reply("QR code generation not implemented in this example");
  })
  .row()
  .cb("« Back", async (ctx) => {
    const menu = registry.menu("main");
    await ctx.editMessageText("Main Menu", { reply_markup: menu });
  });

// Dynamic menu with state
let counter = 0;
const counterMenu = new MenuTemplate()
  .cb("➕ Increment", async (ctx) => {
    counter++;
    const menu = registry.menu("counter");
    await ctx.editMessageText(`Counter: ${counter}`, { reply_markup: menu });
  })
  .cb("➖ Decrement", async (ctx) => {
    counter--;
    const menu = registry.menu("counter");
    await ctx.editMessageText(`Counter: ${counter}`, { reply_markup: menu });
  })
  .row()
  .cb("🔄 Reset", async (ctx) => {
    counter = 0;
    const menu = registry.menu("counter");
    await ctx.editMessageText(`Counter: ${counter}`, { reply_markup: menu });
  })
  .row()
  .cb("« Back", async (ctx) => {
    const menu = registry.menu("main");
    await ctx.editMessageText("Main Menu", { reply_markup: menu });
  });

// Main menu
const mainMenu = new MenuTemplate("🎯 Advanced Features\n\nExplore different button types:")
  .cb("📤 Sharing Options", async (ctx) => {
    const menu = registry.menu("share");
    await ctx.editMessageText("Sharing options", { reply_markup: menu });
  })
  .cb("🌐 Web Apps", async (ctx) => {
    const menu = registry.menu("webapp");
    await ctx.editMessageText("Web Apps", { reply_markup: menu });
  })
  .row()
  .cb("🔧 Utilities", async (ctx) => {
    const menu = registry.menu("utils");
    await ctx.editMessageText("Utilities", { reply_markup: menu });
  })
  .cb("🔢 Counter Demo", async (ctx) => {
    const menu = registry.menu("counter");
    await ctx.editMessageText(`Counter: ${counter}`, { reply_markup: menu });
  })
  .row()
  .url("External Link", "https://grammy.dev")
  .row()
  .cb("Raw Callback Example", async (ctx) => {
    await ctx.reply("This uses a raw callback handler!");
  });

registry.register("main", mainMenu);
registry.register("share", shareMenu);
registry.register("webapp", webAppMenu);
registry.register("utils", utilsMenu);
registry.register("counter", counterMenu);

bot.use(registry.middleware());

bot.command("start", async (ctx) => {
  const menu = registry.menu("main");
  await ctx.reply("Welcome to advanced features!", { reply_markup: menu });
});

// Handle the raw callback
bot.callbackQuery("raw_callback", async (ctx) => {
  await ctx.answerCallbackQuery("Raw callback handled!");
  await ctx.reply("This bypasses the menu system!");
});

console.log("Advanced bot started...");
bot.start();
