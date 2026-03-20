/**
 * 用户模型
 * 存储系统用户信息，关联角色
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

// 用户属性接口
export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  nickname: string;
  email?: string;
  phone?: string;
  avatar?: string;
  sex?: number; // 0:未知 1:男 2:女
  roleId?: number;
  deptId?: number;
  communityId?: number; // 新增：绑定的小区ID
  status: number; // 0:停用 1:正常
  delFlag: number; // 0:正常 1:删除
  loginIp?: string;
  loginDate?: Date;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时可选字段
interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id" | "status" | "delFlag"
> {}

// 用户模型类
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
  public nickname!: string;
  public email?: string;
  public phone?: string;
  public avatar?: string;
  public sex?: number;
  public roleId?: number;
  public deptId?: number;
  public communityId?: number; // 新增：绑定的小区ID
  public status!: number;
  public delFlag!: number;
  public loginIp?: string;
  public loginDate?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: "用户ID",
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "用户账号",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "密码",
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "用户昵称",
    },
    email: {
      type: DataTypes.STRING(100),
      comment: "用户邮箱",
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: "手机号码",
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: "头像地址",
    },
    sex: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "性别：0未知 1男 2女",
    },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: "角色ID",
    },
    deptId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: "部门ID",
    },
    communityId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: "绑定小区ID",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "状态：0停用 1正常",
    },
    delFlag: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "删除标志：0正常 1删除",
    },
    loginIp: {
      type: DataTypes.STRING(50),
      comment: "最后登录IP",
    },
    loginDate: {
      type: DataTypes.DATE,
      comment: "最后登录时间",
    },
    remark: {
      type: DataTypes.STRING(500),
      comment: "备注",
    },
  },
  {
    sequelize,
    tableName: "sys_user",
    comment: "用户信息表",
  },
);
