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

import type { IRange } from '@univerjs/core';
import type { DataNodeId } from './data-source.model';

export interface IBindingNode {
  /** binding name, use for data extract */
  name: string;
  /** Node reference, used to find the mapping relationship with the data source node  */
  dataNodeId: DataNodeId;
  /** Bind univer instance ID */
  unitId: string;
  /** The ID of the bound Union sheet */
  subUnitId: string;
  /** The location and scope of binding */
  range: IRange;
}

export interface IDataBinding {
  setBindings(bindings: IBindingNode[]): void;
  getBindings(): IBindingNode[];
  getBindingsByDataNodeId(dataNodeId: DataNodeId): IBindingNode[];
  addBinding(binding: IBindingNode): void;
  removeBinding(binding: IBindingNode): void;
  removeBindings(dataNodeId: DataNodeId): void;
}

export class DataBinding implements IDataBinding {
  private _bindings: IBindingNode[];

  constructor(bindings: IBindingNode[] = []) {
    this._bindings = bindings;
  }

  removeBindings(dataNodeId: DataNodeId): void {
    this._bindings
      .map((binding, index) => binding.dataNodeId === dataNodeId ? index : -1)
      .filter((index) => index > -1)
      .reverse()
      .forEach((index) => this._bindings.splice(index, 1));
  }

  removeBinding(binding: IBindingNode): void {
    const removeBindingIndex = this._bindings.findIndex((b) => b.dataNodeId === binding.dataNodeId);
    if (removeBindingIndex > -1) {
      this._bindings.splice(removeBindingIndex, 1);
    }
  }

  addBinding(binding: IBindingNode): void {
    this._bindings.push(binding);
  }

  setBindings(bindings: IBindingNode[]): void {
    this._bindings = bindings;
  }

  getBindings(): IBindingNode[] {
    return this._bindings;
  }

  getBindingsByDataNodeId(dataNodeId: DataNodeId): IBindingNode[] {
    return this._bindings.filter((binding) => binding.dataNodeId === dataNodeId);
  }

  toJSON() {
    return this._bindings;
  }
}
