import request from "@/utils/request";

// 缴费项目
export function listPaymentItem(query: any) {
  return request.get("/payment/item/list", { params: query });
}
export function addPaymentItem(data: any) {
  return request.post("/payment/item", data);
}
export function updatePaymentItem(data: any) {
  return request.put("/payment/item", data);
}
export function delPaymentItem(ids: string) {
  return request.delete(`/payment/item/${ids}`);
}

// 账单
export function listPaymentBill(query: any) {
  return request.get("/payment/bill/list", { params: query });
}
export function addPaymentBill(data: any) {
  return request.post("/payment/bill", data);
}
export function changePaymentBillStatus(data: { id: number; status: number }) {
  return request.put("/payment/bill/status", data);
}
export function delPaymentBill(ids: string) {
  return request.delete(`/payment/bill/${ids}`);
}
