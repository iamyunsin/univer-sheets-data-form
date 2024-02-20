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
import { DataType } from '@/models/data-source.model';
import type { IDataDefinition } from '@/models/data-source.model';
import { DataSourceService } from '@/services/data-source.service';

export const RemoveDataNodeCommand: ICommand = {
  id: 'data-form.command.remove-data-node',

  type: CommandType.COMMAND,

  handler: async (accessor, node: IDataDefinition<DataType>) => {
    const dataSourceService = accessor.get(DataSourceService);
    dataSourceService.removeNode(node);
    return true;
  },
};

export const AddSubnodeCommand: ICommand = {
  id: 'data-form.command.add-subnode',

  type: CommandType.COMMAND,

  handler: async (accessor, node: IDataDefinition<DataType>) => {
    const dataSourceService = accessor.get(DataSourceService);
    dataSourceService.addNode({ key: '', type: DataType.Text }, node);
    return true;
  },
};

export const AddPreviousSiblingNodeCommand: ICommand = {
  id: 'data-form.command.add-previous-sibling-node',

  type: CommandType.COMMAND,

  handler: async (accessor, node: IDataDefinition<DataType>) => {
    const dataSourceService = accessor.get(DataSourceService);
    dataSourceService.addNode({ key: '', type: DataType.Text }, node.parent, node, 'before');
    return true;
  },
};

export const AddNextSiblingNodeCommand: ICommand = {
  id: 'data-form.command.add-next-sibling-node',

  type: CommandType.COMMAND,

  handler: async (accessor, node: IDataDefinition<DataType>) => {
    const dataSourceService = accessor.get(DataSourceService);
    dataSourceService.addNode({ key: '', type: DataType.Text }, node.parent, node, 'after');
    return true;
  },
};

interface IEditDoneCommandParams {
  node: IDataDefinition<DataType>;
  newVal: string;
};

export const EditDoneCommand: ICommand = {
  id: 'data-form.command.edit-done',

  type: CommandType.COMMAND,

  handler: async (accessor, { node, newVal }: IEditDoneCommandParams) => {
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
    node.key = newVal;
    dataSourceService.changeToNormal(node);
    return true;
  },
};

export const EditCancelCommand: ICommand = {
  id: 'data-form.command.edit-cancel',

  type: CommandType.COMMAND,

  handler: async (accessor, node: IDataDefinition<DataType>) => {
    const dataSourceService = accessor.get(DataSourceService);
    dataSourceService.changeToNormal(node);
    if (!node.key) {
      dataSourceService.removeNode(node);
    }
    return true;
  },
};

interface ISwitchNodeTypeCommandParams {
  node: IDataDefinition<DataType>;
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
