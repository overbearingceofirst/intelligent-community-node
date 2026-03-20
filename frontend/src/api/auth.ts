/**
 * 认证相关接口
 */
import request from "@/utils/request";

// 登录
export function login(data: { username: string; password: string }) {
  return request({
    url: "/auth/login",
    method: "post",
    data,
  });
}

// 获取用户信息
export function getInfo() {
  return request.get("/auth/getInfo");
}

// 获取路由
export function getRouters() {
  return request.get("/auth/getRouters");
}

// 退出登录
export function logout() {
  return request.post("/auth/logout");
}
