# Examples

This directory contains example bots demonstrating various features of grammY Menu Message.

## Prerequisites

Before running any example, set your Telegram bot token:

```bash
export BOT_TOKEN=your_bot_token_here
```

You can get a bot token from [@BotFather](https://t.me/BotFather) on Telegram.

## Running Examples

Each example can be run with Deno:

```bash
# Basic example
deno run --allow-env --allow-net examples/basic.ts

# Media example
deno run --allow-env --allow-net examples/media.ts

# Navigation example
deno run --allow-env --allow-net examples/navigation.ts

# Advanced example
deno run --allow-env --allow-net examples/advanced.ts
```

## Example Descriptions

### `basic.ts`

Demonstrates the fundamentals:

- Creating a simple menu with callback buttons
- Adding URL buttons
- Handling button clicks with async handlers
- Basic menu registration and rendering

**Commands:**

- `/start` - Show the main menu
- `/menu` - Alternative way to show the menu

### `media.ts`

Shows how to work with media menus:

- Photo menus with captions
- Video menus
- Animation/GIF menus
- Converting between menu types
- Multiple menu navigation

**Commands:**

- `/start` - Main media gallery menu
- `/photo` - Direct access to photo menu
- `/video` - Direct access to video menu
- `/animation` - Direct access to animation menu

### `navigation.ts`

Demonstrates multi-level menu navigation:

- Parent and child menus
- Back button implementation
- Menu transitions with `editMessageText`
- Organizing menus hierarchically

**Commands:**

- `/start` - Start the bot and show main menu
- `/menu` - Show main menu

### `advanced.ts`

Showcases advanced features:

- Inline query buttons (`switchInline`, `switchInlineCurrent`, `switchInlineChosen`)
- Web App buttons
- Copy text buttons
- Dynamic menus with state
- Raw callback handlers
- Mixed button types in one menu

**Commands:**

- `/start` - Show the advanced features menu

## Code Style

All examples follow the project's coding standards:

- Use `async`/`await` for asynchronous operations
- Proper error handling
- Type-safe context usage
- Clean, readable code structure

## Creating Your Own Bot

To create your own bot based on these examples:

1. Copy the example that best matches your needs
2. Modify the menu templates and handlers
3. Add your custom logic
4. Test thoroughly with `deno run`
5. Deploy to your preferred hosting service

## Troubleshooting

**Bot doesn't respond:**

- Verify your `BOT_TOKEN` is correct
- Check that the bot is not already running elsewhere
- Ensure you have network access

**Media not showing:**

- Verify media URLs are publicly accessible
- Check file size limits (Telegram has restrictions)
- Ensure URLs use HTTPS for photos/videos

**Callbacks not working:**

- Verify `registry.middleware()` is registered with `bot.use()`
- Check that templates are registered before rendering
- Look for errors in console output

## Learn More

- [grammY Documentation](https://grammy.dev)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Main README](../README.md)
