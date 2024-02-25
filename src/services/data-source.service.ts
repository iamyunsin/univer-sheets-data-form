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

import { Disposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import type { IDataNode, ReferenceDataType } from '@/models/data-source.model';
import { DataSource, DataType, isNamespace, isReference, isReferenceType, setParent, sutureNode } from '@/models/data-source.model';

export class DataSourceService extends Disposable {
  private _dataSource: DataSource;

  private _dataNodes$ = new BehaviorSubject<IDataNode[]>([]);
  dataNodes$ = this._dataNodes$;

  constructor(dataNodes: IDataNode[] = []) {
    super();
    this._dataSource = new DataSource(dataNodes);
    this._dataNodes$.next(this._dataSource.getNodes());
  }

  override dispose(): void {
    super.dispose();
    this._dataNodes$.complete();
  }

  /**
   * 转换节点类型
   * @param node 转换类型的节点
   * @param newType 新类型
   */
  changeType(node: IDataNode, newType: DataType) {
    if (isReference(node) && !isReferenceType(newType)) {
      node.children = undefined;
    }

    if (!isReference(node) && isReferenceType(newType)) {
      node.children = [];
    }

    if (isNamespace(node) && newType === DataType.Table) {
      node.children = node.children!.filter((item) => !isReference(item));
    }

    node.type = newType;

    this._notification();
  }

  private _notification() {
    this.setNodes(this._dataSource.getNodes());
  }

  private _getOperationList(node: IDataNode): IDataNode[] {
    if (node.parent) return node.parent.children!;
    return this._dataSource.getNodes();
  }

  isDuplicated(node: IDataNode, newVal: string): boolean {
    return this._getOperationList(node).filter((child) => child !== node && child.name === newVal).length > 0;
  }

  setNodes(dataNodes: IDataNode[]) {
    this._dataSource.setNodes(dataNodes);
    this._dataNodes$.next([...dataNodes]);
  }

  addNode(node: IDataNode<DataType>, parent?: IDataNode<DataType>, currentNode?: IDataNode<DataType>, position: 'before' | 'after' = 'before'): IDataNode {
    const dataNodes = this._dataSource.getNodes();
    const dataNode = sutureNode(node, parent);
    const operationNodes = parent && isReference(parent) ? parent.children! : dataNodes;

    let insertIndex = operationNodes.length;
    if (currentNode) {
      insertIndex = operationNodes.indexOf(currentNode);
    }

    if (position === 'after') {
      insertIndex++;
    }

    operationNodes.splice(insertIndex, 0, dataNode);

    setParent(dataNode, parent);

    this.setNodes(dataNodes);
    return dataNode;
  }

  removeNode(node: IDataNode) {
    this._removeNode(node);

    this._notification();
  }

  _removeNode(node: IDataNode) {
    const dataSourceNodes = this._dataSource.getNodes();

    if (node.parent) {
      node.parent.children = node.parent.children?.filter((child) => child !== node);
    } else {
      dataSourceNodes.splice(dataSourceNodes.indexOf(node), 1);
    }
  }

  moveNodes(moveNodes: IDataNode[], index: number, parent?: IDataNode<ReferenceDataType>) {
    const operationNodes = parent ? parent.children! : this._dataSource.getNodes();
    let insertIndex = index;
    for (let i = moveNodes.length - 1; i >= 0; i--) {
      const node = moveNodes[i];
      if (node.parent === parent) {
        const oldIndex = operationNodes.indexOf(node);
        if (oldIndex < index) {
          insertIndex -= 1;
        }
        operationNodes.splice(oldIndex, 1);
      } else {
        this._removeNode(node);
        node.parent = parent;
      }
      operationNodes.splice(insertIndex, 0, node);
    }
    this._notification();
  }

  getMoveDuplicate(moveNodes: IDataNode[], parent?: IDataNode<ReferenceDataType>) {
    const operationNodes = parent ? parent.children! : this._dataSource.getNodes();
    for (let i = moveNodes.length - 1; i >= 0; i--) {
      const node = moveNodes[i];
      const duplicatedNodeIndex = operationNodes.findIndex((child) => child.name === node.name && child.id !== node.id);
      if (duplicatedNodeIndex !== -1) {
        return node;
      }
    }
    return false;
  }

  setDataSource(dataSource: DataSource) {
    this._dataSource = dataSource;
    this._dataNodes$.next(dataSource.getNodes());
  }

  getDataSource(): DataSource {
    return this._dataSource;
  }
}
