/**
 * Axios 请求封装（若依风格）
 */
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { getToken, removeToken } from "./auth";
import router from "@/router";
import NProgress from "nprogress";

// 创建实例
const service: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    NProgress.start();
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done();
    const res = response.data;

    // 直接返回数据，让业务层处理
    if (res.code === 200) {
      return res;
    }

    // 401: Token 过期
    if (res.code === 401) {
      ElMessageBox.confirm("登录状态已过期，请重新登录", "系统提示", {
        confirmButtonText: "重新登录",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        removeToken();
        router.push("/login");
      });
      return Promise.reject(new Error(res.msg || "登录过期"));
    }

    // 其他错误
    ElMessage.error(res.msg || "请求失败");
    return Promise.reject(new Error(res.msg || "请求失败"));
  },
  (error) => {
    NProgress.done();
    let message = error.message;
    if (error.response) {
      const { status, data } = error.response;
      message = data?.msg || `请求错误 (${status})`;
      if (status === 401) {
        removeToken();
        router.push("/login");
      }
    }
    ElMessage.error(message);
    return Promise.reject(error);
  },
);

export default service;
