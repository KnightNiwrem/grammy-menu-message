export type InlineKeyboardButtonShape = Record<string, unknown>;

export type InlineKeyboardLayout = InlineKeyboardButtonShape[][];

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
