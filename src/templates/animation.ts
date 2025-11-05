import type { Context, InputMediaAnimation } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";

/**
 * AnimationMenuTemplate extends BaseMenuTemplate to include an animation media field.
 * Used for creating menus with animation (GIF) content and inline keyboards.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```typescript
 * const animationMenu = new AnimationMenuTemplate<Context>(
 *   { type: "animation", media: "https://example.com/animation.gif" },
 *   "Choose an option:"
 * )
 *   .cb("Option 1", async (ctx) => { await ctx.answerCallbackQuery("1"); })
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class AnimationMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /**
   * Creates a new AnimationMenuTemplate instance.
   *
   * @param animation The InputMediaAnimation object containing animation content
   * @param messageText Optional text that will be used in the menu
   */
  constructor(animation: InputMediaAnimation, messageText?: string) {
    super(messageText);
    this.animation = animation;
  }

  /** The animation media to be sent with the menu */
  animation: InputMediaAnimation;
}
