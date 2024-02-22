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
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import type { DataDefinitionBase, DataType, IDataDefinition, IDataSourceNode, TableColumn } from '@/models/data-source.model';
import { createDataDefinition, DataSource, toDataDefinitions } from '@/models/data-source.model';

export class DataSourceService extends Disposable {
  private _dataSource: DataSource = new DataSource();

  private _dataNodes$ = new BehaviorSubject<IDataDefinition<DataType>[]>([]);
  dataNodes$ = this._dataNodes$.pipe(distinctUntilChanged());

  constructor(dataSourceNodes?: IDataSourceNode<DataType>[]) {
    super();
    if (dataSourceNodes) {
      this.setNodes(toDataDefinitions(dataSourceNodes));
    }
  }

  override dispose(): void {
    super.dispose();
    this._dataNodes$.complete();
  }

  isEditing(): boolean {
    return this._dataSource.isEditing;
  }

  changeToEditing(node: IDataDefinition<DataType>) {
    this._setEditing(node, true);
  }

  changeToNormal(node: IDataDefinition<DataType>) {
    this._setEditing(node, false);
  }

  private _setEditing(node: IDataDefinition<DataType>, editing: boolean) {
    const operationList = this._getOperationList(node);
    const index = operationList.findIndex((item) => item === node);
    const newNode = node.clone();
    newNode.editing = editing;
    operationList.splice(index, 1, newNode);
    this._notification();
  }

  /**
   * 转换节点类型
   * @param node 转换类型的节点
   * @param newType 新类型
   */
  changeType(node: IDataDefinition<DataType>, newType: DataType) {
    const operationList = this._getOperationList(node);
    const index = operationList.findIndex((item) => item === node);
    const newNode = node.clone();
    newNode.type = newType;
    if (node.isReference() && !newNode.isReference()) {
      newNode.children = undefined;
    }

    if (!node.isReference() && newNode.isReference()) {
      newNode.children = [];
    }

    if (node.isNamespace() && newNode.isTable()) {
      newNode.children = node.children.filter((item) => !item.isReference()) as DataDefinitionBase<TableColumn>[];
    }
    operationList.splice(index, 1, newNode);
    this._notification();
  }

  private _notification() {
    this.setNodes(this._dataNodes$.getValue());
  }

  private _getOperationList(node: IDataDefinition<DataType>) {
    return node.parent ? node.parent.children : this._dataNodes$.getValue();
  }

  isDuplicated(node: IDataDefinition<DataType>, newVal: string): boolean {
    return this._getOperationList(node).filter((child) => child !== node && child.key === newVal).length > 0;
  }

  setNodes(dataSourceNodes: IDataDefinition<DataType>[]) {
    this._dataSource.setNodes(dataSourceNodes);
    this._dataNodes$.next([...dataSourceNodes]);
  }

  addNode(node: IDataSourceNode<DataType>, parent?: IDataDefinition<DataType>, currentNode?: IDataDefinition<DataType>, position: 'before' | 'after' = 'before'): DataDefinitionBase<DataType> {
    const dataSourceNodes = this._dataNodes$.getValue();
    const dataDefinition = createDataDefinition(node);
    const operationNodes = parent?.isReference?.() ? parent.children! : dataSourceNodes;

    let insertIndex = operationNodes.length;
    if (currentNode) {
      insertIndex = operationNodes.indexOf(currentNode as DataDefinitionBase<DataType>);
    }

    if (position === 'after') {
      insertIndex++;
    }

    operationNodes.splice(insertIndex, 0, dataDefinition);

    if (parent?.isReference?.()) {
      dataDefinition.setParent(parent);
    }

    this.setNodes(dataSourceNodes);
    return dataDefinition;
  }

  removeNode(node: IDataDefinition<DataType>) {
    const dataSourceNodes = this._dataNodes$.getValue();

    if (node.parent) {
      node.parent.children = node.parent.children?.filter((child) => child !== node);
    } else {
      dataSourceNodes.splice(dataSourceNodes.indexOf(node), 1);
    }

    this.setNodes(dataSourceNodes);
  }

  setDataSource(dataSource: DataSource) {
    this._dataSource = dataSource;
    this._dataNodes$.next(dataSource.getNodes());
  }

  getDataSource(): DataSource {
    return this._dataSource;
  }
}
