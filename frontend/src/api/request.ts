import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 请求拦截器：自动携带 Token
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一处理错误
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    if (data.code === 200) {
      return data;
    } else {
      ElMessage.error(data.msg || "请求失败");
      return Promise.reject(new Error(data.msg));
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      ElMessage.error("登录已过期，请重新登录");
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      ElMessage.error(error.response?.data?.msg || "网络错误");
    }
    return Promise.reject(error);
  },
);

export default service;
