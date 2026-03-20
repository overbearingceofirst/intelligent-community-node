/**
 * 角色模型
 * 存储系统角色信息，关联菜单权限
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface RoleAttributes {
  id: number;
  name: string;
  code: string;
  sort: number;
  status: number;
  menuIds?: string; // JSON 格式存储关联的菜单ID
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RoleCreationAttributes extends Optional<
  RoleAttributes,
  "id" | "sort" | "status"
> {}

export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public name!: string;
  public code!: string;
  public sort!: number;
  public status!: number;
  public menuIds?: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: "角色ID",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "角色名称",
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "角色权限字符串",
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "显示顺序",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "状态：0停用 1正常",
    },
    menuIds: {
      type: DataTypes.TEXT,
      comment: "菜单权限（JSON数组）",
    },
    remark: {
      type: DataTypes.STRING(500),
      comment: "备注",
    },
  },
  {
    sequelize,
    tableName: "sys_role",
    comment: "角色信息表",
  },
);
