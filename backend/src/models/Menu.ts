/**
 * 菜单模型
 * 存储系统菜单和权限信息
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface MenuAttributes {
  id: number;
  name: string;
  parentId: number;
  orderNum: number;
  path?: string;
  component?: string;
  query?: string;
  isFrame: number; // 0:否 1:是
  isCache: number; // 0:否 1:是
  menuType: string; // M:目录 C:菜单 F:按钮
  visible: number; // 0:隐藏 1:显示
  status: number;
  perms?: string; // 权限标识
  icon?: string;
  remark?: string;
}

interface MenuCreationAttributes extends Optional<
  MenuAttributes,
  "id" | "parentId" | "orderNum" | "isFrame" | "isCache" | "visible" | "status"
> {}

export class Menu
  extends Model<MenuAttributes, MenuCreationAttributes>
  implements MenuAttributes
{
  public id!: number;
  public name!: string;
  public parentId!: number;
  public orderNum!: number;
  public path?: string;
  public component?: string;
  public query?: string;
  public isFrame!: number;
  public isCache!: number;
  public menuType!: string;
  public visible!: number;
  public status!: number;
  public perms?: string;
  public icon?: string;
  public remark?: string;
}

Menu.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: "菜单ID",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "菜单名称",
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: "父菜单ID",
    },
    orderNum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "显示顺序",
    },
    path: {
      type: DataTypes.STRING(200),
      comment: "路由地址",
    },
    component: {
      type: DataTypes.STRING(255),
      comment: "组件路径",
    },
    query: {
      type: DataTypes.STRING(255),
      comment: "路由参数",
    },
    isFrame: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "是否外链：0否 1是",
    },
    isCache: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "是否缓存：0否 1是",
    },
    menuType: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      comment: "菜单类型：M目录 C菜单 F按钮",
    },
    visible: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "显示状态：0隐藏 1显示",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "菜单状态：0停用 1正常",
    },
    perms: {
      type: DataTypes.STRING(100),
      comment: "权限标识",
    },
    icon: {
      type: DataTypes.STRING(100),
      comment: "菜单图标",
    },
    remark: {
      type: DataTypes.STRING(500),
      comment: "备注",
    },
  },
  {
    sequelize,
    tableName: "sys_menu",
    comment: "菜单权限表",
  },
);
