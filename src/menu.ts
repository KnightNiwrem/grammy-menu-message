import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";

type InlineKeyboardLayout = InlineKeyboardButton[][];

export type MenuHandler<C extends Context> = (
  ctx: C,
) => unknown | Promise<unknown>;

export class Menu<C extends Context = Context> {
  #keyboard: InlineKeyboard;
  #handlers: Map<string, MenuHandler<C>>;
  #counter: number;

  constructor(
    inlineKeyboard: InlineKeyboardLayout = [[]],
    options?: {
      handlers?: Map<string, MenuHandler<C>>;
      counter?: number;
      keyboardInstance?: InlineKeyboard;
    },
  ) {
    this.#keyboard = options?.keyboardInstance ?? new InlineKeyboard(
      inlineKeyboard.map((row) => row.slice()),
    );
    this.#handlers = options?.handlers ?? new Map();
    this.#counter = options?.counter ?? 0;
  }

  get keyboard(): InlineKeyboard {
    return this.#keyboard;
  }

  getHandler(callbackData: string): MenuHandler<C> | undefined {
    return this.#handlers.get(callbackData);
  }

  add(...buttons: InlineKeyboardButton[]): this {
    this.#keyboard.add(...buttons);
    return this;
  }

  row(...buttons: InlineKeyboardButton[]): this {
    this.#keyboard.row(...buttons);
    return this;
  }

  url(...args: Parameters<InlineKeyboard["url"]>): this {
    this.#keyboard.url(...args);
    return this;
  }

  text(label: string, handler: MenuHandler<C>): this {
    const callbackData = this.#nextCallbackData();
    this.#handlers.set(callbackData, handler);
    this.#keyboard.text(label, callbackData);
    return this;
  }

  webApp(...args: Parameters<InlineKeyboard["webApp"]>): this {
    this.#keyboard.webApp(...args);
    return this;
  }

  login(...args: Parameters<InlineKeyboard["login"]>): this {
    this.#keyboard.login(...args);
    return this;
  }

  switchInline(...args: Parameters<InlineKeyboard["switchInline"]>): this {
    this.#keyboard.switchInline(...args);
    return this;
  }

  switchInlineCurrent(
    ...args: Parameters<InlineKeyboard["switchInlineCurrent"]>
  ): this {
    this.#keyboard.switchInlineCurrent(...args);
    return this;
  }

  switchInlineChosen(
    ...args: Parameters<InlineKeyboard["switchInlineChosen"]>
  ): this {
    this.#keyboard.switchInlineChosen(...args);
    return this;
  }

  copyText(
    ...args: Parameters<InlineKeyboard["copyText"]>
  ): this {
    this.#keyboard.copyText(...args);
    return this;
  }

  game(...args: Parameters<InlineKeyboard["game"]>): this {
    this.#keyboard.game(...args);
    return this;
  }

  pay(...args: Parameters<InlineKeyboard["pay"]>): this {
    this.#keyboard.pay(...args);
    return this;
  }

  build(): InlineKeyboardLayout {
    return this.#keyboard.inline_keyboard.map((row) => row.slice());
  }

  toJSON(): unknown {
    return this.build();
  }

  #nextCallbackData(): string {
    const id = this.#counter;
    this.#counter += 1;
    return `menu:cb:${id}`;
  }
}
