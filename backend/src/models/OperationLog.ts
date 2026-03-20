/**
 * 操作日志模型
 * 记录用户操作行为
 */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface OperationLogAttributes {
  id: number;
  title: string; // 模块标题
  businessType: number; // 0其它 1新增 2修改 3删除 4授权 5导出 6导入 7强退 8清空数据
  method: string;
  requestMethod: string;
  operatorType: number; // 0其它 1后台 2手机
  operName?: string;
  operUrl?: string;
  operIp?: string;
  operLocation?: string;
  operParam?: string;
  jsonResult?: string;
  status: number; // 0正常 1异常
  errorMsg?: string;
  operTime?: Date;
}

interface OperationLogCreationAttributes extends Optional<
  OperationLogAttributes,
  "id" | "businessType" | "operatorType" | "status"
> {}

export class OperationLog
  extends Model<OperationLogAttributes, OperationLogCreationAttributes>
  implements OperationLogAttributes
{
  public id!: number;
  public title!: string;
  public businessType!: number;
  public method!: string;
  public requestMethod!: string;
  public operatorType!: number;
  public operName?: string;
  public operUrl?: string;
  public operIp?: string;
  public operLocation?: string;
  public operParam?: string;
  public jsonResult?: string;
  public status!: number;
  public errorMsg?: string;
  public operTime?: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: "日志主键",
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "模块标题",
    },
    businessType: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "业务类型",
    },
    method: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "方法名称",
    },
    requestMethod: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "请求方式",
    },
    operatorType: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "操作类别",
    },
    operName: {
      type: DataTypes.STRING(50),
      comment: "操作人员",
    },
    operUrl: {
      type: DataTypes.STRING(255),
      comment: "请求URL",
    },
    operIp: {
      type: DataTypes.STRING(50),
      comment: "主机地址",
    },
    operLocation: {
      type: DataTypes.STRING(255),
      comment: "操作地点",
    },
    operParam: {
      type: DataTypes.TEXT,
      comment: "请求参数",
    },
    jsonResult: {
      type: DataTypes.TEXT,
      comment: "返回参数",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "操作状态：0正常 1异常",
    },
    errorMsg: {
      type: DataTypes.TEXT,
      comment: "错误消息",
    },
    operTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "操作时间",
    },
  },
  {
    sequelize,
    tableName: "sys_oper_log",
    comment: "操作日志记录",
    timestamps: false,
  },
);
