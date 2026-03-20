/**
 * 报修工单模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface RepairAttributes {
  id: number;
  residentId: number;
  buildingId?: number;
  title: string;
  content: string;
  images?: string;
  status: number; // 0:待处理 1:处理中 2:已完成 3:已关闭
  handlerId?: number;
  handleNote?: string;
  handleTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RepairCreationAttributes extends Optional<
  RepairAttributes,
  "id" | "status"
> {}

export class Repair
  extends Model<RepairAttributes, RepairCreationAttributes>
  implements RepairAttributes
{
  public id!: number;
  public residentId!: number;
  public buildingId?: number;
  public title!: string;
  public content!: string;
  public images?: string;
  public status!: number;
  public handlerId?: number;
  public handleNote?: string;
  public handleTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Repair.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    residentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "报修居民ID",
    },
    buildingId: { type: DataTypes.INTEGER.UNSIGNED, comment: "楼栋ID" },
    title: { type: DataTypes.STRING(100), allowNull: false, comment: "标题" },
    content: { type: DataTypes.TEXT, allowNull: false, comment: "内容" },
    images: { type: DataTypes.TEXT, comment: "图片JSON" },
    status: { type: DataTypes.TINYINT, defaultValue: 0, comment: "状态" },
    handlerId: { type: DataTypes.INTEGER.UNSIGNED, comment: "处理人ID" },
    handleNote: { type: DataTypes.TEXT, comment: "处理备注" },
    handleTime: { type: DataTypes.DATE, comment: "处理时间" },
  },
  { sequelize, tableName: "repair", comment: "报修工单表" },
);
