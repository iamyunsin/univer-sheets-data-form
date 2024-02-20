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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { EditDataOperation, ToggleDataSourcePanelOperation } from '../commands/operations/data-source.operation';
import { DataFormMenuItemFactory } from './data-form.menu';
import { DataSourceSettingPanel, DataSourceSettingPanelName } from '@/views/components/DataSourceSettingsPanel';
import { MenuIcon } from '@/views/components/MenuIcon';
import { AddNextSiblingNodeCommand, AddPreviousSiblingNodeCommand, AddSubnodeCommand, EditCancelCommand, EditDoneCommand, RemoveDataNodeCommand, SwitchNodeTypeCommand } from '@/commands/commands/data-source.command';

@OnLifecycle(LifecycleStages.Steady, DataSourceController)
export class DataSourceController extends Disposable {
  constructor(
    @Inject(Injector) private readonly _injector: Injector,
    @IMenuService menuService: IMenuService,
    @ICommandService commandService: ICommandService,
    @Inject(ComponentManager) componentManager: ComponentManager
  ) {
    super();

    this.disposeWithMe(menuService.addMenuItem(this._injector.invoke(DataFormMenuItemFactory)));
    this.disposeWithMe(componentManager.register(DataSourceSettingPanelName, DataSourceSettingPanel));
    this.disposeWithMe(componentManager.register('DataFormMenuIcon', MenuIcon));
    this.disposeWithMe(commandService.registerCommand(ToggleDataSourcePanelOperation));
    this.disposeWithMe(commandService.registerCommand(EditDataOperation));
    this.disposeWithMe(commandService.registerCommand(RemoveDataNodeCommand));
    this.disposeWithMe(commandService.registerCommand(AddSubnodeCommand));
    this.disposeWithMe(commandService.registerCommand(EditDoneCommand));
    this.disposeWithMe(commandService.registerCommand(EditCancelCommand));
    this.disposeWithMe(commandService.registerCommand(AddPreviousSiblingNodeCommand));
    this.disposeWithMe(commandService.registerCommand(AddNextSiblingNodeCommand));
    this.disposeWithMe(commandService.registerCommand(SwitchNodeTypeCommand));
  }
}
