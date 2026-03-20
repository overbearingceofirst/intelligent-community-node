import request from "@/utils/request";

// 小区管理
export function listCommunity(query?: any) {
  return request.get("/setting/community/list", { params: query });
}

export function getCommunity(id?: number) {
  return request.get(id ? `/setting/community/${id}` : "/setting/community");
}

export function getCommunityOptions() {
  return request.get("/setting/community/options");
}

export function addCommunity(data: any) {
  return request.post("/setting/community", data);
}

export function updateCommunity(data: any) {
  return request.put("/setting/community", data);
}

export function delCommunity(ids: string) {
  return request.delete(`/setting/community/${ids}`);
}

// 楼栋管理
export function listBuilding(query?: any) {
  return request.get("/setting/building/list", { params: query });
}

export function getBuildingTree(query?: any) {
  return request.get("/setting/building/tree", { params: query });
}

export function addBuilding(data: any) {
  return request.post("/setting/building", data);
}

export function updateBuilding(data: any) {
  return request.put("/setting/building", data);
}

export function delBuilding(ids: string) {
  return request.delete(`/setting/building/${ids}`);
}
