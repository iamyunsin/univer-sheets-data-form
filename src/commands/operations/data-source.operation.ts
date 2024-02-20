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

import type { IOperation } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { CommandType } from '@univerjs/core';
import { DataSourcePanelService } from '@/services/data-source-panel.service';
import type { DataType, IDataDefinition } from '@/models/data-source.model';
import { DataSourceService } from '@/services/data-source.service';

export const ToggleDataSourcePanelOperation: IOperation = {
  type: CommandType.OPERATION,
  id: 'data-form.operation.toggle-data-source-panel',
  handler: (accessor: IAccessor) => {
    accessor.get(DataSourcePanelService).toggle();
    return true;
  },
};

export const EditDataOperation: IOperation = {
  type: CommandType.OPERATION,
  id: 'data-form.operation.edit-data',
  handler: (accessor: IAccessor, node: IDataDefinition<DataType>) => {
    accessor.get(DataSourceService).changeToEditing(node);
    return true;
  },
};
