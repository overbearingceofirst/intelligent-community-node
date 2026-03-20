import request from "@/utils/request";

export function listVisitor(query: any) {
  return request.get("/visitor/list", { params: query });
}
export function verifyVisitor(data: { id: number }) {
  return request.put("/visitor/verify", data);
}
