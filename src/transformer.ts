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
  switch (messagePayload.type) {
    case "text":
      return { text: messagePayload.text };

    case "photo":
      return {
        photo: messagePayload.photo,
        ...(messagePayload.options?.caption !== undefined && { caption: messagePayload.options.caption }),
        ...(messagePayload.options?.parseMode !== undefined && { parse_mode: messagePayload.options.parseMode }),
        ...(messagePayload.options?.captionEntities !== undefined && {
          caption_entities: messagePayload.options.captionEntities,
        }),
        ...(messagePayload.options?.showCaptionAboveMedia !== undefined && {
          show_caption_above_media: messagePayload.options.showCaptionAboveMedia,
        }),
        ...(messagePayload.options?.hasSpoiler !== undefined && { has_spoiler: messagePayload.options.hasSpoiler }),
      };

    case "video":
      return {
        video: messagePayload.video,
        ...(messagePayload.options?.caption !== undefined && { caption: messagePayload.options.caption }),
        ...(messagePayload.options?.parseMode !== undefined && { parse_mode: messagePayload.options.parseMode }),
        ...(messagePayload.options?.captionEntities !== undefined && {
          caption_entities: messagePayload.options.captionEntities,
        }),
        ...(messagePayload.options?.showCaptionAboveMedia !== undefined && {
          show_caption_above_media: messagePayload.options.showCaptionAboveMedia,
        }),
        ...(messagePayload.options?.hasSpoiler !== undefined && { has_spoiler: messagePayload.options.hasSpoiler }),
        ...(messagePayload.options?.duration !== undefined && { duration: messagePayload.options.duration }),
        ...(messagePayload.options?.width !== undefined && { width: messagePayload.options.width }),
        ...(messagePayload.options?.height !== undefined && { height: messagePayload.options.height }),
        ...(messagePayload.options?.thumbnail !== undefined && { thumbnail: messagePayload.options.thumbnail }),
        ...(messagePayload.options?.supportsStreaming !== undefined && {
          supports_streaming: messagePayload.options.supportsStreaming,
        }),
      };

    case "animation":
      return {
        animation: messagePayload.animation,
        ...(messagePayload.options?.caption !== undefined && { caption: messagePayload.options.caption }),
        ...(messagePayload.options?.parseMode !== undefined && { parse_mode: messagePayload.options.parseMode }),
        ...(messagePayload.options?.captionEntities !== undefined && {
          caption_entities: messagePayload.options.captionEntities,
        }),
        ...(messagePayload.options?.showCaptionAboveMedia !== undefined && {
          show_caption_above_media: messagePayload.options.showCaptionAboveMedia,
        }),
        ...(messagePayload.options?.hasSpoiler !== undefined && { has_spoiler: messagePayload.options.hasSpoiler }),
        ...(messagePayload.options?.duration !== undefined && { duration: messagePayload.options.duration }),
        ...(messagePayload.options?.width !== undefined && { width: messagePayload.options.width }),
        ...(messagePayload.options?.height !== undefined && { height: messagePayload.options.height }),
        ...(messagePayload.options?.thumbnail !== undefined && { thumbnail: messagePayload.options.thumbnail }),
      };

    case "audio":
      return {
        audio: messagePayload.audio,
        ...(messagePayload.options?.caption !== undefined && { caption: messagePayload.options.caption }),
        ...(messagePayload.options?.parseMode !== undefined && { parse_mode: messagePayload.options.parseMode }),
        ...(messagePayload.options?.captionEntities !== undefined && {
          caption_entities: messagePayload.options.captionEntities,
        }),
        ...(messagePayload.options?.duration !== undefined && { duration: messagePayload.options.duration }),
        ...(messagePayload.options?.performer !== undefined && { performer: messagePayload.options.performer }),
        ...(messagePayload.options?.title !== undefined && { title: messagePayload.options.title }),
        ...(messagePayload.options?.thumbnail !== undefined && { thumbnail: messagePayload.options.thumbnail }),
      };

    case "document":
      return {
        document: messagePayload.document,
        ...(messagePayload.options?.caption !== undefined && { caption: messagePayload.options.caption }),
        ...(messagePayload.options?.parseMode !== undefined && { parse_mode: messagePayload.options.parseMode }),
        ...(messagePayload.options?.captionEntities !== undefined && {
          caption_entities: messagePayload.options.captionEntities,
        }),
        ...(messagePayload.options?.thumbnail !== undefined && { thumbnail: messagePayload.options.thumbnail }),
        ...(messagePayload.options?.disableContentTypeDetection !== undefined && {
          disable_content_type_detection: messagePayload.options.disableContentTypeDetection,
        }),
      };

    case "voice":
      return {
        voice: messagePayload.voice,
        ...(messagePayload.options?.caption !== undefined && { caption: messagePayload.options.caption }),
        ...(messagePayload.options?.parseMode !== undefined && { parse_mode: messagePayload.options.parseMode }),
        ...(messagePayload.options?.captionEntities !== undefined && {
          caption_entities: messagePayload.options.captionEntities,
        }),
        ...(messagePayload.options?.duration !== undefined && { duration: messagePayload.options.duration }),
      };

    case "location":
      return {
        latitude: messagePayload.latitude,
        longitude: messagePayload.longitude,
        ...(messagePayload.options?.horizontalAccuracy !== undefined && {
          horizontal_accuracy: messagePayload.options.horizontalAccuracy,
        }),
        ...(messagePayload.options?.livePeriod !== undefined && { live_period: messagePayload.options.livePeriod }),
        ...(messagePayload.options?.heading !== undefined && { heading: messagePayload.options.heading }),
        ...(messagePayload.options?.proximityAlertRadius !== undefined && {
          proximity_alert_radius: messagePayload.options.proximityAlertRadius,
        }),
      };

    case "venue":
      return {
        latitude: messagePayload.latitude,
        longitude: messagePayload.longitude,
        title: messagePayload.title,
        address: messagePayload.address,
        ...(messagePayload.options?.foursquareId !== undefined && {
          foursquare_id: messagePayload.options.foursquareId,
        }),
        ...(messagePayload.options?.foursquareType !== undefined && {
          foursquare_type: messagePayload.options.foursquareType,
        }),
        ...(messagePayload.options?.googlePlaceId !== undefined && {
          google_place_id: messagePayload.options.googlePlaceId,
        }),
        ...(messagePayload.options?.googlePlaceType !== undefined && {
          google_place_type: messagePayload.options.googlePlaceType,
        }),
      };

    case "contact":
      return {
        phone_number: messagePayload.phoneNumber,
        first_name: messagePayload.firstName,
        ...(messagePayload.options?.lastName !== undefined && { last_name: messagePayload.options.lastName }),
        ...(messagePayload.options?.vcard !== undefined && { vcard: messagePayload.options.vcard }),
      };

    case "poll":
      return {
        question: messagePayload.question,
        options: messagePayload.pollOptions,
        ...(messagePayload.options?.isAnonymous !== undefined && { is_anonymous: messagePayload.options.isAnonymous }),
        ...(messagePayload.options?.type !== undefined && { type: messagePayload.options.type }),
        ...(messagePayload.options?.allowsMultipleAnswers !== undefined && {
          allows_multiple_answers: messagePayload.options.allowsMultipleAnswers,
        }),
        ...(messagePayload.options?.correctOptionId !== undefined && {
          correct_option_id: messagePayload.options.correctOptionId,
        }),
        ...(messagePayload.options?.explanation !== undefined && { explanation: messagePayload.options.explanation }),
        ...(messagePayload.options?.explanationParseMode !== undefined && {
          explanation_parse_mode: messagePayload.options.explanationParseMode,
        }),
        ...(messagePayload.options?.explanationEntities !== undefined && {
          explanation_entities: messagePayload.options.explanationEntities,
        }),
        ...(messagePayload.options?.openPeriod !== undefined && { open_period: messagePayload.options.openPeriod }),
        ...(messagePayload.options?.closeDate !== undefined && { close_date: messagePayload.options.closeDate }),
        ...(messagePayload.options?.isClosed !== undefined && { is_closed: messagePayload.options.isClosed }),
      };
  }
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
