import request from "@/utils/request";

export function getStats() {
  return request.get("/dashboard/stats");
}

export function getRepairTrend() {
  return request.get("/dashboard/repair-trend");
}

export function getMutualTrend() {
  return request.get("/dashboard/mutual-trend");
}

export function getPendingRepairs() {
  return request.get("/dashboard/pending-repairs");
}

export function getPendingResidents() {
  return request.get("/dashboard/pending-residents");
}
