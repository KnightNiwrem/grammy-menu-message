import type { InlineKeyboardButton } from "grammy/types";

export type InlineKeyboardLayout = InlineKeyboardButton[][];

export interface PersistedMenuSnapshot {
  templateId: string;
  keyboard: InlineKeyboardLayout;
}

export interface MenuNavigationRecord {
  menuId: string;
  timestamp: number;
}

export interface MenuRegistryStorageSnapshot {
  menus: Record<string, PersistedMenuSnapshot>;
  navigationHistory: MenuNavigationRecord[];
}
