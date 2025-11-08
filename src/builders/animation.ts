import type { Context, InputFile } from "../dep.ts";
import { BaseMenuBuilder } from "./base.ts";
import { AnimationMenu } from "../menus/animation.ts";

/**
 * AnimationMenuBuilder orchestrates menus that deliver an animation alongside
 * a keyboard built through the {@link BaseMenuBuilder} fluent API.
 * Provide a {@link InputFile} or URL for the animation and optionally add a caption
 * with caption text via the constructor or {@link BaseMenuBuilder.addText}.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const animationMenu = new AnimationMenuBuilder<Context>(
 *   "https://example.com/animation.gif",
 * )
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class AnimationMenuBuilder<C extends Context> extends BaseMenuBuilder<C> {
  /** The animation media to be sent with the menu */
  animation: InputFile | string;

  /** Differentiates what kind of MenuBuilder it is */
  readonly kind = "animation" as const;

  /**
   * Creates a new AnimationMenuBuilder instance.
   *
   * @param animation The animation file as InputFile or URL string
   * @param text Optional caption sent alongside the rendered animation
   */
  constructor(animation: InputFile | string, text?: string) {
    super(text);
    this.animation = animation;
  }

  /**
   * Renders the builder into an AnimationMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu builder this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns An AnimationMenu carrying the generated keyboard and optional text
   */
  override render(templateMenuId: string, renderedMenuId: string): AnimationMenu<C> {
    const { inlineKeyboard, menuKeyboard } = super._renderKeyboards(renderedMenuId);
    return new AnimationMenu(
      templateMenuId,
      renderedMenuId,
      menuKeyboard,
      inlineKeyboard,
      this.animation,
      this.text,
    );
  }
}
