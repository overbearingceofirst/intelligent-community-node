/**
 * 缴费项目模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface PaymentItemAttributes {
  id: number;
  name: string;
  code: string;
  unit: string;
  price: number;
  status: number;
  remark?: string;
}

interface PaymentItemCreationAttributes extends Optional<
  PaymentItemAttributes,
  "id" | "status"
> {}

export class PaymentItem
  extends Model<PaymentItemAttributes, PaymentItemCreationAttributes>
  implements PaymentItemAttributes
{
  public id!: number;
  public name!: string;
  public code!: string;
  public unit!: string;
  public price!: number;
  public status!: number;
  public remark?: string;
}

PaymentItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(50), allowNull: false, comment: "项目名称" },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "项目编码",
    },
    unit: { type: DataTypes.STRING(20), allowNull: false, comment: "计量单位" },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "单价",
    },
    status: { type: DataTypes.TINYINT, defaultValue: 1, comment: "状态" },
    remark: { type: DataTypes.STRING(255), comment: "备注" },
  },
  { sequelize, tableName: "payment_item", comment: "缴费项目表" },
);
