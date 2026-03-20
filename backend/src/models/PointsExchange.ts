import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface PointsExchangeAttributes {
  id: number;
  communityId: number;
  name: string;
  description?: string;
  image?: string;
  points: number;
  stock: number;
  exchangedCount: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PointsExchangeCreationAttributes extends Optional<
  PointsExchangeAttributes,
  "id" | "exchangedCount" | "status"
> {}

export class PointsExchange
  extends Model<PointsExchangeAttributes, PointsExchangeCreationAttributes>
  implements PointsExchangeAttributes
{
  public id!: number;
  public communityId!: number;
  public name!: string;
  public description?: string;
  public image?: string;
  public points!: number;
  public stock!: number;
  public exchangedCount!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PointsExchange.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "商品名称",
    },
    description: { type: DataTypes.TEXT, comment: "商品描述" },
    image: { type: DataTypes.STRING(255), comment: "商品图片" },
    points: { type: DataTypes.INTEGER, allowNull: false, comment: "所需积分" },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "库存数量",
    },
    exchangedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "已兑换数量",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "状态：0下架 1上架",
    },
  },
  { sequelize, tableName: "points_exchange", comment: "积分兑换商品表" },
);
