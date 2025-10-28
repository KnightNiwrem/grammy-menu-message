/**
 * Example bot demonstrating the grammY Menu Message plugin.
 */
import { Bot } from "grammy";
import { MenuRegistry, MenuTemplate } from "../src/mod.ts";

const token = Deno.env
  .get(
    "BOT_TOKEN",
  );
if (
  !token
) {
  console
    .error(
      "BOT_TOKEN environment variable is required!",
    );
  Deno.exit(
    1,
  );
}

const bot = new Bot(
  token,
);

const registry = new MenuRegistry();

const mainMenu = new MenuTemplate()
  .cb(
    "Say hi",
    async (
      ctx,
    ) => {
      await ctx
        .answerCallbackQuery();
      await ctx
        .reply(
          "Hi!",
        );
    },
  )
  .row()
  .url(
    "GitHub",
    "https://github.com",
  );

registry
  .register(
    "main",
    mainMenu,
  );

bot.use(
  registry
    .middleware(),
);

bot.command(
  "start",
  async (
    ctx,
  ) => {
    const menu = await registry
      .menu(
        "main",
      );
    if (
      !menu
    ) {
      return ctx
        .reply(
          "Menu not found",
        );
    }
    await ctx
      .reply(
        "Choose:",
        {
          reply_markup: {
            inline_keyboard: menu
              .inline_keyboard,
          },
        },
      );
  },
);

bot.start();
