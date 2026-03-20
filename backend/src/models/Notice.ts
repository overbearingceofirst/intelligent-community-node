/**
 * 通知公告模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface NoticeAttributes {
  id: number;
  title: string;
  content: string;
  type: number; // 1:通知 2:公告
  targetBuildings?: string;
  publisherId: number;
  publishTime?: Date;
  status: number; // 0:草稿 1:已发布 2:下架
  readCount: number;
  createdAt?: Date;
}

interface NoticeCreationAttributes extends Optional<
  NoticeAttributes,
  "id" | "status" | "readCount"
> {}

export class Notice
  extends Model<NoticeAttributes, NoticeCreationAttributes>
  implements NoticeAttributes
{
  public id!: number;
  public title!: string;
  public content!: string;
  public type!: number;
  public targetBuildings?: string;
  public publisherId!: number;
  public publishTime?: Date;
  public status!: number;
  public readCount!: number;
  public readonly createdAt!: Date;
}

Notice.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING(100), allowNull: false, comment: "标题" },
    content: { type: DataTypes.TEXT, allowNull: false, comment: "内容" },
    type: { type: DataTypes.TINYINT, allowNull: false, comment: "类型" },
    targetBuildings: { type: DataTypes.TEXT, comment: "目标楼栋JSON" },
    publisherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "发布人ID",
    },
    publishTime: { type: DataTypes.DATE, comment: "发布时间" },
    status: { type: DataTypes.TINYINT, defaultValue: 0, comment: "状态" },
    readCount: { type: DataTypes.INTEGER, defaultValue: 0, comment: "阅读量" },
  },
  { sequelize, tableName: "notice", comment: "通知公告表" },
);
