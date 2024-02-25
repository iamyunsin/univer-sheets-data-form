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

import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { INotificationService } from '@univerjs/ui';
import type { TreeApi } from 'react-arborist';
import { DataType } from '@/models/data-source.model';
import type { IDataNode, ReferenceDataType } from '@/models/data-source.model';
import { DataSourceService } from '@/services/data-source.service';
import type { IMenuCommandOperation } from '@/common/types';

export const RemoveDataNodeCommand: ICommand = {
  id: 'data-form.command.remove-data-node',

  type: CommandType.COMMAND,

  handler: async (accessor, { node }: IMenuCommandOperation) => {
    const dataSourceService = accessor.get(DataSourceService);
    dataSourceService.removeNode(node);
    return true;
  },
};

export const AddSubnodeCommand: ICommand = {
  id: 'data-form.command.add-subnode',

  type: CommandType.COMMAND,

  handler: async (accessor, { node, tree }: IMenuCommandOperation) => {
    const dataSourceService = accessor.get(DataSourceService);
    const newNode = dataSourceService.addNode({ name: '', type: DataType.Text }, node);
    tree.edit(newNode.id!);
    return true;
  },
};

export const AddPreviousSiblingNodeCommand: ICommand = {
  id: 'data-form.command.add-previous-sibling-node',

  type: CommandType.COMMAND,

  handler: async (accessor, { node, tree }: IMenuCommandOperation) => {
    const dataSourceService = accessor.get(DataSourceService);
    const newNode = dataSourceService.addNode({ name: '', type: DataType.Text }, node.parent, node, 'before');
    tree?.edit(newNode.id!);
    return true;
  },
};

export const AddNextSiblingNodeCommand: ICommand = {
  id: 'data-form.command.add-next-sibling-node',

  type: CommandType.COMMAND,

  handler: async (accessor, { node, tree }: IMenuCommandOperation) => {
    const dataSourceService = accessor.get(DataSourceService);
    const newNode = dataSourceService.addNode({ name: '', type: DataType.Text }, node.parent, node, 'after');
    tree?.edit(newNode.id!);
    return true;
  },
};

interface IEditCommandParams {
  node: IDataNode;
  newVal: string;
  tree: TreeApi<IDataNode>;
};

export const EditDoneCommand: ICommand = {
  id: 'data-form.command.edit-done',

  type: CommandType.COMMAND,

  handler: async (accessor, { node, newVal, tree }: IEditCommandParams) => {
    const dataSourceService = accessor.get(DataSourceService);
    const notificationService = accessor.get(INotificationService);

    if (!newVal) {
      notificationService.show({
        type: 'error',
        title: '提示',
        content: '字段名不能为空',
      });
      return false;
    }

    if (dataSourceService.isDuplicated(node, newVal)) {
      notificationService.show({
        type: 'error',
        title: '提示',
        content: '字段名不能重复',
      });
      return false;
    }

    // don't use tree.submit(node.id!, newVal)，will lost level 1 node
    node.name = newVal;
    tree.reset();
    return true;
  },
};

export const EditCancelCommand: ICommand = {
  id: 'data-form.command.edit-cancel',

  type: CommandType.COMMAND,

  handler: async (accessor, { node, tree }: IEditCommandParams) => {
    const dataSourceService = accessor.get(DataSourceService);
    if (!node.name) {
      dataSourceService.removeNode(node);
    } else {
      tree.reset();
    }
    return true;
  },
};

interface ISwitchNodeTypeCommandParams {
  node: IDataNode;
  tree: TreeApi<IDataNode>;
  newType: DataType;
};

export const SwitchNodeTypeCommand: ICommand = {
  id: 'data-form.command.switch-node-type',
  type: CommandType.COMMAND,

  handler: async (accessor, { node, newType }: ISwitchNodeTypeCommandParams) => {
    const dataSourceService = accessor.get(DataSourceService);
    dataSourceService.changeType(node, newType);

    return true;
  },
};

interface IMoveNodeCommandParams {
  parent: IDataNode<ReferenceDataType>;
  moveNodes: IDataNode[];
  index: number;
};

function getDuplicateNode(nodes: IDataNode[]) {
  if (nodes.length < 2) return false;

  for (let i = 0; i < nodes.length; i++) {
    const duplicateNode: IDataNode<DataType> | undefined = nodes.slice(i + 1).find((item) => item.name === nodes[i].name);
    if (duplicateNode) {
      return duplicateNode;
    }
  }

  return false;
}

export const MoveNodeCommand: ICommand = {
  id: 'data-form.command.move-node',
  type: CommandType.COMMAND,

  handler: async (accessor, { parent, moveNodes, index }: IMoveNodeCommandParams) => {
    const dataSourceService = accessor.get(DataSourceService);
    const notificationService = accessor.get(INotificationService);
    let duplicateNode = dataSourceService.getMoveDuplicate(moveNodes, parent);
    if (duplicateNode) {
      notificationService.show({
        type: 'error',
        title: '提示',
        content: `移动节点失败，存在同名节点 [${duplicateNode.name}]`,
      });
      return false;
    }

    duplicateNode = getDuplicateNode(moveNodes);

    if (duplicateNode) {
      notificationService.show({
        type: 'error',
        title: '提示',
        content: `移动节点失败，存在同名节点 [${duplicateNode.name}]`,
      });
      return false;
    }

    dataSourceService.moveNodes(moveNodes, index, parent);
    return true;
  },
};
