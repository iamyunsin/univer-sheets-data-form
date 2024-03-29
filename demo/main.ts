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

import './style.css';

import '@univerjs/design/lib/index.css';
import '@univerjs/ui/lib/index.css';
import '@univerjs/sheets-ui/lib/index.css';
import '@univerjs/sheets-formula/lib/index.css';

import { LogLevel, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverSheetsDataFormPlugin } from '../src';
import { DataType } from '@/models/data-source.model';

const univer = new Univer({
  theme: defaultTheme,
  logLevel: LogLevel.VERBOSE,
});

// core plugins
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverFormulaEnginePlugin, {
  notExecuteFormula: true,
});
univer.registerPlugin(UniverUIPlugin, {
  container: 'app',
  header: true,
  toolbar: true,
  footer: true,
});

// doc plugins
univer.registerPlugin(UniverDocsPlugin, {
  hasScroll: false,
});

// sheet plugins
univer.registerPlugin(UniverSheetsPlugin, {
  notExecuteFormula: true,
});
univer.registerPlugin(UniverSheetsUIPlugin);
univer.registerPlugin(UniverSheetsFormulaPlugin);

univer.registerPlugin(UniverSheetsDataFormPlugin, {
  dataSource: [
    {
      name: 'table',
      type: DataType.Table,
      children: [
        {
          name: 'col0',
          type: DataType.Text,
        },
        {
          name: 'col1',
          type: DataType.Number,
        },
        {
          name: 'col2',
          type: DataType.Date,
        },
      ],
    },
    {
      name: 'text',
      type: DataType.Text,
    },
    {
      name: 'namespace',
      type: DataType.Namespace,
      children: [
        {
          name: 'field0',
          type: DataType.Text,
        },
        {
          name: 'field1',
          type: DataType.Number,
        },
        {
          name: 'field2',
          type: DataType.Date,
        },
        {
          name: 'field3',
          type: DataType.Table,
          children: [
            {
              name: 'field0',
              type: DataType.Text,
            },
            {
              name: 'field1',
              type: DataType.Number,
            },
            {
              name: 'field2',
              type: DataType.Date,
            },
          ],
        },
        {
          name: 'field4',
          type: DataType.Namespace,
          children: [
            {
              name: 'field0',
              type: DataType.Text,
            },
            {
              name: 'field1',
              type: DataType.Number,
            },
            {
              name: 'field2',
              type: DataType.Date,
            },
          ],
        },
      ],
    },
  ],
});

univer.createUniverSheet({});
