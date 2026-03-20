import request from "@/utils/request";

export function listMutual(query: any) {
  return request.get("/mutual/list", { params: query });
}
export function auditMutual(data: {
  id: number;
  status: number;
  auditNote?: string;
}) {
  return request.put("/mutual/audit", data);
}
export function completeMutual(data: { id: number; points: number }) {
  return request.put("/mutual/complete", data);
}
export function delMutual(ids: string) {
  return request.delete(`/mutual/${ids}`);
}
