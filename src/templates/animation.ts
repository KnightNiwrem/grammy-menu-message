import type { Context, InputFile } from "../dep.ts";
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
 *   "https://example.com/animation.gif",
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
   * @param animation The animation file as InputFile or URL string
   * @param messageText Optional text that will be used in the menu
   */
  constructor(animation: InputFile | string, messageText?: string) {
    super(messageText);
    this.animation = animation;
    this.kind = "animation";
  }

  /** The animation media to be sent with the menu */
  animation: InputFile | string;

  /** Differentiates the media type */
  kind: "animation";
}
