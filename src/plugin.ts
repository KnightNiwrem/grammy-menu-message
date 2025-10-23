import type { Context, MiddlewareFn, StorageAdapter } from "grammy";

/**
 * A single text entry in the vault.
 */
export interface VaultEntry {
  id: string;
  text: string;
  createdAt: number;
}

/**
 * Data stored by the text vault plugin for each user.
 */
export interface VaultData {
  entries: VaultEntry[];
}

/**
 * Context flavor that adds text vault functionality to the context object.
 */
export interface VaultFlavor {
  /**
   * Text vault data for the current user.
   * Contains all stored text entries.
   */
  vault: VaultData;
}

/**
 * Options for configuring the text vault plugin.
 */
export interface VaultOptions<C extends Context = Context> {
  /**
   * A function that produces an initial vault for new users.
   * If not provided, an empty vault will be created.
   */
  initial?: () => VaultData;

  /**
   * An optional prefix to prepend to the storage key.
   */
  prefix?: string;

  /**
   * This option lets you generate your own storage keys per context object.
   * The default implementation stores data per user ID.
   */
  getStorageKey?: (
    ctx: Omit<C, "vault">,
  ) => Promise<string | undefined> | string | undefined;

  /**
   * A storage adapter to your storage solution. Provides read, write, and
   * delete access to the vault middleware.
   *
   * You must provide a storage adapter. Example with memory storage:
   * ```ts
   * import { MemorySessionStorage } from "grammy";
   * const storage = new MemorySessionStorage<VaultData>();
   * ```
   */
  storage: StorageAdapter<VaultData>;
}

/**
 * Default storage key function - stores data per user.
 */
function defaultGetStorageKey(ctx: Context): string | undefined {
  return ctx.from?.id.toString();
}

/**
 * Creates middleware that adds a text vault storage to your bot.
 *
 * The text vault allows users to store, retrieve, and manage text entries.
 * Each user has their own vault that persists across bot restarts (when using
 * a persistent storage adapter).
 *
 * Example usage:
 * ```ts
 * import { Bot, MemorySessionStorage } from "grammy";
 * import { vault } from "./mod.ts";
 *
 * const bot = new Bot("YOUR_BOT_TOKEN");
 *
 * // Use with a storage adapter
 * bot.use(vault({
 *   storage: new MemorySessionStorage<VaultData>(),
 * }));
 *
 * // Add text to vault
 * bot.command("save", (ctx) => {
 *   const text = ctx.match;
 *   if (!text) return ctx.reply("Please provide text to save!");
 *
 *   const entry: VaultEntry = {
 *     id: crypto.randomUUID(),
 *     text,
 *     createdAt: Date.now(),
 *   };
 *   ctx.vault.entries.push(entry);
 *   ctx.reply(`Saved! Entry ID: ${entry.id}`);
 * });
 *
 * // List all entries
 * bot.command("list", (ctx) => {
 *   const entries = ctx.vault.entries;
 *   if (entries.length === 0) {
 *     return ctx.reply("Your vault is empty!");
 *   }
 *   const list = entries.map((e, i) =>
 *     `${i + 1}. ${e.text}\n   ID: ${e.id}`
 *   ).join("\n\n");
 *   ctx.reply(`Your vault:\n\n${list}`);
 * });
 *
 * // Delete an entry
 * bot.command("delete", (ctx) => {
 *   const id = ctx.match;
 *   const index = ctx.vault.entries.findIndex(e => e.id === id);
 *   if (index === -1) {
 *     return ctx.reply("Entry not found!");
 *   }
 *   ctx.vault.entries.splice(index, 1);
 *   ctx.reply("Entry deleted!");
 * });
 * ```
 *
 * @param options Configuration options for the vault plugin
 * @returns Middleware function
 */
export function vault<C extends Context = Context>(
  options: VaultOptions<C>,
): MiddlewareFn<C & VaultFlavor> {
  const {
    initial = () => ({ entries: [] }),
    storage,
    getStorageKey = defaultGetStorageKey,
    prefix = "",
  } = options;

  return async (ctx, next) => {
    // Get the storage key for this context
    const rawKey = await getStorageKey(ctx);

    if (rawKey === undefined) {
      throw new Error(
        "Cannot access vault data because the storage key is undefined! " +
          "This update does not have a user ID, or you provided a custom " +
          "getStorageKey function that returned undefined.",
      );
    }

    const key = prefix + rawKey;

    // Read existing data from storage
    let data: VaultData | undefined = await storage.read(key);

    // Initialize with default value if data doesn't exist
    if (data === undefined) {
      data = initial();
      await storage.write(key, data);
    }

    // Make data available on context
    // @ts-ignore: Adding property to context
    ctx.vault = data;

    // Call downstream middleware
    await next();

    // Write back to storage after middleware completes
    // @ts-ignore: Property was added above
    const updatedData: VaultData | null | undefined = ctx.vault;

    if (updatedData === null || updatedData === undefined) {
      // Delete data if set to null/undefined
      await storage.delete(key);
    } else {
      // Write updated data back to storage
      await storage.write(key, updatedData);
    }
  };
}
