import type { Context, MiddlewareFn } from "./dep.ts";
import type { Menu } from "./menu.ts";
import type { MenuRegistry } from "./registry.ts";
import type { PhotoMenuTemplate } from "./templates/photo.ts";
import type { VideoMenuTemplate } from "./templates/video.ts";
import type { AnimationMenuTemplate } from "./templates/animation.ts";
import type { AudioMenuTemplate } from "./templates/audio.ts";
import type { DocumentMenuTemplate } from "./templates/document.ts";

/**
 * Extended context with sendMenu method for simplified menu sending.
 * Automatically determines the correct Telegram API method based on the menu's kind.
 *
 * @template C The grammY Context type
 */
export interface MenuContext<C extends Context> extends Context {
  /**
   * Sends a menu using the appropriate method based on the menu's kind.
   * For message menus, uses ctx.reply.
   * For photo/video/animation/audio/document menus, uses the corresponding send method
   * and retrieves media from the registered template.
   *
   * @param menu The Menu instance created by MenuRegistry.menu()
   * @param text Optional text to override the menu's messageText
   * @returns The sent message
   *
   * @example
   * ```typescript
   * const menu = registry.menu("main");
   * await ctx.sendMenu(menu);
   * ```
   */
  sendMenu(menu: Menu<C>, text?: string): Promise<unknown>;
}

/**
 * Creates middleware that adds the sendMenu method to the context.
 * Checks if ctx.sendMenu already exists to avoid overriding existing implementations.
 *
 * @param registry The MenuRegistry instance containing registered templates
 * @returns Middleware function that augments the context
 *
 * @example
 * ```typescript
 * const registry = new MenuRegistry<Context>();
 * bot.use(registry.middleware());
 * bot.use(sendMenuMiddleware(registry));
 *
 * bot.command("start", async (ctx) => {
 *   const menu = registry.menu("main");
 *   await ctx.sendMenu(menu);
 * });
 * ```
 */
export function sendMenuMiddleware<C extends Context>(
  registry: MenuRegistry<C>,
): MiddlewareFn<C> {
  return async (ctx, next) => {
    const extCtx = ctx as Context & { sendMenu?: MenuContext<C>["sendMenu"] };

    if (!extCtx.sendMenu) {
      extCtx.sendMenu = async (menu: Menu<C>, text?: string): Promise<unknown> => {
        const template = registry.get(menu.templateMenuId);
        if (!template) {
          throw new Error(
            `Template '${menu.templateMenuId}' not found in registry`,
          );
        }

        const replyMarkup = { reply_markup: menu };
        const messageText = text ?? menu.messageText;

        switch (menu.kind) {
          case "message":
            return await ctx.reply(messageText ?? "", replyMarkup);

          case "photo": {
            const photoTemplate = template as unknown as PhotoMenuTemplate<C>;
            return await ctx.replyWithPhoto(photoTemplate.photo, {
              ...replyMarkup,
              caption: messageText,
            });
          }

          case "video": {
            const videoTemplate = template as unknown as VideoMenuTemplate<C>;
            return await ctx.replyWithVideo(videoTemplate.video, {
              ...replyMarkup,
              caption: messageText,
            });
          }

          case "animation": {
            const animationTemplate = template as unknown as AnimationMenuTemplate<C>;
            return await ctx.replyWithAnimation(animationTemplate.animation, {
              ...replyMarkup,
              caption: messageText,
            });
          }

          case "audio": {
            const audioTemplate = template as unknown as AudioMenuTemplate<C>;
            return await ctx.replyWithAudio(audioTemplate.audio, {
              ...replyMarkup,
              caption: messageText,
            });
          }

          case "document": {
            const documentTemplate = template as unknown as DocumentMenuTemplate<C>;
            return await ctx.replyWithDocument(documentTemplate.document, {
              ...replyMarkup,
              caption: messageText,
            });
          }

          default:
            throw new Error(`Unsupported menu kind: ${menu.kind}`);
        }
      };
    }

    await next();
  };
}
