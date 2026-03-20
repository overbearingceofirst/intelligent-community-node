/**
 * 小区信息模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface CommunityAttributes {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  logo?: string;
  description?: string;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommunityCreationAttributes extends Optional<
  CommunityAttributes,
  "id" | "status"
> {}

export class Community
  extends Model<CommunityAttributes, CommunityCreationAttributes>
  implements CommunityAttributes
{
  public id!: number;
  public name!: string;
  public address?: string;
  public phone?: string;
  public logo?: string;
  public description?: string;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Community.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "小区名称",
    },
    address: { type: DataTypes.STRING(255), comment: "地址" },
    phone: { type: DataTypes.STRING(20), comment: "联系电话" },
    logo: { type: DataTypes.STRING(255), comment: "Logo" },
    description: { type: DataTypes.TEXT, comment: "简介" },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "状态：0停用 1正常",
    },
  },
  { sequelize, tableName: "community", comment: "小区信息表" },
);
