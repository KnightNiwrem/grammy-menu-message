/**
 * grammY Menu Message - A menu system for grammY bots
 *
 * Provides MenuTemplate for defining menu structures, MenuRegistry for managing
 * registered templates, and Menu for rendering inline keyboards with persistent
 * navigation history support.
 *
 * @module
 */

export type {
  MenuButton,
  MenuButtonHandler,
  MenuNavigationHistoryRecord,
  NavigationHistoryData,
  RenderedMenuData,
} from "./types.ts";

export { isMenu, Menu } from "./menu.ts";
export { MenuTemplate } from "./template.ts";
export { MenuRegistry } from "./registry.ts";
export { isInlineKeyboardButton } from "./typeguards/inline-keyboard-button.ts";
export { isMessage } from "./typeguards/message.ts";
export {
  isCallbackButton,
  isCopyTextButton,
  isGameButton,
  isLoginButton,
  isPayButton,
  isSwitchInlineButton,
  isSwitchInlineChosenChatButton,
  isSwitchInlineCurrentChatButton,
  isUrlButton,
  isWebAppButton,
} from "./utils.ts";
