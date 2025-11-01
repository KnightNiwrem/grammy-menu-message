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
export { isCallbackButton } from "./typeguards/callback-button.ts";
export { isCopyTextButton } from "./typeguards/copy-text-button.ts";
export { isGameButton } from "./typeguards/game-button.ts";
export { isLoginButton } from "./typeguards/login-button.ts";
export { isPayButton } from "./typeguards/pay-button.ts";
export { isSwitchInlineButton } from "./typeguards/switch-inline-button.ts";
export { isSwitchInlineChosenChatButton } from "./typeguards/switch-inline-chosen-chat-button.ts";
export { isSwitchInlineCurrentChatButton } from "./typeguards/switch-inline-current-chat-button.ts";
export { isUrlButton } from "./typeguards/url-button.ts";
export { isWebAppButton } from "./typeguards/web-app-button.ts";
export { isMessage } from "./typeguards/message.ts";
