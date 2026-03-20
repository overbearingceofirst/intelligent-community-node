/**
 * 用户状态管理
 */
import { defineStore } from "pinia";
import { login as loginApi, getInfo, logout as logoutApi } from "@/api/auth";
import { setToken, getToken, removeToken } from "@/utils/auth";

interface UserState {
  token: string;
  name: string;
  avatar: string;
  roles: string[];
  permissions: string[];
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: getToken() || "",
    name: "",
    avatar: "",
    roles: [],
    permissions: [],
  }),

  actions: {
    // 登录
    async login(userInfo: { username: string; password: string }) {
      const { username, password } = userInfo;
      try {
        const res: any = await loginApi({
          username: username.trim(),
          password,
        });
        if (res.code === 200 && res.data?.token) {
          setToken(res.data.token);
          this.token = res.data.token;
          return res;
        } else {
          throw new Error(res.msg || "登录失败");
        }
      } catch (error) {
        throw error;
      }
    },

    // 获取用户信息
    async getInfo() {
      const res: any = await getInfo();
      const { user, roles, permissions } = res.data;
      this.name = user.nickName || user.userName;
      this.avatar = user.avatar || "";
      this.roles = roles;
      this.permissions = permissions;
      return res.data;
    },

    // 退出登录
    async logout() {
      await logoutApi();
      removeToken();
      this.token = "";
      this.roles = [];
      this.permissions = [];
    },

    // 重置 Token
    resetToken() {
      removeToken();
      this.token = "";
      this.roles = [];
      this.permissions = [];
    },
  },
});
