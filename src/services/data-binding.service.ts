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
import { Disposable } from '@univerjs/core';
import type { IBindingNode, IDataBinding } from '@/models/data-binding.model';
import { DataBinding } from '@/models/data-binding.model';
import type { IDataNode } from '@/models/data-source.model';

export interface IBindingSheetInfo {
  unitId: string;
  subUnitId: string;
  range: IRange;
}

export class DataBindingService extends Disposable {
  private _binding: IDataBinding = new DataBinding([]);

  constructor(bindings: IBindingNode[]) {
    super();
    this._binding.setBindings(bindings);
  }

  bindNode(node: IDataNode, bindSheetInfo: IBindingSheetInfo) {
    const binding: IBindingNode = {
      name: this._genBindingName(node),
      dataNodeId: node.id!,
      ...bindSheetInfo,
    };
    this._binding.addBinding(binding);
  }

  unbindNode(binding: IBindingNode) {
    this._binding.removeBinding(binding);
  }

  private _genBindingName(node: IDataNode) {
    const currentNodeBindings = this._binding.getBindingsByDataNodeId(node.id!);
    if (currentNodeBindings.length > 0) {
      let seq = currentNodeBindings.length;
      let name = `${node.name}${seq++}`;
      while (true) {
        if (!currentNodeBindings.some((binding) => binding.name === name)) {
          return name;
        } else {
          name = `${name}${seq++}`;
        }
      }
    }
    return node.name;
  }
}
