import request from "@/utils/request";

export function listResident(query: any) {
  return request.get("/resident/list", { params: query });
}

export function getResident(id: number) {
  return request.get(`/resident/${id}`);
}

export function changeResidentStatus(data: { id: number; status: number }) {
  return request.put("/resident/status", data);
}

export function resetResidentPwd(data: { id: number; password: string }) {
  return request.put("/resident/resetPwd", data);
}

export function auditResidentAuth(data: {
  id: number;
  authStatus: number;
  remark?: string;
}) {
  return request.put("/resident/auditAuth", data);
}

export function auditResidentBind(data: {
  id: number;
  bindStatus: number;
  remark?: string;
}) {
  return request.put("/resident/auditBind", data);
}

export function delResident(ids: string) {
  return request.delete(`/resident/${ids}`);
}
