import type { Context, InputFile } from "../dep.ts";
import { BaseMenuBuilder } from "./base.ts";
import { Menu } from "../menu/menu.ts";
import { AudioMenuBuilder } from "./audio.ts";
import { PhotoMenuBuilder } from "./photo.ts";
import { VideoMenuBuilder } from "./video.ts";
import { DocumentMenuBuilder } from "./document.ts";
import { AnimationMenuBuilder } from "./animation.ts";

/**
 * MenuBuilder is the plain builder variant that renders menus without
 * media attachments. Supply optional text via the constructor or
 * {@link BaseMenuBuilder.addText}; when omitted, the menu becomes keyboard-only.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const menu = new MenuBuilder<Context>()
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class MenuBuilder<C extends Context> extends BaseMenuBuilder<C> {
  /** Differentiates what kind of MenuBuilder it is */
  readonly kind = "text" as const;

  /**
   * Creates a new MenuBuilder instance.
   *
   * @param text Optional text content to be sent with the menu
   */
  constructor(text?: string) {
    super(text);
  }

  /**
   * Renders the builder into a Menu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu builder this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A Menu carrying the generated keyboard and optional text
   */
  override render(templateMenuId: string, renderedMenuId: string): Menu<C> {
    const { inlineKeyboard, menuKeyboard } = super._renderKeyboards(renderedMenuId);
    return new Menu(
      templateMenuId,
      renderedMenuId,
      menuKeyboard,
      inlineKeyboard,
      this.text,
    );
  }

  /**
   * Converts this text menu into an audio menu builder by adding audio media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param audio The audio file as InputFile or URL string
   * @returns A new AudioMenuBuilder with the same keyboard configuration and text
   */
  audio(audio: InputFile | string): AudioMenuBuilder<C> {
    const audioMenuBuilder = new AudioMenuBuilder<C>(audio, this.text);
    audioMenuBuilder._setOperations(this.operations);
    return audioMenuBuilder;
  }

  /**
   * Converts this text menu into a photo menu builder by adding photo media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param photo The photo file as InputFile or URL string
   * @returns A new PhotoMenuBuilder with the same keyboard configuration and text
   */
  photo(photo: InputFile | string): PhotoMenuBuilder<C> {
    const photoMenuBuilder = new PhotoMenuBuilder<C>(photo, this.text);
    photoMenuBuilder._setOperations(this.operations);
    return photoMenuBuilder;
  }

  /**
   * Converts this text menu into a video menu builder by adding video media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param video The video file as InputFile or URL string
   * @returns A new VideoMenuBuilder with the same keyboard configuration and text
   */
  video(video: InputFile | string): VideoMenuBuilder<C> {
    const videoMenuBuilder = new VideoMenuBuilder<C>(video, this.text);
    videoMenuBuilder._setOperations(this.operations);
    return videoMenuBuilder;
  }

  /**
   * Converts this text menu into a document menu builder by adding document media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param document The document file as InputFile or URL string
   * @returns A new DocumentMenuBuilder with the same keyboard configuration and text
   */
  document(document: InputFile | string): DocumentMenuBuilder<C> {
    const documentMenuBuilder = new DocumentMenuBuilder<C>(document, this.text);
    documentMenuBuilder._setOperations(this.operations);
    return documentMenuBuilder;
  }

  /**
   * Converts this text menu into an animation menu builder by adding animation media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param animation The animation file as InputFile or URL string
   * @returns A new AnimationMenuBuilder with the same keyboard configuration and text
   */
  animation(animation: InputFile | string): AnimationMenuBuilder<C> {
    const animationMenuBuilder = new AnimationMenuBuilder<C>(animation, this.text);
    animationMenuBuilder._setOperations(this.operations);
    return animationMenuBuilder;
  }
}
