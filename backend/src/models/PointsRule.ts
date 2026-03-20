/**
 * 积分规则模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface PointsRuleAttributes {
  id: number;
  communityId: number; // 新增：所属小区ID
  title: string;
  content: string;
  sort: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PointsRuleCreationAttributes extends Optional<
  PointsRuleAttributes,
  "id" | "sort" | "status"
> {}

export class PointsRule
  extends Model<PointsRuleAttributes, PointsRuleCreationAttributes>
  implements PointsRuleAttributes
{
  public id!: number;
  public communityId!: number;
  public title!: string;
  public content!: string;
  public sort!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PointsRule.init(
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
    title: { type: DataTypes.STRING(100), allowNull: false, comment: "标题" },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "说明内容",
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "排序",
    },
    status: { type: DataTypes.TINYINT, defaultValue: 1, comment: "状态" },
  },
  { sequelize, tableName: "points_rule", comment: "积分兑换说明表" },
);
