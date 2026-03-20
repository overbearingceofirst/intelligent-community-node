/**
 * 字典模型
 * 包含字典类型和字典数据
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

// ==================== 字典类型 ====================
export interface DictTypeAttributes {
  id: number;
  dictName: string;
  dictType: string;
  status: number;
  remark?: string;
}

interface DictTypeCreationAttributes extends Optional<
  DictTypeAttributes,
  "id" | "status"
> {}

export class DictType
  extends Model<DictTypeAttributes, DictTypeCreationAttributes>
  implements DictTypeAttributes
{
  public id!: number;
  public dictName!: string;
  public dictType!: string;
  public status!: number;
  public remark?: string;
}

DictType.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    dictName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "字典名称",
    },
    dictType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "字典类型",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "状态：0停用 1正常",
    },
    remark: {
      type: DataTypes.STRING(500),
      comment: "备注",
    },
  },
  {
    sequelize,
    tableName: "sys_dict_type",
    comment: "字典类型表",
  },
);

// ==================== 字典数据 ====================
export interface DictDataAttributes {
  id: number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass?: string;
  listClass?: string;
  isDefault: number;
  status: number;
  remark?: string;
}

interface DictDataCreationAttributes extends Optional<
  DictDataAttributes,
  "id" | "dictSort" | "isDefault" | "status"
> {}

export class DictData
  extends Model<DictDataAttributes, DictDataCreationAttributes>
  implements DictDataAttributes
{
  public id!: number;
  public dictSort!: number;
  public dictLabel!: string;
  public dictValue!: string;
  public dictType!: string;
  public cssClass?: string;
  public listClass?: string;
  public isDefault!: number;
  public status!: number;
  public remark?: string;
}

DictData.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    dictSort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "字典排序",
    },
    dictLabel: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "字典标签",
    },
    dictValue: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "字典键值",
    },
    dictType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "字典类型",
    },
    cssClass: {
      type: DataTypes.STRING(100),
      comment: "样式属性",
    },
    listClass: {
      type: DataTypes.STRING(100),
      comment: "表格回显样式",
    },
    isDefault: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "是否默认：0否 1是",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "状态：0停用 1正常",
    },
    remark: {
      type: DataTypes.STRING(500),
      comment: "备注",
    },
  },
  {
    sequelize,
    tableName: "sys_dict_data",
    comment: "字典数据表",
  },
);
