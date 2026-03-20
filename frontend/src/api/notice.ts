import request from "@/utils/request";

export function listNotice(query: any) {
  return request.get("/notice/list", { params: query });
}
export function getNotice(id: number) {
  return request.get(`/notice/${id}`);
}
export function addNotice(data: any) {
  return request.post("/notice", data);
}
export function updateNotice(data: any) {
  return request.put("/notice", data);
}
export function publishNotice(data: { id: number; status: number }) {
  return request.put("/notice/publish", data);
}
export function delNotice(ids: string) {
  return request.delete(`/notice/${ids}`);
}
