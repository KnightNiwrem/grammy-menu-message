# grammY Menu Message

A tiny menu system for grammY bots that helps you build and handle inline keyboards.

It provides:

- TextMenuTemplate: a builder for defining text-based menus with optional media attachments
- Menu: a rendered inline keyboard plus callback handlers
- MenuRegistry: registers templates, renders menus, and routes callback_query updates

## Quick start

```ts
import { Bot } from "grammy";
import { MenuRegistry, TextMenuTemplate } from "./src/mod.ts";

const bot = new Bot(
  Deno.env
    .get(
      "BOT_TOKEN",
    )!,
);

const registry = new MenuRegistry();
const main = new TextMenuTemplate("Choose:")
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
    main,
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
    const menu = registry
      .menu(
        "main",
      );
    await ctx
      .reply(
        "This text will be overridden",
        {
          reply_markup: menu,
        },
      );
  },
);

bot.start();
```

## Development

Tasks:

- deno task fmt
- deno task lint
- deno task test
- deno task check
- deno task ok

## License

MIT
