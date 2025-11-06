import type { Context, InputFile } from "../dep.ts";
import { BaseMenuTemplate } from "./base.ts";
import { TextMenu } from "../menu/text.ts";
import { AudioMenuTemplate } from "./audio.ts";
import { PhotoMenuTemplate } from "./photo.ts";
import { VideoMenuTemplate } from "./video.ts";
import { DocumentMenuTemplate } from "./document.ts";
import { AnimationMenuTemplate } from "./animation.ts";

/**
 * TextMenuTemplate is the plain template variant that renders menus without
 * media attachments. Supply optional text via the constructor or
 * {@link BaseMenuTemplate.addText}; when omitted, the menu becomes keyboard-only.
 *
 * @template C The grammY Context type
 *
 * @example
 * ```ts
 * const textMenu = new TextMenuTemplate<Context>()
 *   .addText("Choose an option:")
 *   .cb("Option 1", async (ctx) => ctx.answerCallbackQuery("1"))
 *   .row()
 *   .url("Visit", "https://example.com");
 * ```
 */
export class TextMenuTemplate<C extends Context> extends BaseMenuTemplate<C> {
  /** Differentiates what kind of MenuTemplate it is */
  readonly kind = "text" as const;

  /**
   * Creates a new TextMenuTemplate instance.
   *
   * @param text Optional text content to be sent with the menu
   */
  constructor(text?: string) {
    super(text);
  }

  /**
   * Renders the template into a TextMenu with a fresh inline keyboard instance.
   *
   * @param templateMenuId Identifier for the menu template this was rendered from
   * @param renderedMenuId Unique identifier for this specific rendered menu instance
   * @returns A TextMenu carrying the generated keyboard and optional text
   */
  override render(templateMenuId: string, renderedMenuId: string): TextMenu<C> {
    const { inlineKeyboard, menuKeyboard } = super._renderKeyboards(renderedMenuId);
    return new TextMenu(
      templateMenuId,
      renderedMenuId,
      menuKeyboard,
      inlineKeyboard,
      this.text,
    );
  }

  /**
   * Converts this text menu into an audio menu template by adding audio media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param audio The audio file as InputFile or URL string
   * @returns A new AudioMenuTemplate with the same keyboard configuration and text
   */
  audio(audio: InputFile | string): AudioMenuTemplate<C> {
    const audioMenuTemplate = new AudioMenuTemplate<C>(audio, this.text);
    audioMenuTemplate._setOperations(this.operations);
    return audioMenuTemplate;
  }

  /**
   * Converts this text menu into a photo menu template by adding photo media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param photo The photo file as InputFile or URL string
   * @returns A new PhotoMenuTemplate with the same keyboard configuration and text
   */
  photo(photo: InputFile | string): PhotoMenuTemplate<C> {
    const photoMenuTemplate = new PhotoMenuTemplate<C>(photo, this.text);
    photoMenuTemplate._setOperations(this.operations);
    return photoMenuTemplate;
  }

  /**
   * Converts this text menu into a video menu template by adding video media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param video The video file as InputFile or URL string
   * @returns A new VideoMenuTemplate with the same keyboard configuration and text
   */
  video(video: InputFile | string): VideoMenuTemplate<C> {
    const videoMenuTemplate = new VideoMenuTemplate<C>(video, this.text);
    videoMenuTemplate._setOperations(this.operations);
    return videoMenuTemplate;
  }

  /**
   * Converts this text menu into a document menu template by adding document media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param document The document file as InputFile or URL string
   * @returns A new DocumentMenuTemplate with the same keyboard configuration and text
   */
  document(document: InputFile | string): DocumentMenuTemplate<C> {
    const documentMenuTemplate = new DocumentMenuTemplate<C>(document, this.text);
    documentMenuTemplate._setOperations(this.operations);
    return documentMenuTemplate;
  }

  /**
   * Converts this text menu into an animation menu template by adding animation media.
   * The existing text and keyboard configuration are preserved.
   *
   * @param animation The animation file as InputFile or URL string
   * @returns A new AnimationMenuTemplate with the same keyboard configuration and text
   */
  animation(animation: InputFile | string): AnimationMenuTemplate<C> {
    const animationMenuTemplate = new AnimationMenuTemplate<C>(animation, this.text);
    animationMenuTemplate._setOperations(this.operations);
    return animationMenuTemplate;
  }
}
