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

import { UniverInstanceType } from '@univerjs/core';
import type { IMenuButtonItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { ToggleDataSourcePanelOperation } from '@/commands/operations/data-source.operation';

export function DataFormMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
  return {
    id: ToggleDataSourcePanelOperation.id,
    icon: 'DataFormMenuIcon',
    tooltip: 'data-form-menu.tooltip',
    group: MenuGroup.TOOLBAR_FORMULAS_VIEW,
    type: MenuItemType.BUTTON,
    positions: [MenuPosition.TOOLBAR_START],
    hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
  };
}
