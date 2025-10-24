/**
 * grammY Menu Message - A menu system for grammY bots
 *
 * Provides MenuTemplate for defining menu structures, MenuRegistry for managing
 * registered templates, and Menu for rendering inline keyboards.
 *
 * @module
 */

export { Menu } from "./menu.ts";
export { MenuTemplate } from "./template.ts";
export { MenuRegistry, type StorageAdapter } from "./registry.ts";
export { vault } from "./plugin.ts";
export type {
  VaultData,
  VaultEntry,
  VaultFlavor,
  VaultOptions,
} from "./plugin.ts";
