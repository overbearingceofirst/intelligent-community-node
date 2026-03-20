/**
 * 居民模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface ResidentAttributes {
  id: number;
  username: string;
  password: string;
  realName?: string;
  phone?: string;
  idCard?: string;
  avatar?: string;
  buildingId?: number;
  unitNo?: string;
  roomNo?: string;
  authStatus: number; // 0:未认证 1:待审核 2:已认证 3:驳回
  bindStatus: number; // 0:未绑定 1:待审核 2:已绑定 3:驳回
  status: number; // 0:禁用 1:启用
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ResidentCreationAttributes extends Optional<
  ResidentAttributes,
  "id" | "authStatus" | "bindStatus" | "status" | "points"
> {}

export class Resident
  extends Model<ResidentAttributes, ResidentCreationAttributes>
  implements ResidentAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
  public realName?: string;
  public phone?: string;
  public idCard?: string;
  public avatar?: string;
  public buildingId?: number;
  public unitNo?: string;
  public roomNo?: string;
  public authStatus!: number;
  public bindStatus!: number;
  public status!: number;
  public points!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resident.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "用户名/手机号",
    },
    password: { type: DataTypes.STRING(255), allowNull: false },
    realName: { type: DataTypes.STRING(50), comment: "真实姓名" },
    phone: { type: DataTypes.STRING(20), comment: "手机号" },
    idCard: { type: DataTypes.STRING(20), comment: "身份证号" },
    avatar: { type: DataTypes.STRING(255), comment: "头像" },
    buildingId: { type: DataTypes.INTEGER.UNSIGNED, comment: "楼栋ID" },
    unitNo: { type: DataTypes.STRING(20), comment: "单元号" },
    roomNo: { type: DataTypes.STRING(20), comment: "房间号" },
    authStatus: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "实名认证状态",
    },
    bindStatus: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "房屋绑定状态",
    },
    status: { type: DataTypes.TINYINT, defaultValue: 1, comment: "账号状态" },
    points: { type: DataTypes.INTEGER, defaultValue: 0, comment: "积分" },
  },
  { sequelize, tableName: "resident", comment: "居民表" },
);
