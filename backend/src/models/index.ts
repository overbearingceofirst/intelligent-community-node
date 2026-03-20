/**
 * Sequelize 模型入口
 * 创建数据库连接实例并导出所有模型
 */
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// 创建 Sequelize 实例
export const sequelize = new Sequelize(
  process.env.DB_NAME || "intelligent_community",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false, // 关闭 SQL 日志
    timezone: "+08:00", // 设置时区
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true, // 自动添加 createdAt、updatedAt
      underscored: true, // 使用下划线命名
      freezeTableName: true, // 禁止表名复数化
    },
  },
);

// 导出模型
export { User } from "./User";
export { Role } from "./Role";
export { Menu } from "./Menu";
export { OperationLog } from "./OperationLog";
export { Resident } from "./Resident";
export { Building } from "./Building";
export { Repair } from "./Repair";
export { PaymentItem } from "./PaymentItem";
export { PaymentBill } from "./PaymentBill";
export { Notice } from "./Notice";
export { MutualHelp } from "./MutualHelp";
export { IdleItem } from "./IdleItem";
export { Visitor } from "./Visitor";
export { PointsRule } from "./PointsRule";
export { PointsFlow } from "./PointsFlow";
export { Community } from "./Community";
export { PointsExchange } from "./PointsExchange";
