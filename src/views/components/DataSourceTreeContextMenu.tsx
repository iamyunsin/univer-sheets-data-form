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

import type { SyntheticEvent } from 'react';
import React from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Menu, MenuItem, MenuItemGroup, SubMenu } from '@univerjs/design';
import { MoreSingle } from '@univerjs/icons';
import { useTreeApi } from 'react-arborist/dist/module/context';
import type { TreeApi } from 'react-arborist';
import { Icon, IconType } from './Icon';

// import { DataSourceService } from '@/services/data-source.service';
import { EditDataOperation } from '@/commands/operations/data-source.operation';
import type { IDataNode } from '@/models/data-source.model';
import { DataType, isNamespace, isTable } from '@/models/data-source.model';
import {
  AddNextSiblingNodeCommand,
  AddPreviousSiblingNodeCommand,
  AddSubnodeCommand,
  RemoveDataNodeCommand,
  SwitchNodeTypeCommand,
} from '@/commands/commands/data-source.command';

const preventDefault = (event: Event | SyntheticEvent) => event?.preventDefault?.();

interface ITreeNodeMenu {
  key?: string;
  icon: React.ReactNode;
  label: string;
  children?: ITreeNodeMenu[];
  shortcut?: string;
  onClick?: (
    node: IDataNode,
    commandService: ICommandService,
    tree: TreeApi<IDataNode>,
  ) => void;
}

/** 所有节点通用的操作菜单 */
const switchTypeMenu: ITreeNodeMenu[] = [
  {
    icon: <Icon type={IconType.SwitchType} />,
    label: 'data-source-panel.operation.switchType',
    children: [
      {
        icon: <Icon type={IconType.Namespace} />,
        label: 'data-source-panel.type.namespace',
        onClick: (node: IDataNode, commandService, tree) => {
          commandService.executeCommand(SwitchNodeTypeCommand.id, {
            node,
            tree,
            newType: DataType.Namespace,
          });
        },
      },
      {
        icon: <Icon type={IconType.Table} />,
        label: 'data-source-panel.type.table',
        onClick: (node: IDataNode, commandService, tree) => {
          commandService.executeCommand(SwitchNodeTypeCommand.id, {
            node,
            tree,
            newType: DataType.Table,
          });
        },
      },
      {
        icon: <Icon type={IconType.Text} />,
        label: 'data-source-panel.type.text',
        onClick: (node: IDataNode, commandService, tree) => {
          commandService.executeCommand(SwitchNodeTypeCommand.id, {
            node,
            tree,
            newType: DataType.Text,
          });
        },
      },
      {
        icon: <Icon type={IconType.Number} />,
        label: 'data-source-panel.type.number',
        onClick: (node: IDataNode, commandService, tree) => {
          commandService.executeCommand(SwitchNodeTypeCommand.id, {
            node,
            tree,
            newType: DataType.Number,
          });
        },
      },
      {
        icon: <Icon type={IconType.Date} />,
        label: 'data-source-panel.type.date',
        onClick: (node: IDataNode, commandService, tree) => {
          commandService.executeCommand(SwitchNodeTypeCommand.id, {
            node,
            tree,
            newType: DataType.Date,
          });
        },
      },
    ],
  },
];

/** 修改节点自身的操作菜单 */
const multiSelfMenus: ITreeNodeMenu[] = [
  {
    key: EditDataOperation.id,
    icon: <Icon type={IconType.Edit} />,
    label: 'data-source-panel.operation.edit',
    shortcut: 'E',
  },
  {
    key: RemoveDataNodeCommand.id,
    icon: <Icon type={IconType.Remove} />,
    label: 'data-source-panel.operation.remove',
  },
];

/** 兄弟节点操作菜单 */
const siblingsOperationMenu: ITreeNodeMenu[] = [
  {
    key: AddPreviousSiblingNodeCommand.id,
    icon: <Icon type={IconType.Add} />,
    label: 'data-source-panel.operation.addPerviousSibling',
  },
  {
    key: AddNextSiblingNodeCommand.id,
    icon: <Icon type={IconType.Add} />,
    label: 'data-source-panel.operation.addNextSibling',
  },
];

/** 仅表格才有的菜单 */
const tableNodeMenus: ITreeNodeMenu[] = [
  {
    key: AddSubnodeCommand.id,
    icon: <Icon type={IconType.AddSubNode} />,
    label: 'data-source-panel.operation.addColumn',
  },
];

/** 仅命名空间才有的菜单 */
const namespaceNodeMenus: ITreeNodeMenu[] = [
  {
    key: AddSubnodeCommand.id,
    icon: <Icon type={IconType.AddSubNode} />,
    label: 'data-source-panel.operation.addField',
  },
];

export interface ITreeNodeContextMenuProps {
  data: IDataNode;
}

export function TreeNodeContextMenu(
  props: ITreeNodeContextMenuProps & { onMenuClick: () => void }
) {
  const { data } = props;
  const tree = useTreeApi<IDataNode>();

  const localeService = useDependency(LocaleService);
  const commandService = useDependency(ICommandService);
  // const dataSourceService = useDependency(DataSourceService);

  // table的列不能是表格和命名空间
  const currentSwitchTypeMenu = isTable(data.parent)
    ? [
      {
        ...switchTypeMenu[0],
        children: switchTypeMenu[0].children?.slice(2),
      },
    ]
    : [...switchTypeMenu];

  const currentTreeNodeMenuGroups = [
    [...multiSelfMenus],
    [
      ...(isTable(data) ? tableNodeMenus : isNamespace(data) ? namespaceNodeMenus : []),
      ...siblingsOperationMenu,
    ],
    currentSwitchTypeMenu,
  ];

  const handleMenuClick = (menu: ITreeNodeMenu) => {
    if (menu.onClick) {
      menu.onClick(data, commandService, tree);
    } else if (menu.key) {
      commandService.executeCommand(menu.key, { node: data, tree });
    }
    props.onMenuClick?.();
  };

  const renderMenuItem = (menu: ITreeNodeMenu, index: number) => {
    return (
      <MenuItem
        key={menu.key ? menu.key : index}
        onClick={() => handleMenuClick(menu)}
      >
        <span className="univer-menu-item-content">
          {menu.icon}
          <span>{localeService.t(menu.label)}</span>
        </span>
        {menu.shortcut && (<span className="univer-menu-item-shortcut">{menu.shortcut}</span>)}
      </MenuItem>
    );
  };

  return (
    <Menu className="data-form-menu" selectable={false} onContextMenu={preventDefault}>
      {currentTreeNodeMenuGroups.map((currentTreeNodeMenus, groupIndex) => {
        return (
          <MenuItemGroup key={groupIndex}>
            {currentTreeNodeMenus.map((menu, index) =>
              menu.children
                ?
                (
                  <SubMenu
                    key={index}
                    popupOffset={[18, 0]}
                    title={(
                      <span className="univer-menu-item-content">
                        {menu.icon}
                        <span>{localeService.t(menu.label)}</span>
                      </span>
                    )}
                    expandIcon={<MoreSingle className="univer-menu-item-more-icon" />}
                  >
                    {menu.children.map((child, childIndex) => (renderMenuItem(child, childIndex)))}
                  </SubMenu>
                )
                :
                renderMenuItem(menu, index)
            )}
          </MenuItemGroup>
        );
      })}
    </Menu>
  );
}
