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

/** 数据类型 */
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

export type Name = string;

export type DataNodeId = string;

/** 数据源节点定义 */
export interface IDataNode<T extends DataType = DataType> {
  id?: DataNodeId;
  /** 节点类型 */
  type: T;
  /** 类型键，同级唯一 */
  name: Name;
  /** 父节点 */
  parent?: IDataNode<ReferenceDataType>;
  /** 子节点列表 */
  children?: IDataNode<DataType>[];
}

export interface IDataSource {
  getNodes: () => IDataNode[];
  setNodes: (nodes: IDataNode[]) => void;
  getById: (id: string) => IDataNode | null;
}

/** 数据源 */
export class DataSource implements IDataSource {
  private _nodes: IDataNode[];

  constructor(nodes: IDataNode[] = []) {
    this._nodes = sutureNodes(nodes);
  }

  setNodes(nodes: IDataNode[]): void {
    this._nodes = nodes;
  }

  getNodes(): IDataNode[] {
    return this._nodes;
  }

  getById(id: string): IDataNode | null {
    return this._getNodeById(this._nodes, id);
  }

  private _getNodeById(nodes: IDataNode[], id: string): IDataNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const child = this._getNodeById(node.children, id);
        if (child) return child;
      }
    }
    return null;
  }

  toJSON() {
    return this._nodes;
  }
}

let nodeSeq = 1;

/**
 * suture the data node
 * @param node The data node
 * @returns filled data node
 */
export function sutureNode(node: IDataNode, parent?: IDataNode, forceSetId = false): IDataNode {
  if (forceSetId) {
    node.id = `N${nodeSeq++}`;
  } else if (!node.id) {
    node.id = `N${nodeSeq++}`;
  }

  if (!isReference(node)) {
    node.children = undefined;
  } else if (!haveChildren(node)) {
    node.children = [];
  }

  if (!parent || isReference(parent)) {
    node.parent = parent;
  }

  return node;
}

/**
 * recursion suture the data node
 * @param nodes
 * @returns filled data node
 */
function sutureNodes(nodes: IDataNode[], parent?: IDataNode): IDataNode[] {
  return nodes.map((node) => {
    node = sutureNode(node, parent, true);
    isReference(node) && (node.children = sutureNodes(node.children!, node));
    return node;
  });
}

export function isReference(node?: IDataNode): node is IDataNode<ReferenceDataType> {
  return !!node && (node.type === DataType.Namespace || node.type === DataType.Table);
}

export function isTable(node?: IDataNode): node is IDataNode<DataType.Table> {
  return !!node && node.type === DataType.Table;
}

export function isReferenceType(type: DataType): type is ReferenceDataType {
  return type === DataType.Namespace || type === DataType.Table;
}

export function isNamespace(node?: IDataNode): node is IDataNode<DataType.Namespace> {
  return !!node && node.type === DataType.Namespace;
}

export function isDate(node?: IDataNode): node is IDataNode<DataType.Date> {
  return !!node && node.type === DataType.Date;
}

export function haveChildren(node: IDataNode): boolean {
  return !!node.children && node.children.length > 0;
}

export function setParent(node: IDataNode, parent?: IDataNode): void {
  if (node.parent && node.parent !== parent) {
    node.parent.children = node.parent.children?.filter((child) => child.id !== node.id);
  }

  if (!parent || isReference(parent)) {
    node.parent = parent;
  }
}

export function getPath(node: IDataNode): Name[] {
  return node.parent ? [...getPath(node.parent), node.name] : [node.name];
}
