/**
 * 访客模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface VisitorAttributes {
  id: number;
  residentId: number;
  visitorName: string;
  visitorPhone?: string;
  visitTime: Date;
  qrCode?: string;
  status: number; // 0:待核验 1:已核验 2:已过期
  verifyTime?: Date;
  verifierId?: number;
  createdAt?: Date;
}

interface VisitorCreationAttributes extends Optional<
  VisitorAttributes,
  "id" | "status"
> {}

export class Visitor
  extends Model<VisitorAttributes, VisitorCreationAttributes>
  implements VisitorAttributes
{
  public id!: number;
  public residentId!: number;
  public visitorName!: string;
  public visitorPhone?: string;
  public visitTime!: Date;
  public qrCode?: string;
  public status!: number;
  public verifyTime?: Date;
  public verifierId?: number;
  public readonly createdAt!: Date;
}

Visitor.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    residentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "邀请居民ID",
    },
    visitorName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "访客姓名",
    },
    visitorPhone: { type: DataTypes.STRING(20), comment: "访客电话" },
    visitTime: { type: DataTypes.DATE, allowNull: false, comment: "预约时间" },
    qrCode: { type: DataTypes.STRING(255), comment: "二维码" },
    status: { type: DataTypes.TINYINT, defaultValue: 0, comment: "状态" },
    verifyTime: { type: DataTypes.DATE, comment: "核验时间" },
    verifierId: { type: DataTypes.INTEGER.UNSIGNED, comment: "核验人ID" },
  },
  { sequelize, tableName: "visitor", comment: "访客表" },
);
