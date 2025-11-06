/**
 * Navigation example demonstrating multi-level menus with back buttons.
 *
 * Run: BOT_TOKEN=your_token deno run --allow-env --allow-net examples/navigation.ts
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

// Settings submenu
const settingsMenu = new MenuTemplate("⚙️ Settings")
  .cb("🔔 Notifications", async (ctx) => {
    await ctx.reply("Notifications: ON");
  })
  .cb("🌐 Language", async (ctx) => {
    await ctx.reply("Language: English");
  })
  .row()
  .cb("🎨 Theme", async (ctx) => {
    await ctx.reply("Theme: Light");
  })
  .row()
  .cb("« Back to Main", async (ctx) => {
    const menu = registry.menu("main");
    await ctx.editMessageText("Main Menu", { reply_markup: menu });
  });

// Help submenu
const helpMenu = new MenuTemplate("❓ Help & Support")
  .cb("📖 Documentation", async (ctx) => {
    await ctx.reply("Visit https://grammy.dev for documentation");
  })
  .cb("💬 Community", async (ctx) => {
    await ctx.reply("Join our Telegram community!");
  })
  .row()
  .url("GitHub Issues", "https://github.com/grammyjs/grammY/issues")
  .row()
  .cb("« Back to Main", async (ctx) => {
    const menu = registry.menu("main");
    await ctx.editMessageText("Main Menu", { reply_markup: menu });
  });

// Profile submenu
const profileMenu = new MenuTemplate("👤 Profile")
  .cb("📝 Edit Name", async (ctx) => {
    await ctx.reply("Name editing not implemented in this example");
  })
  .cb("🖼️ Change Avatar", async (ctx) => {
    await ctx.reply("Avatar changing not implemented");
  })
  .row()
  .cb("« Back to Main", async (ctx) => {
    const menu = registry.menu("main");
    await ctx.editMessageText("Main Menu", { reply_markup: menu });
  });

// Main menu
const mainMenu = new MenuTemplate("🏠 Main Menu\n\nChoose a section:")
  .cb("⚙️ Settings", async (ctx) => {
    const menu = registry.menu("settings");
    await ctx.editMessageText("Settings menu", { reply_markup: menu });
  })
  .cb("❓ Help", async (ctx) => {
    const menu = registry.menu("help");
    await ctx.editMessageText("Help menu", { reply_markup: menu });
  })
  .row()
  .cb("👤 Profile", async (ctx) => {
    const menu = registry.menu("profile");
    await ctx.editMessageText("Profile menu", { reply_markup: menu });
  })
  .row()
  .cb("ℹ️ About", async (ctx) => {
    await ctx.reply(
      "Navigation Example Bot v1.0\n\nDemonstrates multi-level menu navigation with grammY Menu Message.",
    );
  });

registry.register("main", mainMenu);
registry.register("settings", settingsMenu);
registry.register("help", helpMenu);
registry.register("profile", profileMenu);

bot.use(registry.middleware());

bot.command("start", async (ctx) => {
  const menu = registry.menu("main");
  await ctx.reply("Welcome!", { reply_markup: menu });
});

bot.command("menu", async (ctx) => {
  const menu = registry.menu("main");
  await ctx.reply("Main menu:", { reply_markup: menu });
});

console.log("Navigation bot started...");
bot.start();
