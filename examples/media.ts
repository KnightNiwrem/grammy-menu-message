/**
 * Media menu example demonstrating menus with photos, videos, and animations.
 *
 * Run: BOT_TOKEN=your_token deno run --allow-env --allow-net examples/media.ts
 */
import { Bot } from "./deps.ts";
import { MenuBuilder, MenuRegistry } from "../src/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) {
  console.error("BOT_TOKEN environment variable is required!");
  Deno.exit(1);
}

const bot = new Bot(token);
const registry = new MenuRegistry();

// Photo menu - converts text menu to photo menu
const photoMenu = new MenuBuilder("Beautiful landscape 🏞️")
  .photo("https://picsum.photos/800/600")
  .cb("Like", async (ctx) => {
    await ctx.reply("Thanks for liking! ❤️");
  })
  .cb("Download Info", async (ctx) => {
    await ctx.reply("This is a sample image from Lorem Picsum.");
  })
  .row()
  .url("More Photos", "https://picsum.photos");

// Video menu example
const videoMenu = new MenuBuilder("Sample video")
  .video("https://www.w3schools.com/html/mov_bbb.mp4")
  .cb("Like Video", async (ctx) => {
    await ctx.reply("Glad you liked it! 🎬");
  })
  .row()
  .cb("Back to Photos", async (ctx) => {
    const menu = registry.menu("photo");
    await ctx.reply("Switching to photos...", { reply_markup: menu });
  });

// Animation menu example
const animationMenu = new MenuBuilder("Animated GIF")
  .animation("https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif")
  .cb("😂", async (ctx) => {
    await ctx.reply("Haha!");
  })
  .cb("Share", async (ctx) => {
    await ctx.reply("Sharing animation...");
  });

// Main menu to access media menus
const mainMenu = new MenuBuilder("Media Gallery 🎨")
  .cb("📷 View Photo", async (ctx) => {
    const menu = registry.menu("photo");
    await ctx.reply("Loading photo...", { reply_markup: menu });
  })
  .cb("🎬 View Video", async (ctx) => {
    const menu = registry.menu("video");
    await ctx.reply("Loading video...", { reply_markup: menu });
  })
  .row()
  .cb("🎞️ View Animation", async (ctx) => {
    const menu = registry.menu("animation");
    await ctx.reply("Loading animation...", { reply_markup: menu });
  });

registry.register("main", mainMenu);
registry.register("photo", photoMenu);
registry.register("video", videoMenu);
registry.register("animation", animationMenu);

bot.use(registry.middleware());

bot.command("start", async (ctx) => {
  const menu = registry.menu("main");
  await ctx.reply("Welcome to the media gallery!", { reply_markup: menu });
});

bot.command("photo", async (ctx) => {
  const menu = registry.menu("photo");
  await ctx.reply("Loading...", { reply_markup: menu });
});

bot.command("video", async (ctx) => {
  const menu = registry.menu("video");
  await ctx.reply("Loading...", { reply_markup: menu });
});

bot.command("animation", async (ctx) => {
  const menu = registry.menu("animation");
  await ctx.reply("Loading...", { reply_markup: menu });
});

console.log("Media bot started...");
bot.start();
