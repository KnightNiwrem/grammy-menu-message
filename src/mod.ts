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

export { BaseMenu, isMenu } from "./menu/base.ts";
export { TextMenu } from "./menu/text.ts";
export { PhotoMenu } from "./menu/photo.ts";
export { VideoMenu } from "./menu/video.ts";
export { AnimationMenu } from "./menu/animation.ts";
export { AudioMenu } from "./menu/audio.ts";
export { DocumentMenu } from "./menu/document.ts";
export { BaseMenuTemplate } from "./templates/base.ts";
export type { BaseMenuTemplate as MenuTemplateType } from "./templates/base.ts";
export { MenuTemplate } from "./templates/template.ts";
export { PhotoMenuTemplate } from "./templates/photo.ts";
export { VideoMenuTemplate } from "./templates/video.ts";
export { AnimationMenuTemplate } from "./templates/animation.ts";
export { AudioMenuTemplate } from "./templates/audio.ts";
export { DocumentMenuTemplate } from "./templates/document.ts";
export { MenuRegistry } from "./registry.ts";
export { createMenuRegistryTransformer } from "./transformer.ts";
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
