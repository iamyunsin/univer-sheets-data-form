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

import React from 'react';
import { Tooltip } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { LocaleService } from '@univerjs/core';
import { Icon, IconType } from './Icon';
import { DataType } from '@/models/data-source.model';

export interface IDataSourceIconProps {
  type: DataType;
}

const icons = {
  [DataType.Namespace]: <Icon type={IconType.Namespace} />,
  [DataType.Table]: <Icon type={IconType.Table} />,
  [DataType.Text]: <Icon type={IconType.Text} />,
  [DataType.Date]: <Icon type={IconType.Date} />,
  [DataType.Number]: <Icon type={IconType.Number} />,
};

const tooltips = {
  [DataType.Table]: 'table',
  [DataType.Namespace]: 'namespace',
  [DataType.Text]: 'text',
  [DataType.Number]: 'number',
  [DataType.Date]: 'date',
};

export function DataSourceIcon(props: IDataSourceIconProps) {
  const localeService = useDependency(LocaleService);

  return <Tooltip title={localeService.t(`data-source-panel.type.${tooltips[props.type]}`)}>{icons[props.type]}</Tooltip>;
}
