import request from "@/utils/request";

export function listMenu(query?: any) {
  return request.get("/system/menu/list", { params: query });
}

export function treeselect() {
  return request.get("/system/menu/treeselect");
}
