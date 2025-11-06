# grammY Menu Message

A lightweight, type-safe menu system for [grammY](https://grammy.dev) Telegram bots built with Deno. Create declarative inline keyboards with automatic callback routing, persistent navigation history, and media support.

## Features

- **Declarative Menu Building** — Define menu templates using a chainable builder API
- **Automatic Callback Routing** — Callbacks are handled internally with zero manual routing code
- **Media Support** — Create menus with photos, videos, animations, audio, or documents
- **Navigation History** — Built-in tracking of menu navigation per message
- **Type-Safe** — Full TypeScript support with proper type inference
- **Storage Flexibility** — Pluggable storage adapters for persistence (memory, Redis, etc.)
- **Middleware Integration** — Seamless integration with grammY's middleware system

## Installation

```ts
import { MenuRegistry, MenuTemplate } from "jsr:@your-scope/grammy-menu-message";
```

> **Note:** This library is currently in development and not yet published to JSR.

## Quick Start

```ts
import { Bot } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import { MenuRegistry, MenuTemplate } from "./src/mod.ts";

const bot = new Bot(Deno.env.get("BOT_TOKEN")!);
const registry = new MenuRegistry();

// Define a menu template
const mainMenu = new MenuTemplate("Welcome! Choose an option:")
  .cb("Say Hello", async (ctx) => {
    await ctx.reply("Hello! 👋");
  })
  .cb("Show Info", async (ctx) => {
    await ctx.reply("This is a grammY menu example.");
  })
  .row()
  .url("GitHub", "https://github.com")
  .url("Documentation", "https://grammy.dev");

// Register the template
registry.register("main", mainMenu);

// Use the registry middleware
bot.use(registry.middleware());

// Send the menu
bot.command("start", async (ctx) => {
  const menu = registry.menu("main");
  await ctx.reply("Loading menu...", { reply_markup: menu });
});

bot.start();
```

## Core Concepts

### MenuTemplate

A `MenuTemplate` is a declarative builder for defining menu structure. It supports:

- **Callback buttons** (`.cb()`) — Buttons with handler functions
- **URL buttons** (`.url()`) — Direct links to websites
- **Web App buttons** (`.webApp()`) — Open Telegram Web Apps
- **Inline query buttons** (`.switchInline()`, `.switchInlineCurrent()`, `.switchInlineChosen()`)
- **Special buttons** — Login, copy text, game, and payment buttons
- **Row control** (`.row()`) — Start a new button row

### MenuRegistry

The `MenuRegistry` manages menu templates and handles callback routing:

- **Register templates** — `registry.register("id", template)`
- **Render menus** — `registry.menu("id")` creates a new menu instance
- **Middleware** — `registry.middleware()` handles callbacks automatically
- **Storage** — Configurable storage adapters for persistence across restarts

### Menu Types

Different menu types support different media attachments:

- **MenuTemplate** — Text-only menus
- **PhotoMenuTemplate** — Menus with photos
- **VideoMenuTemplate** — Menus with videos
- **AnimationMenuTemplate** — Menus with GIF/animations
- **AudioMenuTemplate** — Menus with audio files
- **DocumentMenuTemplate** — Menus with documents

You can convert between types using chainable methods like `.photo()`, `.video()`, etc.

## Examples

### Basic Menu with Callbacks

```ts
const menu = new MenuTemplate("Choose an action:")
  .cb("Option 1", async (ctx) => {
    await ctx.reply("You selected option 1");
  })
  .cb("Option 2", async (ctx) => {
    await ctx.reply("You selected option 2");
  })
  .row()
  .cb("Back", async (ctx) => {
    await ctx.reply("Going back...");
  });

registry.register("basic", menu);
```

### Menu with Media

```ts
const photoMenu = new MenuTemplate("Check out this image!")
  .photo("https://picsum.photos/800/600")
  .cb("Like", async (ctx) => {
    await ctx.reply("Thanks for liking!");
  })
  .cb("Share", async (ctx) => {
    await ctx.reply("Sharing...");
  });

registry.register("photo", photoMenu);
```

### Menu with Mixed Button Types

```ts
const mixedMenu = new MenuTemplate("Explore options:")
  .cb("Settings", async (ctx) => {
    await ctx.reply("Opening settings...");
  })
  .row()
  .url("Website", "https://example.com")
  .webApp("Web App", "https://app.example.com")
  .row()
  .switchInline("Share Bot", "check out this bot");

registry.register("mixed", mixedMenu);
```

### Custom Storage

```ts
import { MenuRegistry } from "./src/mod.ts";

// Use custom storage adapters for persistence
const registry = new MenuRegistry({
  keyPrefix: "mybot",
  menuStorage: new RedisAdapter(),
  navigationStorage: new RedisAdapter(),
});
```

## API Reference

### MenuTemplate Methods

#### Button Methods

- `.cb(label, handler, payload?)` — Add callback button with handler
- `.rawCb(label, callbackData)` — Add raw callback button (manual routing)
- `.url(text, url)` — Add URL button
- `.webApp(text, url)` — Add Web App button
- `.login(text, loginUrl)` — Add login button
- `.switchInline(text, query?)` — Add inline query button
- `.switchInlineCurrent(text, query?)` — Add inline query button (current chat)
- `.switchInlineChosen(text, query?)` — Add inline query button (chosen chat filter)
- `.copyText(text, copyText)` — Add copy text button
- `.game(text)` — Add game button
- `.pay(text)` — Add payment button

#### Layout Methods

- `.row()` — Start a new button row
- `.addText(text)` — Set or replace menu text

#### Media Methods

- `.photo(photo)` — Convert to PhotoMenuTemplate
- `.video(video)` — Convert to VideoMenuTemplate
- `.animation(animation)` — Convert to AnimationMenuTemplate
- `.audio(audio)` — Convert to AudioMenuTemplate
- `.document(document)` — Convert to DocumentMenuTemplate

### MenuRegistry Methods

- `register(templateId, template)` — Register a menu template
- `get(templateId)` — Retrieve a registered template
- `has(templateId)` — Check if template exists
- `menu(templateId)` — Render a menu from template
- `middleware()` — Get the middleware function

## Development

This project uses Deno. Available tasks:

```bash
deno task fmt      # Format code
deno task lint     # Lint code
deno task test     # Run tests
deno task check    # Type-check code
deno task ok       # Run all checks (fmt + lint + test + check)
```

Always run `deno task ok` before committing.

## Contributing

Contributions are welcome! Please:

1. Create a feature branch from `main`
2. Make your changes with appropriate tests
3. Run `deno task ok` to ensure all checks pass
4. Submit a pull request

## License

MIT License — see [LICENSE](./LICENSE) for details.
