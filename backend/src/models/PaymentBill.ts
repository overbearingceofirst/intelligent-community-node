/**
 * 缴费账单模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface PaymentBillAttributes {
  id: number;
  residentId: number;
  itemId: number;
  amount: number;
  billMonth: string;
  status: number; // 0:未缴 1:已缴 2:逾期
  payTime?: Date;
  remark?: string;
  createdAt?: Date;
}

interface PaymentBillCreationAttributes extends Optional<
  PaymentBillAttributes,
  "id" | "status"
> {}

export class PaymentBill
  extends Model<PaymentBillAttributes, PaymentBillCreationAttributes>
  implements PaymentBillAttributes
{
  public id!: number;
  public residentId!: number;
  public itemId!: number;
  public amount!: number;
  public billMonth!: string;
  public status!: number;
  public payTime?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
}

PaymentBill.init(
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
    itemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "缴费项目ID",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "金额",
    },
    billMonth: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "账单月份",
    },
    status: { type: DataTypes.TINYINT, defaultValue: 0, comment: "状态" },
    payTime: { type: DataTypes.DATE, comment: "缴费时间" },
    remark: { type: DataTypes.STRING(255), comment: "备注" },
  },
  { sequelize, tableName: "payment_bill", comment: "缴费账单表" },
);
