import type {
  InvokeMenuItemFunctionMessage,
  MenuItemId,
} from "~/entrypoints/background";

export default defineContentScript({
  runAt: "document_start",
  matches: ["*://github.com/*", "*://gist.github.com/*"],
  main() {
    browser.runtime.onMessage.addListener(handleInvokeMenuItemFunctionMessage);
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("turbo:load", toggleMenuItemVisibility);
    document.addEventListener("contextmenu", toggleMenuItemVisibility);
  },
});

export type ToggleMenuItemVisibilityMessage = {
  type: "toggleMenuItemVisibility";
  menuItemId: MenuItemId;
  visible: boolean;
};

// Form入力中にEnterで意図せずSubmitしてしまう問題を回避
function handleKeyDown(event: KeyboardEvent) {
  if (
    event.target instanceof HTMLElement &&
    event.target.tagName === "TEXTAREA" &&
    event.code === "Enter" &&
    !(event.ctrlKey || event.metaKey)
  ) {
    event.stopPropagation();
  }
}

const menuItems: Record<MenuItemId, () => void> = {
  /**
   * 解決済コメントの開閉状態を切り替え
   */
  toggleResolvedDetails() {
    // do nothing
  },
  /**
   * 解決済のコメントを全て開く
   */
  openResolvedDetails() {
    toggleDetails('details[data-resolved="true"]:not([open])');
  },
  /**
   * 解決済のコメントを全て閉じる
   */
  closeResolvedDetails() {
    toggleDetails('details[data-resolved="true"][open]');
  },
};

// コンテキストメニューに対応する関数を実行
function handleInvokeMenuItemFunctionMessage({
  type,
  menuItemId,
}: InvokeMenuItemFunctionMessage) {
  if (
    type === "invokeMenuItemFunction" &&
    typeof menuItems[menuItemId] === "function"
  ) {
    menuItems[menuItemId]();
  }
}

// 不要なコンテキストメニューを非表示化
function toggleMenuItemVisibility() {
  void browser.runtime.sendMessage({
    type: "toggleMenuItemVisibility",
    menuItemId: "toggleResolvedDetails",
    visible: hasElement('details[data-resolved="true"]'),
  } satisfies ToggleMenuItemVisibilityMessage);
  void browser.runtime.sendMessage({
    type: "toggleMenuItemVisibility",
    menuItemId: "openResolvedDetails",
    visible: hasElement('details[data-resolved="true"]:not([open])'),
  } satisfies ToggleMenuItemVisibilityMessage);
  void browser.runtime.sendMessage({
    type: "toggleMenuItemVisibility",
    menuItemId: "closeResolvedDetails",
    visible: hasElement('details[data-resolved="true"][open]'),
  } satisfies ToggleMenuItemVisibilityMessage);
}

/**
 * 要素が存在するかを確認
 *
 * @param {string} selectors セレクター
 * @returns {boolean} 要素が存在する場合はtrue
 */
function hasElement(selectors: string): boolean {
  return document.querySelector(selectors) !== null;
}

/**
 * 全ての詳細折りたたみ要素を切り替え
 *
 * @param {string} selectors セレクター
 */
function toggleDetails(selectors: string) {
  for (const element of document.querySelectorAll(selectors)) {
    if (element instanceof HTMLDetailsElement) {
      element.open = !element.open;
    }
  }
}
