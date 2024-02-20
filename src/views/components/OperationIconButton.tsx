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
import { Button, type IButtonProps, Tooltip } from '@univerjs/design';
import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IconType } from './Icon';
import { Icon } from './Icon';

export type OperationIconButtonProps = {
  iconType: IconType;
  title: string;
} & IButtonProps;

export function OperationIconButton(props: OperationIconButtonProps) {
  const { iconType, title, size = 'small', ...restProps } = props;
  const localeService = useDependency(LocaleService);

  const titleText = localeService.t(title);

  return (
    <Tooltip title={titleText}>
      <Button size={size} {...restProps}>
        <Icon type={iconType} />
      </Button>
    </Tooltip>

  );
}
