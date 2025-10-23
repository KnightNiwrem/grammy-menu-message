/**
 * grammY Text Vault Plugin - A StorageAdapter-based Plugin Template
 *
 * This plugin demonstrates how to build a grammY plugin that uses the
 * StorageAdapter interface for persistent data storage. It implements a
 * text vault where users can save, list, and delete text entries.
 *
 * @module
 */

export { Menu } from "./menu.ts";
export { vault } from "./plugin.ts";
export type {
  VaultData,
  VaultEntry,
  VaultFlavor,
  VaultOptions,
} from "./plugin.ts";
export type { StorageAdapter } from "grammy";
