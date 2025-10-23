# grammY Menu Message

A menu system for Telegram bots built with [grammY](https://grammy.dev/). Create inline keyboard menus with automatic callback data management and simple middleware handling.

## Features

- **Simple API**: Easy-to-use `Menu` class for creating inline keyboards
- **Automatic Callback Management**: Automatically generates and handles `callback_data` in the format `<menu_id>:<row>:<column>`
- **Type-Safe**: Full TypeScript support with proper typing
- **Chainable**: Fluent API for building menus
- **Middleware Integration**: Seamless integration with grammY's middleware system

## Quick Start

### Installation

```typescript
import { Menu } from "https://deno.land/x/grammy_menu_message/mod.ts";
// or from JSR (when published)
// import { Menu } from "jsr:@your-scope/grammy-menu-message";
```

### Basic Usage

```typescript
import { Bot } from "grammy";
import { Menu } from "./src/mod.ts";

const bot = new Bot("YOUR_BOT_TOKEN");

// Create a menu
const menu = new Menu("main");

// Add buttons
menu.text("Option 1", async (ctx) => {
  await ctx.reply("You chose option 1!");
});

menu.text("Option 2", async (ctx) => {
  await ctx.reply("You chose option 2!");
});

// Start a new row
menu.row();

// Add more buttons
menu.text("Cancel", async (ctx) => {
  await ctx.editMessageText("Cancelled.");
});

// Register the menu middleware
bot.use(menu.middleware());

// Send the menu
bot.command("start", async (ctx) => {
  await ctx.reply("Choose an option:", {
    reply_markup: { inline_keyboard: menu.inline_keyboard },
  });
});

bot.start();
```

## API Reference

### `Menu<C extends Context>`

The main class for creating inline keyboard menus.

#### Constructor

```typescript
new Menu(id: string)
```

Creates a new menu with a unique identifier.

**Parameters:**

- `id` - A unique identifier for this menu (used in callback_data generation)

#### Methods

##### `text(label: string, callback: MenuButtonCallback<C>): this`

Adds a text button to the current row.

**Parameters:**

- `label` - The button label displayed to users
- `callback` - Function to call when the button is clicked

**Returns:** The menu instance for method chaining

##### `row(): this`

Starts a new row of buttons.

**Returns:** The menu instance for method chaining

##### `middleware(): MiddlewareFn<C>`

Creates middleware that handles callback queries for this menu.

**Returns:** Middleware function to register with `bot.use()`

#### Properties

##### `inline_keyboard: InlineKeyboardButton[][]`

Gets the inline keyboard structure ready to be used with Telegram API methods.

**Returns:** 2D array of InlineKeyboardButton objects

## Examples

### Multi-Level Menu

```typescript
const mainMenu = new Menu("main");
const settingsMenu = new Menu("settings");

// Main menu
mainMenu.text("⚙️ Settings", async (ctx) => {
  await ctx.editMessageText("Settings:", {
    reply_markup: { inline_keyboard: settingsMenu.inline_keyboard },
  });
});

mainMenu.text("ℹ️ Info", async (ctx) => {
  await ctx.editMessageText("Bot information...");
});

// Settings submenu
settingsMenu.text("🔔 Notifications", async (ctx) => {
  await ctx.reply("Toggle notifications");
});

settingsMenu.text("🌐 Language", async (ctx) => {
  await ctx.reply("Select language");
});

settingsMenu.row();

settingsMenu.text("« Back", async (ctx) => {
  await ctx.editMessageText("Main menu:", {
    reply_markup: { inline_keyboard: mainMenu.inline_keyboard },
  });
});

// Register both menus
bot.use(mainMenu.middleware());
bot.use(settingsMenu.middleware());
```

### Grid Layout

```typescript
const menu = new Menu("grid");

// First row
menu.text("1", (ctx) => ctx.reply("Button 1"));
menu.text("2", (ctx) => ctx.reply("Button 2"));
menu.text("3", (ctx) => ctx.reply("Button 3"));

// Second row
menu.row();
menu.text("4", (ctx) => ctx.reply("Button 4"));
menu.text("5", (ctx) => ctx.reply("Button 5"));
menu.text("6", (ctx) => ctx.reply("Button 6"));

// Third row
menu.row();
menu.text("7", (ctx) => ctx.reply("Button 7"));
menu.text("8", (ctx) => ctx.reply("Button 8"));
menu.text("9", (ctx) => ctx.reply("Button 9"));
```

### Running the Examples

A complete example is provided in `examples/menu.ts`. To run it:

1. Set your bot token:
   ```bash
   export BOT_TOKEN="your-token-here"
   ```

2. Run the example:
   ```bash
   deno run --allow-net --allow-env examples/menu.ts
   ```

## How It Works

### Callback Data Format

The Menu class automatically generates `callback_data` for each button in the format:

```
<menu_id>:<row_index>:<column_index>
```

For example:

- `main:0:0` - First button in the first row of the "main" menu
- `main:0:1` - Second button in the first row
- `main:1:0` - First button in the second row

### Middleware Handling

When a user clicks a button, the middleware:

1. Intercepts the callback query
2. Parses the `callback_data` to extract menu ID, row, and column
3. Verifies the callback belongs to this menu
4. Finds the corresponding button handler
5. Answers the callback query (removes loading state)
6. Invokes the button's callback function

## Development

This project uses Deno and includes several development tasks:

- `deno task fmt` - Format the code
- `deno task lint` - Lint the code
- `deno task test` - Run the test suite
- `deno task check` - Type-check the code
- `deno task ok` - Run all checks (format, lint, test, check)

## Project Structure

```
.
├── src/
│   ├── mod.ts          # Main exports
│   ├── menu.ts         # Menu class implementation
│   └── plugin.ts       # Vault plugin (legacy)
├── test/
│   ├── menu_test.ts    # Menu tests
│   └── plugin_test.ts  # Plugin tests
├── examples/
│   ├── menu.ts         # Menu example
│   └── basic.ts        # Vault example
├── deno.json           # Deno configuration
└── README.md           # This file
```

## License

MIT License
