/**
 * 用户管理接口
 */
import request from "@/utils/request";

// 用户列表
export function listUser(query: any) {
  return request.get("/system/user/list", { params: query });
}

// 用户详情
export function getUser(userId: number) {
  return request.get(`/system/user/${userId}`);
}

// 新增用户
export function addUser(data: any) {
  return request.post("/system/user", data);
}

// 修改用户
export function updateUser(data: any) {
  return request.put("/system/user", data);
}

// 删除用户
export function delUser(userIds: string) {
  return request.delete(`/system/user/${userIds}`);
}

// 重置密码
export function resetUserPwd(data: { userId: number; password: string }) {
  return request.put("/system/user/resetPwd", data);
}

// 修改状态
export function changeUserStatus(data: { userId: number; status: number }) {
  return request.put("/system/user/changeStatus", data);
}
