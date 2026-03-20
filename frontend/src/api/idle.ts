import request from "@/utils/request";

export function listIdle(query: any) {
  return request.get("/idle/list", { params: query });
}
export function auditIdle(data: {
  id: number;
  status: number;
  auditNote?: string;
}) {
  return request.put("/idle/audit", data);
}
export function changeIdleStatus(data: { id: number; status: number }) {
  return request.put("/idle/status", data);
}
export function delIdle(ids: string) {
  return request.delete(`/idle/${ids}`);
}
