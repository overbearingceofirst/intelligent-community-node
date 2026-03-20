import request from "@/utils/request";

// 积分规则
export function listPointsRule(query?: any) {
  return request.get("/points/rule/list", { params: query });
}

export function addPointsRule(data: any) {
  return request.post("/points/rule", data);
}

export function updatePointsRule(data: any) {
  return request.put("/points/rule", data);
}

export function delPointsRule(ids: string) {
  return request.delete(`/points/rule/${ids}`);
}

export function listPointsFlow(query: any) {
  return request.get("/points/flow/list", { params: query });
}

// 积分兑换商品
export function listPointsExchange(query: any) {
  return request.get("/points/exchange/list", { params: query });
}

export function getPointsExchange(id: number) {
  return request.get(`/points/exchange/${id}`);
}

export function addPointsExchange(data: any) {
  return request.post("/points/exchange", data);
}

export function updatePointsExchange(data: any) {
  return request.put("/points/exchange", data);
}

export function changePointsExchangeStatus(data: {
  id: number;
  status: number;
}) {
  return request.put("/points/exchange/status", data);
}

export function delPointsExchange(ids: string) {
  return request.delete(`/points/exchange/${ids}`);
}
