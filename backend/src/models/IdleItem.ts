/**
 * 闲置物品模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface IdleItemAttributes {
  id: number;
  residentId: number;
  title: string;
  content: string;
  images?: string;
  price: number;
  contact: string;
  status: number; // 0:待审核 1:上架 2:下架 3:已交易 4:驳回
  auditNote?: string;
  createdAt?: Date;
}

interface IdleItemCreationAttributes extends Optional<
  IdleItemAttributes,
  "id" | "status"
> {}

export class IdleItem
  extends Model<IdleItemAttributes, IdleItemCreationAttributes>
  implements IdleItemAttributes
{
  public id!: number;
  public residentId!: number;
  public title!: string;
  public content!: string;
  public images?: string;
  public price!: number;
  public contact!: string;
  public status!: number;
  public auditNote?: string;
  public readonly createdAt!: Date;
}

IdleItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    residentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "发布者ID",
    },
    title: { type: DataTypes.STRING(100), allowNull: false, comment: "标题" },
    content: { type: DataTypes.TEXT, allowNull: false, comment: "描述" },
    images: { type: DataTypes.TEXT, comment: "图片JSON" },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "价格",
    },
    contact: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "联系方式",
    },
    status: { type: DataTypes.TINYINT, defaultValue: 0, comment: "状态" },
    auditNote: { type: DataTypes.STRING(255), comment: "审核备注" },
  },
  { sequelize, tableName: "idle_item", comment: "闲置物品表" },
);
