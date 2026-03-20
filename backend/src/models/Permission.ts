import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

interface PermissionAttributes {
  id: number;
  name: string;
  code: string;
  type: string; // menu / button
  parentId?: number;
  path?: string;
  icon?: string;
  sort?: number;
}

interface PermissionCreationAttributes extends Optional<
  PermissionAttributes,
  "id"
> {}

export class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: string;
  public parentId?: number;
  public path?: string;
  public icon?: string;
  public sort?: number;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "权限名称",
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "权限编码",
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "类型：menu/button",
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: "父级ID",
    },
    path: {
      type: DataTypes.STRING(255),
      comment: "路由路径",
    },
    icon: {
      type: DataTypes.STRING(50),
      comment: "图标",
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "排序",
    },
  },
  {
    sequelize,
    tableName: "permissions",
    timestamps: true,
  },
);
