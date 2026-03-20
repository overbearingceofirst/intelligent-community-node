import request from "@/utils/request";

export function listRepair(query: any) {
  return request.get("/repair/list", { params: query });
}

export function getRepair(id: number) {
  return request.get(`/repair/${id}`);
}

export function handleRepair(data: {
  id: number;
  status: number;
  handleNote?: string;
}) {
  return request.put("/repair/handle", data);
}

export function getRepairStats() {
  return request.get("/repair/stats");
}

export function delRepair(ids: string) {
  return request.delete(`/repair/${ids}`);
}
