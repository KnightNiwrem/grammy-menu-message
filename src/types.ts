type MenuButton = Record<string, unknown>;

type MenuKeyboard = MenuButton[][];

type RenderedMenu = {
  templateMenuId: string;
  keyboard: MenuKeyboard;
};

type NavigationHistoryEntry = {
  menu: string;
  timestamp: number;
};

/**
 *  * The complete shape of the storage object.
 */
type StorageShape = Record<string, {
  menus: Record<string, RenderedMenu>;
  navigation: NavigationHistoryEntry[];
}>;
