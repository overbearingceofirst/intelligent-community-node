/**
 * Excel 导出工具
 * 使用 xlsx 库生成 Excel 文件
 */
import * as XLSX from "xlsx";
import { Response } from "express";

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * 导出 Excel 文件
 * @param res Express Response 对象
 * @param data 数据数组
 * @param columns 列定义
 * @param filename 文件名（不含扩展名）
 */
export function exportExcel(
  res: Response,
  data: any[],
  columns: ExcelColumn[],
  filename: string = "export",
) {
  // 构建表头
  const headers = columns.map((col) => col.header);

  // 构建数据行
  const rows = data.map((item) => columns.map((col) => item[col.key] ?? ""));

  // 合并表头和数据
  const sheetData = [headers, ...rows];

  // 创建工作簿和工作表
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // 设置列宽
  worksheet["!cols"] = columns.map((col) => ({ wch: col.width || 15 }));

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // 生成 Buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // 设置响应头并发送
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${encodeURIComponent(filename)}.xlsx`,
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.send(buffer);
}
