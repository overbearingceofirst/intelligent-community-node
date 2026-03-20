/**
 * Token 存储工具
 */
import Cookies from "js-cookie";

const TokenKey = "Admin-Token";

export function getToken(): string | undefined {
  return Cookies.get(TokenKey);
}

export function setToken(token: string): void {
  Cookies.set(TokenKey, token, { expires: 1 }); // 1天过期
}

export function removeToken(): void {
  Cookies.remove(TokenKey);
}
