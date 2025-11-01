import type { StorageAdapter, Transformer } from "./dep.ts";
import type { Context, RawApi } from "./dep.ts";
import type { MenuNavigationHistoryRecord, NavigationHistoryData, RenderedMenuData } from "./types.ts";
import { Menu } from "./menu.ts";
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
 * 2. Stores navigation history in navigationStorage
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
  renderedMenus?: Map<string, Menu<C>>,
): Transformer<RawApi> {
  return async (prev, method, payload, signal) => {
    if (!payload) {
      return prev(method, payload, signal);
    }

    const menusToStore: Menu<C>[] = [];
    let shouldTransform = false;

    // Handle top-level reply_markup
    if ("reply_markup" in payload && payload.reply_markup instanceof Menu) {
      const menu = payload.reply_markup;
      const inlineKeyboard = menu.inline_keyboard;
      payload = {
        ...payload,
        text: menu.messageText,
        reply_markup: { inline_keyboard: inlineKeyboard },
      };
      menusToStore.push(menu);
      shouldTransform = true;
    }

    // Handle results array (e.g., answerInlineQuery)
    if ("results" in payload && Array.isArray(payload.results)) {
      payload.results = payload.results.map((result) => {
        if (
          result && typeof result === "object" && "reply_markup" in result && result.reply_markup instanceof Menu
        ) {
          const menu = result.reply_markup;
          const inlineKeyboard = menu.inline_keyboard;
          menusToStore.push(menu);
          shouldTransform = true;
          return {
            ...result,
            message_text: menu.messageText,
            reply_markup: { inline_keyboard: inlineKeyboard },
          };
        }
        return result;
      });
    }

    if (!shouldTransform || menusToStore.length === 0) {
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
      if (renderedMenus) {
        renderedMenus.set(menu.renderedMenuId, menu);
      }
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
