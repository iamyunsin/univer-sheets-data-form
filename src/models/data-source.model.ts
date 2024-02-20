/**
 * Copyright 2024-present iamyunsin
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export enum DataType {
  /** 命名空间 */
  Namespace,
  /** 表格 */
  Table,
  /** 文本 */
  Text,
  /** 日期 */
  Date,
  /** 数字 */
  Number,
}

/** 值数据类型 */
export type ValueDataType = DataType.Text | DataType.Date | DataType.Number;

/** 可作为表列的类型 */
export type TableColumn = DataType.Text | DataType.Date | DataType.Number;

/** 引用数据类型，表格/命名空间，能容纳字节点的类型 */
export type ReferenceDataType = DataType.Table | DataType.Namespace;

/** 数据源节点定义 */
export interface IDataSourceNode<T extends DataType> {
  /** 节点类型 */
  type: T;
  /** 类型键，同级唯一 */
  key: string;
  /** 父节点 */
  parent?: ReferenceDataDefinition<ReferenceDataType, DataType> | IDataSourceNode<ReferenceDataType>;
}

function toDataDefinition<T extends DataType>(node?: IDataSourceNode<T> | IDataDefinition<T>): DataDefinitionBase<DataType> | undefined {
  if (!node) return undefined;
  return node instanceof DataDefinitionBase ? node : createDataDefinition(node, false);
}

/** 根据IDataSourceNode数据声明，创建数据定义实例 */
export function createDataDefinition<T extends DataType>(node: IDataSourceNode<T>, editing = true): DataDefinitionBase<DataType> {
  let dataDefinition: DataDefinitionBase<DataType>;
  const parentNode = toDataDefinition(node.parent) as ReferenceDataDefinition<ReferenceDataType, DataType>;

  switch (node.type) {
    case DataType.Namespace:
      dataDefinition = new NamespaceDefinition(node.key, parentNode);
      break;
    case DataType.Table:
      dataDefinition = new TableDefinition(node.key, parentNode);
      break;
    case DataType.Text:
      dataDefinition = new TextDefinition(node.key, parentNode);
      break;
    case DataType.Date:
      dataDefinition = new DateDefinition(node.key, parentNode);
      break;
    case DataType.Number:
      dataDefinition = new NumberDefinition(node.key, parentNode);
      break;
    default:
      throw new Error(`Unsupported data type: ${node.type}`);
  }
  dataDefinition.editing = editing;
  return dataDefinition;
}

/** 数据定义接口 */
export interface IDataDefinition<T extends DataType> {
  /** 数据类型 */
  type: T;

  /** 类型键，同级唯一 */
  key: string;

  /** 是否正在编辑 */
  editing?: boolean;

  /** 路径 */
  path: string[];

  /** 当前节点的父节点 */
  parent?: ReferenceDataDefinition<ReferenceDataType, DataType>;

  children?: IDataDefinition<DataType>[];

  isReference(): this is ReferenceDataDefinition<ReferenceDataType, DataType>;
  isTable(): this is TableDefinition;
  isNamespace(): this is NamespaceDefinition;

  getChildren(): IDataDefinition<DataType>[];

  /** 深拷贝，会执行当前节点及其子节点的深拷贝 */
  deepClone(): IDataDefinition<DataType>;

  /** 仅拷贝当前这一层，其子节点不会被拷贝 */
  clone(): IDataDefinition<DataType>;
}

/** 数据类型基类 */
export abstract class DataDefinitionBase<T extends DataType> implements IDataDefinition<DataType> {
  /** 数据类型 */
  type: T;
  /** 类型键，同级唯一 */
  key: string;
  /** 是否正在编辑 */
  editing?: boolean;
  /** 当前节点的父节点 */
  parent?: ReferenceDataDefinition<ReferenceDataType, DataType>;

  children?: DataDefinitionBase<DataType>[];

  /** 路径 */
  path: string[] = [];

  pathString: string = '';

  constructor(props: IDataSourceNode<T>) {
    this.type = props.type;
    this.key = props.key;
    this.setParent(toDataDefinition(props.parent) as ReferenceDataDefinition<ReferenceDataType, DataType>);
  }

  setParent(parent?: ReferenceDataDefinition<ReferenceDataType, DataType>) {
    this.parent = parent;
    this.path = this._path;
    this.pathString = this.path.join('.');
  }

  getChildren(): IDataDefinition<DataType>[] {
    return this.children || [];
  }

  getParent(): DataDefinitionBase<ReferenceDataType> | undefined {
    return this.parent;
  }

  get _path(): string[] {
    if (!this.parent) return [this.key];
    return [...this.parent?.path, this.key];
  }

  isReference(): this is ReferenceDataDefinition<ReferenceDataType, DataType> {
    return this.type === DataType.Table || this.type === DataType.Namespace;
  }

  isNamespace(): this is NamespaceDefinition {
    return this.type === DataType.Namespace;
  }

  isTable(): this is TableDefinition {
    return this.type === DataType.Table;
  }

  isText(): this is TextDefinition {
    return this.type === DataType.Text;
  }

  isDate(): this is DateDefinition {
    return this.type === DataType.Date;
  }

  isNumber(): this is NumberDefinition {
    return this.type === DataType.Number;
  }

  deepClone(): IDataDefinition<DataType> {
    const clonedInstance = {
      ...this,
    };
    clonedInstance.children = this.children?.map((c) => c.deepClone()) as DataDefinitionBase<DataType>[];
    Object.setPrototypeOf(clonedInstance, Object.getPrototypeOf(this));
    return clonedInstance;
  }

  clone(): IDataDefinition<DataType> {
    const clonedInstance = {
      ...this,
    };
    Object.setPrototypeOf(clonedInstance, Object.getPrototypeOf(this));
    return clonedInstance;
  }

  toJSON() {
    return {
      type: this.type,
      key: this.key,
      path: this.path,
    };
  }
}

export abstract class ReferenceDataDefinition<T extends ReferenceDataType, R extends DataType> extends DataDefinitionBase<T> {
  override children: DataDefinitionBase<R>[] = [];

  constructor(props: IDataSourceNode<T>) {
    super(props);
  }

  addChild(child: DataDefinitionBase<R>) {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.setParent(this);
    this.children.push(child);
  }

  getChildren(): DataDefinitionBase<R>[] {
    return [...this.children];
  }

  removeChild(child: DataDefinitionBase<R>) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.setParent(undefined);
      this.children.splice(index, 1);
    }
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      children: [...this.children],
    };
  }
}

/** 表格数据定义 */
export class TableDefinition extends ReferenceDataDefinition<DataType.Table, TableColumn> {
  constructor(
    key: string,
    parent?: ReferenceDataDefinition<ReferenceDataType, DataType>
  ) {
    super({ type: DataType.Table, key, parent });
  }

  addColumn(column: DataDefinitionBase<TableColumn>) {
    return super.addChild(column);
  }

  removeColumn(column: DataDefinitionBase<TableColumn>) {
    return super.removeChild(column);
  }

  getColumns(): DataDefinitionBase<TableColumn>[] {
    return super.getChildren();
  }
}

export class NamespaceDefinition extends ReferenceDataDefinition<DataType.Namespace, DataType> {
  constructor(key: string, parent?: ReferenceDataDefinition<ReferenceDataType, DataType>) {
    super({ type: DataType.Namespace, key, parent });
  }

  addField(field: DataDefinitionBase<DataType>) {
    return this.addChild(field);
  }

  removeField(field: DataDefinitionBase<DataType>) {
    return this.removeChild(field);
  }

  getFields(): DataDefinitionBase<DataType>[] {
    return this.getChildren();
  }
}

export class TextDefinition extends DataDefinitionBase<DataType.Text> {
  constructor(key: string, parent?: ReferenceDataDefinition<ReferenceDataType, DataType>) {
    super({ type: DataType.Text, key, parent });
  }
}

export class DateDefinition extends DataDefinitionBase<DataType.Date> {
  constructor(key: string, parent?: ReferenceDataDefinition<ReferenceDataType, DataType>) {
    super({ type: DataType.Date, key, parent });
  }
}

export class NumberDefinition extends DataDefinitionBase<DataType.Number> {
  constructor(key: string, parent?: ReferenceDataDefinition<ReferenceDataType, DataType>) {
    super({ type: DataType.Number, key, parent });
  }
}

export class DataSource {
  nodes: IDataDefinition<DataType>[] = [];

  isEditing: boolean = false;

  constructor(nodes: IDataDefinition<DataType>[] = []) {
    this.setNodes(nodes);
  }

  setNodes(nodes: IDataDefinition<DataType>[]) {
    this.nodes = nodes;
    this.isEditing = this._getIsEditing();
  }

  getNodes(): IDataDefinition<DataType>[] {
    return this.nodes;
  }

  private _getIsEditing() {
    const hasEditing = (nodes: IDataDefinition<DataType>[]) => {
      return nodes.some((node): boolean => {
        return node.editing || (node.isReference() && hasEditing(node.children));
      });
    };
    return hasEditing(this.nodes);
  }

  private _getNode(
    nodes: IDataDefinition<DataType>[],
    path: string[]
  ): IDataDefinition<DataType> | undefined {
    const node = nodes.find((n) => n.key === path[0]);

    if (path.length === 1) {
      return node;
    }

    if (!node?.isReference()) {
      return undefined;
    }

    const children = node.getChildren();
    if (children.length && path.length > 1) {
      return this._getNode(children, path.slice(1));
    }

    return undefined;
  }

  getNode(path: string[]): IDataDefinition<DataType> | undefined {
    return this._getNode(this.nodes, path);
  }

  toJSON() {
    return this.nodes;
  }
}
