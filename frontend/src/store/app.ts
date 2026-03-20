/**
 * 应用状态管理
 */
import { defineStore } from "pinia";

interface AppState {
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
  };
  device: "desktop" | "mobile";
}

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    sidebar: {
      opened: localStorage.getItem("sidebarStatus") !== "0",
      withoutAnimation: false,
    },
    device: "desktop",
  }),

  actions: {
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = false;
      localStorage.setItem("sidebarStatus", this.sidebar.opened ? "1" : "0");
    },

    closeSidebar(withoutAnimation: boolean) {
      this.sidebar.opened = false;
      this.sidebar.withoutAnimation = withoutAnimation;
      localStorage.setItem("sidebarStatus", "0");
    },

    toggleDevice(device: "desktop" | "mobile") {
      this.device = device;
    },
  },
});
