import type { Menus, Tabs } from "wxt/browser";
import type { ToggleMenuItemVisibilityMessage } from "~/entrypoints/content";

export default defineBackground(() => {
  createContextMenus();
  browser.contextMenus.onClicked.addListener(handleContextMenuItemClick);
  browser.runtime.onMessage.addListener(handleToggleMenuItemVisibilityMessage);
});

export type MenuItemId =
  | "toggleResolvedDetails"
  | "openResolvedDetails"
  | "closeResolvedDetails";

export type InvokeMenuItemFunctionMessage = {
  type: "invokeMenuItemFunction";
  menuItemId: MenuItemId;
};

const menuItems: Record<
  MenuItemId,
  { id: MenuItemId } & Omit<Menus.CreateCreatePropertiesType, "id">
> = {
  toggleResolvedDetails: {
    id: "toggleResolvedDetails",
    title: "解決済コメントの開閉状態を切り替え",
    documentUrlPatterns: ["https://github.com/*/pull/*"],
  },
  openResolvedDetails: {
    parentId: "toggleResolvedDetails",
    id: "openResolvedDetails",
    title: "全て開く",
    documentUrlPatterns: ["https://github.com/*/pull/*"],
  },
  closeResolvedDetails: {
    parentId: "toggleResolvedDetails",
    id: "closeResolvedDetails",
    title: "全て閉じる",
    documentUrlPatterns: ["https://github.com/*/pull/*"],
  },
};

function isMenuItemId(menuItemId: string | number): menuItemId is MenuItemId {
  return typeof menuItemId === "string" && menuItemId in menuItems;
}

// コンテキストメニューを作成
function createContextMenus() {
  for (const createProperties of Object.values(menuItems)) {
    browser.contextMenus.create(
      { ...createProperties, visible: false },
      () => browser.runtime.lastError,
    );
  }
}

// コンテキストメニューに対応する関数を実行
function handleContextMenuItemClick(
  { menuItemId }: Menus.OnClickData,
  tab: Tabs.Tab | undefined,
): void {
  if (typeof tab?.id === "number" && isMenuItemId(menuItemId)) {
    void browser.tabs.sendMessage(tab.id, {
      type: "invokeMenuItemFunction",
      menuItemId,
    } satisfies InvokeMenuItemFunctionMessage);
  }
}

// 不要なコンテキストメニューを非表示化
function handleToggleMenuItemVisibilityMessage({
  type,
  menuItemId,
  visible,
}: ToggleMenuItemVisibilityMessage) {
  if (type === "toggleMenuItemVisibility") {
    browser.contextMenus.update(menuItemId, { visible });
  }
}
