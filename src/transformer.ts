import type { StorageAdapter, Transformer } from "./dep.ts";
import type { Context } from "./dep.ts";
import type { NavigationHistoryData, RenderedMenuData } from "./types.ts";
import type { MessagePayload } from "./template.ts";
import { isMenu, Menu } from "./menu.ts";
import { createEmptyNavigationHistory, regularNavStorageKey, renderedMenuStorageKey } from "./utils.ts";
import { isMessage } from "./typeguards/message.ts";

/**
 * Converts a MessagePayload into API payload fields that override the original payload.
 */
function messagePayloadToApiFields(messagePayload: MessagePayload): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  // Handle text content (text for text messages, caption for media messages)
  if (messagePayload.text !== undefined) {
    if (messagePayload.type === "text") {
      fields.text = messagePayload.text;
    } else {
      fields.caption = messagePayload.text;
    }
  }

  // Handle parse mode
  if (messagePayload.parseMode !== undefined) {
    fields.parse_mode = messagePayload.parseMode;
  }

  // Handle entities
  if (messagePayload.entities !== undefined) {
    if (messagePayload.type === "text") {
      fields.entities = messagePayload.entities;
    } else {
      fields.caption_entities = messagePayload.entities;
    }
  }

  // Handle media-specific fields
  switch (messagePayload.type) {
    case "photo":
      fields.photo = messagePayload.photo;
      break;
    case "video":
      fields.video = messagePayload.video;
      break;
    case "animation":
      fields.animation = messagePayload.animation;
      break;
    case "audio":
      fields.audio = messagePayload.audio;
      break;
    case "document":
      fields.document = messagePayload.document;
      break;
    case "voice":
      fields.voice = messagePayload.voice;
      break;
  }

  return fields;
}

/**
 * Creates a transformer function that can be used with ctx.api.config.use()
 * to handle Menu objects in outgoing API calls.
 *
 * This transformer:
 * 1. Stores Menu instances in menuStorage
 * 2. Stores navigation history in navigationStorage
 * 2.1. If navigation history does not exist, it creates new history with the current menu
 * 2.2. If navigation history does exist, then we only push to navigation history if the menu sent is different from the latest menu in history
 * 3. Overrides message payload with the Menu's messagePayload
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

      // Build the new payload by merging message payload fields
      const messageFields = menu.messagePayload ? messagePayloadToApiFields(menu.messagePayload) : {};

      payload = {
        ...payload,
        ...messageFields,
        reply_markup: { inline_keyboard: inlineKeyboard },
      };
      menusToStore.push(menu);
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
