/**
 * 角色管理接口
 */
import request from "@/utils/request";

export function listRole(query: any) {
  return request.get("/system/role/list", { params: query });
}

export function getRole(roleId: number) {
  return request.get(`/system/role/${roleId}`);
}

export function addRole(data: any) {
  return request.post("/system/role", data);
}

export function updateRole(data: any) {
  return request.put("/system/role", data);
}

export function delRole(roleIds: string) {
  return request.delete(`/system/role/${roleIds}`);
}

export function changeRoleStatus(data: { roleId: number; status: number }) {
  return request.put("/system/role/changeStatus", data);
}
