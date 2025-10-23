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

  it("allows mixing button types in rows", () => {
    const menu = new Menu();

    menu.text("One", () => {})
      .url("Docs", "https://grammy.dev")
      .row()
      .copyText("Copy", "hello");

    const layout = menu.build();

    expect(layout.length).toBe(2);
    expect(assertCallbackButton(layout[0]?.[0]).callback_data).toBeDefined();
    expect(assertUrlButton(layout[0]?.[1]).url).toBe("https://grammy.dev");
    expect("copy_text" in (layout[1]?.[0] ?? {})).toBe(true);
  });
});
