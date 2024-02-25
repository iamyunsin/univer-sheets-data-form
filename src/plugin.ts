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

import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { type Dependency, Inject, Injector } from '@wendellhu/redi';
import * as locale from './locale';
import { DATA_FORM_PLUGIN_NAME } from './common/plugin-name';
import type { DataType, IDataNode } from './models/data-source.model';
import { DataSourceController } from './controllers/data-source.controller';
import { DataSourcePanelService } from './services/data-source-panel.service';
import { DataSourceService } from './services/data-source.service';

export interface IDataFormPluginConfig {
  dataSource: IDataNode<DataType>[];
}

export class UniverSheetsDataFormPlugin extends Plugin {
  static override type = PluginType.Sheet;

  constructor(
    private _config: Partial<IDataFormPluginConfig>,
    @Inject(Injector) protected readonly _injector: Injector,
    @Inject(LocaleService) private readonly _localeService: LocaleService
  ) {
    super(DATA_FORM_PLUGIN_NAME);
  }

  override onStarting(injector: Injector): void {
    const dependencies: Dependency[] = [
      // controllers
      [DataSourceController],

      // services
      [DataSourcePanelService],
      [DataSourceService, { useFactory: () => injector.createInstance(DataSourceService, this._config.dataSource) }],
    ];

    dependencies.forEach((d) => injector.add(d));
    this._localeService.load(locale);
  }
}
