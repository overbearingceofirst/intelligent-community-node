/**
 * 积分流水模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface PointsFlowAttributes {
  id: number;
  residentId: number;
  type: number; // 1:获得 2:消费 3:兑换
  points: number;
  balance: number;
  remark?: string;
  relatedId?: number;
  createdAt?: Date;
}

interface PointsFlowCreationAttributes extends Optional<
  PointsFlowAttributes,
  "id"
> {}

export class PointsFlow
  extends Model<PointsFlowAttributes, PointsFlowCreationAttributes>
  implements PointsFlowAttributes
{
  public id!: number;
  public residentId!: number;
  public type!: number;
  public points!: number;
  public balance!: number;
  public remark?: string;
  public relatedId?: number;
  public readonly createdAt!: Date;
}

PointsFlow.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    residentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "居民ID",
    },
    type: { type: DataTypes.TINYINT, allowNull: false, comment: "类型" },
    points: { type: DataTypes.INTEGER, allowNull: false, comment: "积分变动" },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "变动后余额",
    },
    remark: { type: DataTypes.STRING(255), comment: "备注" },
    relatedId: { type: DataTypes.INTEGER.UNSIGNED, comment: "关联ID" },
  },
  {
    sequelize,
    tableName: "points_flow",
    comment: "积分流水表",
    updatedAt: false,
  },
);
