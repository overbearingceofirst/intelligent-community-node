/**
 * 统一响应工具
 * 若依风格响应格式
 */
import { Response } from "express";

/**
 * 成功响应
 */
export function success(
  res: Response,
  data: any = null,
  msg: string = "操作成功",
) {
  return res.status(200).json({
    code: 200,
    msg,
    data,
  });
}

/**
 * 失败响应
 */
export function error(
  res: Response,
  msg: string = "操作失败",
  code: number = 500,
) {
  return res.status(code >= 100 && code < 600 ? code : 500).json({
    code,
    msg,
    data: null,
  });
}

/**
 * 分页响应
 */
export function page(
  res: Response,
  list: any[],
  total: number,
  msg: string = "查询成功",
) {
  return res.status(200).json({
    code: 200,
    msg,
    rows: list,
    total,
  });
}
