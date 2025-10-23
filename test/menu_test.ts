import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

import { Menu } from "../src/menu.ts";
import type { InlineKeyboardButton } from "grammy/types";

function assertCallbackButton(
  button: InlineKeyboardButton | undefined,
): InlineKeyboardButton.CallbackButton {
  if (
    !button || !("callback_data" in button) ||
    button.callback_data === undefined
  ) {
    throw new Error("Expected callback button");
  }
  return button;
}

function assertUrlButton(
  button: InlineKeyboardButton | undefined,
): InlineKeyboardButton.UrlButton {
  if (!button || !("url" in button) || button.url === undefined) {
    throw new Error("Expected URL button");
  }
  return button;
}

describe("Menu", () => {
  it("registers handlers for callback buttons", () => {
    const menu = new Menu();
    const handler = () => {};

    menu.text("Click", handler);

    const layout = menu.build();
    const callbackButton = assertCallbackButton(layout[0]?.[0]);

    expect(menu.getHandler(callbackButton.callback_data)).toBe(handler);
  });

  it("generates unique callback data per handler", () => {
    const menu = new Menu();

    menu.text("First", () => {});
    menu.text("Second", () => {});

    const layout = menu.build();
    const first = assertCallbackButton(layout[0]?.[0]).callback_data;
    const second = assertCallbackButton(layout[0]?.[1]).callback_data;

    expect(first).not.toBe(second);
  });

  it("delegates to InlineKeyboard for layout helpers", () => {
    const menu = new Menu();

    menu.text("A", () => {})
      .row()
      .url("grammY", "https://grammy.dev");

    const layout = menu.build();

    expect(layout.length).toBe(2);
    expect(assertUrlButton(layout[1]?.[0]).url).toBe("https://grammy.dev");
  });

  it("clones keyboard and handlers", () => {
    const menu = new Menu();
    const handler = () => {};
    menu.text("Click", handler);

    const clone = menu.clone();
    const data = assertCallbackButton(clone.build()[0]?.[0]).callback_data;

    expect(clone.getHandler(data)).toBe(handler);

    clone.text("More", () => {});
    expect(menu.build()[0]?.length).toBe(1);
  });

  it("appends other menus and merges handlers", () => {
    const menuA = new Menu();
    const handlerA = () => {};
    menuA.text("A", handlerA);

    const menuB = new Menu();
    const handlerB = () => {};
    menuB.text("B", handlerB);

    menuA.append(menuB);

    const combined = menuA.build();
    const appendedData = assertCallbackButton(combined[1]?.[0]).callback_data;

    expect(menuA.getHandler(appendedData)).toBe(handlerB);
    const originalData = assertCallbackButton(combined[0]?.[0]).callback_data;
    expect(menuA.getHandler(originalData)).toBe(handlerA);
  });
});
