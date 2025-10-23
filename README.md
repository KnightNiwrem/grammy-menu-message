# grammY Storage Adapter Plugin Template

This repository provides a template for creating grammY plugins that leverage the `StorageAdapter` interface for data persistence. It includes a complete example of a "text vault" plugin, demonstrating how to store, retrieve, and manage user-specific data.

## Overview

This template is designed to help you build your own grammY storage-based plugins. The included `vault` plugin serves as a practical example, showcasing the following capabilities:

- **Storage Agnostic**: Works with any `StorageAdapter` implementation from grammY.
- **User-Specific Data**: Demonstrates how to handle data storage on a per-user basis.
- **CRUD Operations**: Provides a full example of creating, reading, updating, and deleting data.
- **TypeScript Support**: The code is fully typed.
- **Testing**: Includes a comprehensive test suite.

## Quick Start

To use the `vault` plugin in your bot, you need to install and configure it with a storage adapter.

```typescript
import { Bot, MemorySessionStorage } from "grammy";
import { vault, type VaultData } from "./src/mod.ts";

const bot = new Bot("YOUR_BOT_TOKEN");

// Install the vault plugin with a storage adapter
bot.use(vault({
  storage: new MemorySessionStorage<VaultData>(),
}));

// Example: Save text to the vault
bot.command("save", (ctx) => {
  const text = ctx.match;
  if (!text) return ctx.reply("Please provide text to save.");

  ctx.vault.entries.push({
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now(),
  });
  ctx.reply("Saved to your vault!");
});

// Example: List all entries
bot.command("list", (ctx) => {
  if (ctx.vault.entries.length === 0) {
    return ctx.reply("Your vault is empty.");
  }
  const list = ctx.vault.entries
    .map((e, i) => `${i + 1}. ${e.text}`)
    .join("\n");
  ctx.reply(`Your vault:\n\n${list}`);
});

// Example: Delete an entry
bot.command("delete", (ctx) => {
  const id = ctx.match;
  const index = ctx.vault.entries.findIndex((e) => e.id.startsWith(id));
  if (index === -1) return ctx.reply("Entry not found.");
  ctx.vault.entries.splice(index, 1);
  ctx.reply("Deleted!");
});

bot.start();
```

## Running the Example

An example bot is provided in `example.ts`. To run it:

1. Set your bot token as an environment variable:
   ```bash
   export BOT_TOKEN="your-token-here"
   ```
2. Run the example file:
   ```bash
   deno run --allow-net --allow-env example.ts
   ```

The example bot supports the following commands: `/start`, `/save <text>`, `/list`, `/delete <id>`, `/clear`, and `/count`.

## Persistent Storage

This plugin template is compatible with any `StorageAdapter`. Here are a few examples using storage adapters from `@grammyjs/storage`:

```typescript
// PostgreSQL
import { PostgresAdapter } from "@grammyjs/storage-postgres";
bot.use(vault({
  storage: new PostgresAdapter({
    host: "localhost",
    database: "mybot",
  }),
}));

// Redis
import { RedisAdapter } from "@grammyjs/storage-redis";
bot.use(vault({
  storage: new RedisAdapter({ url: "redis://localhost:6379" }),
}));

// File System
import { FileAdapter } from "@grammyjs/storage-file";
bot.use(vault({
  storage: new FileAdapter({ dirName: "vault-data" }),
}));
```

## Customization

### Data Structure

You can modify the data structure stored by the plugin by editing the `VaultData` interface in `src/plugin.ts`.

```typescript
export interface VaultData {
  entries: VaultEntry[];
  // Add your own properties here
}
```

### Storage Key

By default, data is stored on a per-user basis. You can change this behavior by providing a `getStorageKey` function.

```typescript
// Store data per chat
bot.use(vault({
  storage: myStorage,
  getStorageKey: (ctx) => ctx.chat?.id.toString(),
}));
```

## Development

This project includes several Deno tasks to help with development:

- `deno task fmt`: Format the code.
- `deno task lint`: Lint the code.
- `deno task test`: Run the test suite.
- `deno task check`: Type-check the code.
- `deno task ok`: Run all checks.

## Project Structure

```
.
├── src/
│   ├── mod.ts          # Main exports
│   └── plugin.ts       # Vault plugin implementation
├── test/
│   └── plugin_test.ts  # Test suite
├── example.ts          # Example bot
├── deno.json           # Deno configuration
└── README.md           # This file
```

## License

This project is licensed under the MIT License.
