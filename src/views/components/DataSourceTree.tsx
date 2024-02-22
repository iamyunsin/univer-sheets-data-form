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
import React, { useEffect, useRef, useState } from 'react';

import { Tree } from 'react-arborist';
import type { DragPreviewProps, NodeRendererProps } from 'react-arborist';
import { DefaultContainer } from 'react-arborist/dist/module/components/default-container';
import { useTreeApi } from 'react-arborist/dist/module/context';
import type { DragDropManager } from 'dnd-core';
import { createDragDropManager } from 'dnd-core';
import { useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useDependency } from '@wendellhu/redi/react-bindings';
import { Dropdown, Input, useObservable } from '@univerjs/design';
import { ICommandService } from '@univerjs/core';
import { DataSourceIcon } from './DataSourceIcon';
import { OperationIconButton } from './OperationIconButton';
import { Icon, IconType } from './Icon';
import styles from './index.module.less';
import { TreeNodeContextMenu } from './DataSourceTreeContextMenu';
import { DataType } from '@/models/data-source.model';
import type { IDataDefinition, IDataSourceNode } from '@/models/data-source.model';
import { DataSourceService } from '@/services/data-source.service';
import { DataSourceActionService } from '@/services/data-source-action.service';
import { AddSubnodeCommand, EditCancelCommand, EditDoneCommand } from '@/commands/commands/data-source.command';

interface ITreeNodeProps {
  onSetHeight: (height: number) => void;
}

function TreeContainer(props: ITreeNodeProps) {
  const tree = useTreeApi<IDataDefinition<DataType>>();
  const actionService = useDependency<DataSourceActionService>(DataSourceActionService);
  actionService.setTree(tree);

  const [_, drop] = useDrop(() => ({
    accept: 'NODE',
    canDrop: () => {
      return true;
    },
    hover: () => {
    },
    drop: () => {
    },
  }), [tree]);

  const tagDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tagDiv.current || !tagDiv.current.parentElement) return;
    const containerEl = tagDiv.current.closest('.univer-app-container-wrapper')!;
    const sheetEl = containerEl.firstElementChild;
    drop(sheetEl);
    props.onSetHeight(tagDiv.current.offsetHeight);
    new ResizeObserver(() => {
      tagDiv.current && props.onSetHeight(tagDiv.current.offsetHeight);
    }).observe(tagDiv.current);
  });

  return (
    <>
      <div ref={tagDiv} style={{ position: 'absolute', top: 0, bottom: 0, zIndex: -1, visibility: 'hidden' }}></div>
      <DefaultContainer />
    </>
  );
}

function DragPreview(props: DragPreviewProps) {
  const { x = 0, y = 0 } = props.offset || {};
  const previewRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 10,
    color: 'red',
  });

  useEffect(() => {
    const container = previewRef.current!.closest('.univer-sidebar')!;
    const containerRect = container.getBoundingClientRect();
    const newStyle = {
      ...style,
      transform: `translate3d(${x - containerRect.x}px, ${y - containerRect.y}px, 0)`,
      display: x === 0 && y === 0 ? 'none' : 'block',
    };
    setStyle(newStyle);
  }, [x, y]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={previewRef} style={style}>好好的</div>;
}

export function DataSourceTree() {
  const dndManager: DragDropManager = createDragDropManager(HTML5Backend);
  const dataSourceService = useDependency(DataSourceService);
  const commandService = useDependency(ICommandService);

  const dataNodes = useObservable(dataSourceService.dataNodes$, true);

  const addNode = (node: IDataSourceNode<DataType>) => {
    commandService.executeCommand(AddSubnodeCommand.id, node);
  };

  const [height, setHeight] = useState(500);

  return (
    <div className={styles.dataSourceTreeContainer}>
      <div className={styles.dataSourceOperationContainer}>
        <span>数据源</span>
        <OperationIconButton title="data-source-panel.operation.add" iconType={IconType.Add} onClick={() => addNode({ type: DataType.Date, key: '' })} />
      </div>
      <div className={styles.dataSourceTreeWrapper}>
        <Tree
          className={styles.dataSourceTree}
            // data={dataNodes}
          initialData={dataNodes}
          width="auto"
          height={height}
          indent={24}
          rowHeight={36}
          paddingTop={10}
          paddingBottom={10}
          disableEdit
          renderDragPreview={DragPreview}
          dndManager={dndManager}
          renderContainer={() => <TreeContainer onSetHeight={setHeight} />}
        >
          {EditableTreeNode}
        </Tree>
      </div>
    </div>
  );
}

interface IEditableTreeNodeProps {
  data: IDataDefinition<DataType>;
}

function EditableTreeNode(props: NodeRendererProps<IDataDefinition<DataType>>) {
  const { node, style, dragHandle } = props;
  const { data } = node;

  const openClose = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    node.toggle();
  };

  return (
    <div className={`${styles.editableNode} ${node.isSelected ? styles.editableNodeSelected : ''}`} style={style} ref={dragHandle}>
      { !node.isLeaf && (
        <i className={styles.editableNodeOpenClose} onClick={openClose}>
          {node.isOpen ? <Icon type={IconType.Expand} /> : <Icon type={IconType.Collapse} />}
        </i>
      )}
      <div className={styles.editableNodeTitle}>
        <DataSourceIcon type={data.type} />
        {node.isEditing ? <EditingNode data={data} /> : <NormalNode data={data} />}
      </div>
    </div>
  );
};

function EditingNode(props: IEditableTreeNodeProps) {
  const { data } = props;
  const [value, setValue] = useState(data.key);
  const commandService = useDependency(ICommandService);

  const handleOk = (event: SyntheticEvent) => {
    event.stopPropagation();
    commandService.executeCommand(EditDoneCommand.id, { node: data, newVal: value });
  };

  const handleCancel = (event: SyntheticEvent) => {
    event.stopPropagation();
    setValue(data.key);
    commandService.executeCommand(EditCancelCommand.id, data);
  };

  return (
    <span className={styles.editingNode}>
      <Input autoFocus size="mini" value={value} onChange={setValue} onClick={(event) => event.stopPropagation()} />
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
