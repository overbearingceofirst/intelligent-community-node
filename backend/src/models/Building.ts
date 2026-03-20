/**
 * 楼栋模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface BuildingAttributes {
  id: number;
  communityId: number; // 新增：所属小区ID
  name: string;
  parentId: number;
  type: string; // building/unit/floor
  sort: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BuildingCreationAttributes extends Optional<
  BuildingAttributes,
  "id" | "parentId" | "sort" | "status"
> {}

export class Building
  extends Model<BuildingAttributes, BuildingCreationAttributes>
  implements BuildingAttributes
{
  public id!: number;
  public communityId!: number;
  public name!: string;
  public parentId!: number;
  public type!: string;
  public sort!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Building.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    communityId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "所属小区ID",
    },
    name: { type: DataTypes.STRING(50), allowNull: false, comment: "名称" },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: "父级ID",
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "类型：building/unit/floor",
    },
    sort: { type: DataTypes.INTEGER, defaultValue: 0, comment: "排序" },
    status: { type: DataTypes.TINYINT, defaultValue: 1, comment: "状态" },
  },
  { sequelize, tableName: "building", comment: "楼栋表" },
);
