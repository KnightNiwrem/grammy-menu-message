import type { StorageAdapter, Transformer } from "./dep.ts";
import type { Context } from "./dep.ts";
import type { NavigationHistoryData, RenderedMenuData } from "./types.ts";
import { isMenu, Menu } from "./menu.ts";
import {
  createEmptyNavigationHistory,
  inlineNavStorageKey,
  regularNavStorageKey,
  renderedMenuStorageKey,
} from "./utils.ts";
import { isMessage } from "./typeguards/message.ts";

/**
 * Creates a transformer function that can be used with ctx.api.config.use()
 * to handle Menu objects in outgoing API calls.
 *
 * This transformer:
 * 1. Stores Menu instances in menuStorage
 * 1.1. If answering an inline query, we store all menus
 * 1.2. If sending menu via any other methods (e.g. sendMessage, editMessageText), we only store menu if `await prev` succeeds
 * 2. Stores navigation history in navigationStorage
 * 2.1. If navigation history does not exist, it implies the menu was sent via answering an inline query, so we set the history
 * to contain both the answered menu as well as any new menu in the current `await prev` call.
 * 2.2 If navigation history does exist, then we only push to navigation history if the menu sent is different from the latest menu in history
 * 3. Overrides message text with the Menu's messageText
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

    const menusToStore: Menu<C>[] = [];

    // Handle top-level reply_markup
    if ("reply_markup" in payload && isMenu(payload.reply_markup)) {
      const menu = payload.reply_markup;
      const inlineKeyboard = menu.inline_keyboard;
      payload = {
        ...payload,
        text: menu.messageText,
        reply_markup: { inline_keyboard: inlineKeyboard },
      };
      menusToStore.push(menu);
    }

    // Handle results array (e.g., answerInlineQuery)
    if ("results" in payload && Array.isArray(payload.results)) {
      payload.results = payload.results.map((result) => {
        if (
          result && typeof result === "object" && "reply_markup" in result && isMenu(result.reply_markup)
        ) {
          const menu = result.reply_markup;
          const inlineKeyboard = menu.inline_keyboard;
          menusToStore.push(menu);
          return {
            ...result,
            message_text: menu.messageText,
            reply_markup: { inline_keyboard: inlineKeyboard },
          };
        }
        return result;
      });
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
    for (const menu of menusToStore) {
      const key = renderedMenuStorageKey(storageKeyPrefix, menu.renderedMenuId);
      await menuStorage.write(key, { timestamp, templateMenuId: menu.templateMenuId });
    }

    // Navigation implies sending/editing only 1 menu
    if (menusToStore.length !== 1) {
      return response;
    }
    const menu = menusToStore[0];

    // Determine navKeyId based on response to store to navigationStorage, if able
    let navKeyId: string | undefined;
    if (isMessage(result)) {
      navKeyId = regularNavStorageKey(storageKeyPrefix, result.chat.id, result.message_id);
    }
    if (result === true && "inline_message_id" in payload && !!payload.inline_message_id) {
      navKeyId = inlineNavStorageKey(storageKeyPrefix, payload.inline_message_id);
    }

    // Store new navigation history entry, if it is a navigation
    if (navKeyId) {
      const navigationStorageData = await navigationStorage.read(navKeyId) ??
        createEmptyNavigationHistory();
      const navHistory = navigationStorageData.navigationHistory;

      // If navigation history does not exist (empty), it implies the menu was sent via answering
      // an inline query, so we set the history to contain the current menu (section 2.1)
      if (navHistory.length === 0) {
        const menuNavigationHistoryRecord = {
          timestamp,
          renderedMenuId: menu.renderedMenuId,
          templateMenuId: menu.templateMenuId,
        };
        navHistory.push(menuNavigationHistoryRecord);
        await navigationStorage.write(navKeyId, navigationStorageData);
      } // If navigation history does exist, then we only push to navigation history if the
      // menu sent is different from the latest menu in history (section 2.2)
      else if (navHistory[navHistory.length - 1].renderedMenuId !== menu.renderedMenuId) {
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
