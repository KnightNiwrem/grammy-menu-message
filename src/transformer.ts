import type { StorageAdapter, Transformer } from "./dep.ts";
import type { Context } from "./dep.ts";
import type { NavigationHistoryData, RenderedMenuData } from "./types.ts";
import { BaseMenu, isBaseMenu } from "./menu/base.ts";
import { createEmptyNavigationHistory, regularNavStorageKey, renderedMenuStorageKey } from "./utils.ts";
import { isMessage } from "./typeguards/message.ts";

/**
 * Creates a transformer function that can be used with ctx.api.config.use()
 * to handle Menu objects in outgoing API calls.
 *
 * This transformer:
 * 1. Stores Menu instances in menuStorage
 * 2. Stores navigation history in navigationStorage
 * 2.1. If navigation history does not exist, it creates new history with the current menu
 * 2.2. If navigation history does exist, then we only push to navigation history if the menu sent is different from the latest menu in history
 * 3. Replaces the Menu's reply_markup with its inline keyboard
 * 4. Sets text/caption based on the API method and menu type:
 *    - For sendMessage and editMessageText: sets text (if menu has messageText)
 *    - For sendPhoto, sendVideo, sendAnimation, sendAudio, sendDocument, sendVoice, editMessageCaption, and editMessageMedia: sets caption (if menu has media)
 *    - For editMessageReplyMarkup and others: leaves text/caption unchanged
 *
 * @template C The grammY Context type
 * @param storageKeyPrefix The prefix used for storage keys
 * @param menuStorage Storage adapter for menu data
 * @param navigationStorage Storage adapter for navigation history
 * @returns A transformer function suitable for ctx.api.config.use()
 */
export function createMenuRegistryTransformer<C extends Context>(
  storageKeyPrefix: string,
  menuStorage: StorageAdapter<RenderedMenuData>,
  navigationStorage: StorageAdapter<NavigationHistoryData>,
): Transformer {
  return async (prev, method, payload, signal) => {
    if (!payload) {
      return prev(method, payload, signal);
    }

    interface MenuStoreItem<C extends Context> {
      menu: BaseMenu<C>;
      messageText?: string;
      media?: unknown;
    }

    const menusToStore: MenuStoreItem<C>[] = [];

    // Handle top-level reply_markup
    if ("reply_markup" in payload && isBaseMenu(payload.reply_markup)) {
      const menu = payload.reply_markup;
      const inlineKeyboard = menu.inline_keyboard;

      // Replace reply_markup with inline keyboard
      payload = {
        ...payload,
        reply_markup: { inline_keyboard: inlineKeyboard },
      };

      let messageText: string | undefined;
      let media: unknown;

      // Extract messageText if present (TextMenu, media menus don't have this at root)
      if ("messageText" in menu && typeof menu.messageText === "string") {
        messageText = menu.messageText;
      }

      // Extract media if present (PhotoMenu, VideoMenu, etc.)
      if ("photo" in menu) media = menu.photo;
      else if ("video" in menu) media = menu.video;
      else if ("animation" in menu) media = menu.animation;
      else if ("audio" in menu) media = menu.audio;
      else if ("document" in menu) media = menu.document;

      // Replace text/caption based on the API method
      if (messageText) {
        if (method === "sendMessage" || method === "editMessageText") {
          payload = { ...payload, text: messageText };
        }
      }

      if (media) {
        if (
          method === "sendPhoto" || method === "sendVideo" ||
          method === "sendAnimation" || method === "sendAudio" ||
          method === "sendDocument" || method === "sendVoice"
        ) {
          // For send methods, set media based on type
          if ("photo" in menu && method === "sendPhoto") {
            payload = { ...payload, photo: media };
          } else if ("video" in menu && method === "sendVideo") {
            payload = { ...payload, video: media };
          } else if ("animation" in menu && method === "sendAnimation") {
            payload = { ...payload, animation: media };
          } else if ("audio" in menu && method === "sendAudio") {
            payload = { ...payload, audio: media };
          } else if ("document" in menu && method === "sendDocument") {
            payload = { ...payload, document: media };
          }
        } else if (method === "editMessageCaption") {
          if (messageText) {
            payload = { ...payload, caption: messageText };
          }
        } else if (method === "editMessageMedia") {
          if (typeof payload.media === "object" && payload.media !== null) {
            payload = {
              ...payload,
              media: {
                ...payload.media,
                media,
                ...(messageText ? { caption: messageText } : {}),
              },
            };
          }
        }
      }
      // For editMessageReplyMarkup and other methods, don't set text/caption

      menusToStore.push({ menu, messageText, media });
    }

    if (menusToStore.length === 0) {
      return prev(method, payload, signal);
    }

    const response = await prev(method, payload, signal);
    if (!response.ok) {
      return response;
    }
    const result = response.result;
    const timestamp = Date.now();

    // Now that we have sent out the menus, we should store them in menuStorage
    for (const { menu } of menusToStore) {
      const key = renderedMenuStorageKey(storageKeyPrefix, menu.renderedMenuId);
      await menuStorage.write(key, { timestamp, templateMenuId: menu.templateMenuId });
    }

    // Navigation implies sending/editing only 1 menu
    if (menusToStore.length !== 1) {
      return response;
    }
    const { menu } = menusToStore[0];

    // Determine navKeyId based on response to store to navigationStorage, if able
    let navKeyId: string | undefined;
    if (isMessage(result)) {
      navKeyId = regularNavStorageKey(storageKeyPrefix, result.chat.id, result.message_id);
    }

    // Store new navigation history entry, if it is a navigation
    if (navKeyId) {
      const navigationStorageData = await navigationStorage.read(navKeyId) ??
        createEmptyNavigationHistory();
      const navHistory = navigationStorageData.navigationHistory;
      if (navHistory.length > 0 && navHistory[navHistory.length - 1].renderedMenuId !== menu.renderedMenuId) {
        const menuNavigationHistoryRecord = {
          timestamp,
          renderedMenuId: menu.renderedMenuId,
          templateMenuId: menu.templateMenuId,
        };
        navHistory.push(menuNavigationHistoryRecord);
        await navigationStorage.write(navKeyId, navigationStorageData);
      }
    }

    return response;
  };
}
