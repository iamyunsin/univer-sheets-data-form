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

import 'rc-tree/assets/index.less';
import type { SyntheticEvent } from 'react';
import React, { memo, useState } from 'react';
import type { TreeNodeProps } from 'rc-tree';
import Tree from 'rc-tree';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { Dropdown, Input, useObservable } from '@univerjs/design';
import { ICommandService } from '@univerjs/core';
import type { NodeDragEventParams } from 'rc-tree/lib/contextTypes';
import { DataSourceIcon } from './DataSourceIcon';
import { OperationIconButton } from './OperationIconButton';
import { IconType } from './Icon';
import styles from './index.module.less';
import { TreeNodeContextMenu } from './DataSourceTreeContextMenu';
import { DataType } from '@/models/data-source.model';
import type { DataDefinitionBase, IDataDefinition, IDataSourceNode } from '@/models/data-source.model';
import { DataSourceService } from '@/services/data-source.service';
import { AddSubnodeCommand, EditCancelCommand, EditDoneCommand } from '@/commands/commands/data-source.command';
import { DataSourceActionService } from '@/services/data-source-action.service';

const preventDefault = (event: Event | SyntheticEvent) => event?.preventDefault?.();

export function DataSourceTree() {
  const fieldNames = {
    children: 'children',
    title: 'key',
    key: 'pathString',
  };

  const dataSourceService = useDependency(DataSourceService);
  const dataSourceActionService = useDependency(DataSourceActionService);
  const commandService = useDependency(ICommandService);

  const dataNodes = useObservable(dataSourceService.dataNodes$, true);

  const addNode = (node: IDataSourceNode<DataType>) => {
    commandService.executeCommand(AddSubnodeCommand.id, node);
  };

  const titleRender = (node: IDataDefinition<DataType>) => {
    return <EditableTreeNode data={node} />;
  };

  const iconRender = (node: TreeNodeProps) => {
    const data = node.data as IDataDefinition<DataType>;
    return (<DataSourceIcon type={data.type} />);
  };

  const expandKeys = useObservable(dataSourceActionService.expandKeys$, true);
  const setExpandKeys = (keys: React.Key[]) => dataSourceActionService.setExpandKeys(keys);
  const selectedKeys = useObservable(dataSourceActionService.selectedKeys$, true);
  const setSelectedKeys = (keys: React.Key[]) => dataSourceActionService.setSelectedKeys(keys);

  const handleDragStart = ({ event, node }: NodeDragEventParams) => {
    const dataNode = node as unknown as { props: { data: DataDefinitionBase<DataType> } };
    // 命名空间是不能拖动的
    if (dataNode.props.data.isNamespace()) {
      event.preventDefault();
    }
  };

  return (
    <>
      <div className={styles.dataSourceOperationContainer}>
        <span>数据源</span>
        <OperationIconButton title="data-source-panel.operation.add" iconType={IconType.Add} onClick={() => addNode({ type: DataType.Date, key: '' })} />
      </div>
      <Tree
        rootClassName="data-form-tree"
        showLine
        defaultExpandAll
        // 展开收起
        onExpand={setExpandKeys}
        expandedKeys={expandKeys}
        // 选中
        onSelect={setSelectedKeys}
        selectedKeys={selectedKeys}
        // 右键菜单
        onContextMenu={preventDefault}
        multiple={false}
        draggable={!dataSourceService.isEditing()}
        onDragStart={handleDragStart}
        fieldNames={fieldNames}
        treeData={dataNodes}
        titleRender={titleRender}
        icon={iconRender}
      >
      </Tree>
    </>
  );
}

interface IEditableTreeNodeProps {
  data: IDataDefinition<DataType>;
}

const EditableTreeNode = memo((props: IEditableTreeNodeProps) => {
  const { data } = props;

  return (
    data.editing ? <EditingNode data={data} /> : <NormalNode data={data} />
  );
});

function EditingNode(props: IEditableTreeNodeProps) {
  const { data } = props;
  const [value, setValue] = useState(data.key);
  const commandService = useDependency(ICommandService);

  const handleOk = () => {
    commandService.executeCommand(EditDoneCommand.id, { node: data, newVal: value });
  };

  const handleCancel = () => {
    setValue(data.key);
    commandService.executeCommand(EditCancelCommand.id, data);
  };

  return (
    <span className="editing-node">
      <Input autoFocus size="mini" value={value} onChange={setValue} />
      <OperationIconButton title="data-source-panel.operation.ok" onClick={handleOk} type="primary" iconType={IconType.Ok} />
      <OperationIconButton title="data-source-panel.operation.cancel" onClick={handleCancel} iconType={IconType.Cancel} />
    </span>
  );
}

function NormalNode(props: IEditableTreeNodeProps) {
  const { data } = props;

  const [menuVisible, setMenuVisible] = useState(false);

  const hideMenu = () => {
    setMenuVisible(false);
  };

  return (
    <Dropdown
      className="data-form-menu-dropdown"
      visible={menuVisible}
      trigger={['contextMenu']}
      overlay={(
        <TreeNodeContextMenu data={data} onMenuClick={hideMenu} />
      )}
      onVisibleChange={setMenuVisible}
    >
      <span>{data.key}</span>
    </Dropdown>
  );
}
