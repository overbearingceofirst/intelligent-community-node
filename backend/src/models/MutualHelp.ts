/**
 * 邻里互助模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface MutualHelpAttributes {
  id: number;
  residentId: number;
  title: string;
  content: string;
  images?: string;
  reward?: string;
  status: number; // 0:待审核 1:进行中 2:已完成 3:已关闭 4:驳回
  helperId?: number;
  points: number;
  auditNote?: string;
  createdAt?: Date;
}

interface MutualHelpCreationAttributes extends Optional<
  MutualHelpAttributes,
  "id" | "status" | "points"
> {}

export class MutualHelp
  extends Model<MutualHelpAttributes, MutualHelpCreationAttributes>
  implements MutualHelpAttributes
{
  public id!: number;
  public residentId!: number;
  public title!: string;
  public content!: string;
  public images?: string;
  public reward?: string;
  public status!: number;
  public helperId?: number;
  public points!: number;
  public auditNote?: string;
  public readonly createdAt!: Date;
}

MutualHelp.init(
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
    content: { type: DataTypes.TEXT, allowNull: false, comment: "内容" },
    images: { type: DataTypes.TEXT, comment: "图片JSON" },
    reward: { type: DataTypes.STRING(100), comment: "悬赏" },
    status: { type: DataTypes.TINYINT, defaultValue: 0, comment: "状态" },
    helperId: { type: DataTypes.INTEGER.UNSIGNED, comment: "帮助者ID" },
    points: { type: DataTypes.INTEGER, defaultValue: 0, comment: "奖励积分" },
    auditNote: { type: DataTypes.STRING(255), comment: "审核备注" },
  },
  { sequelize, tableName: "mutual_help", comment: "邻里互助表" },
);
