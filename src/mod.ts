/**
 * grammY Menu Message - Menu system for Telegram bots
 *
 * This module provides a Menu class for creating inline keyboard menus
 * with automatic callback_data management and middleware handling.
 *
 * @module
 */

export { Menu } from "./menu.ts";
export type { MenuButtonCallback } from "./menu.ts";

export { vault } from "./plugin.ts";
export type {
  VaultData,
  VaultEntry,
  VaultFlavor,
  VaultOptions,
} from "./plugin.ts";
export type { StorageAdapter } from "grammy";
