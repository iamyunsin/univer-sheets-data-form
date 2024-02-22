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
import type { TreeApi } from 'react-arborist';
import { BehaviorSubject } from 'rxjs';
import type { DataType, IDataDefinition } from '@/models/data-source.model';

export class DataSourceActionService extends Disposable {
  private _tree: TreeApi<IDataDefinition<DataType>> | null = null;

  setTree(tree: TreeApi<IDataDefinition<DataType>>) {
    this._tree = tree;
  }

  // 展开的节点
  private _expandKeys: React.Key[] = [];
  private _expandKeys$ = new BehaviorSubject<React.Key[]>(this._expandKeys);
  expandKeys$ = this._expandKeys$;
  setExpandKeys(keys: React.Key[]) {
    this._expandKeys$.next(keys);
  }

  // 选中的节点
  private _selectedKeys: React.Key[] = [];
  private _selectedKeys$ = new BehaviorSubject<React.Key[]>(this._selectedKeys);
  selectedKeys$ = this._selectedKeys$;
  setSelectedKeys(keys: React.Key[]) {
    this._selectedKeys$.next(keys);
  }

  _checkTreeReady() {
    if (!this._tree) {
      throw new Error('tree is not ready');
    }
  }

  changeToEditing(node: IDataDefinition<DataType>) {
    this._checkTreeReady();
    this._tree!.edit(node);
  }

  changeToNormal() {
    this._checkTreeReady();
    this._tree!.reset();
  }

  editDone(node: IDataDefinition<DataType>, newVal: string) {
    this._checkTreeReady();
    // don‘t use tree.submit，because it will lost node methods
    node.key = newVal;
    this._tree!.reset();
  }

  // 拖拽
  onDragStart() {
    window.addEventListener('mousemove', this.onDragOver);
  }

  // 结束拖拽
  onDragEnd() {
    window.removeEventListener('mousemove', this.onDragOver);
  }

  allowDrop() {
    return false;
  }

  onDragOver() {
  }
}
