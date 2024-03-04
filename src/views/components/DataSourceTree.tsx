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

import type { CSSProperties, SyntheticEvent } from 'react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Tree } from 'react-arborist';
import type { DragPreviewProps, MoveHandler, NodeApi, NodeRendererProps, TreeApi } from 'react-arborist';
import { useTreeApi } from 'react-arborist/dist/module/context';
import { createDragDropManager } from 'dnd-core';
import type { DragDropManager, XYCoord } from 'dnd-core';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useDependency } from '@wendellhu/redi/react-bindings';
import { Dropdown, Input } from '@univerjs/design';
import { ICommandService } from '@univerjs/core';
import type { TreeProps } from 'react-arborist/dist/module/types/tree-props';
import { DataSourceIcon } from './DataSourceIcon';
import { OperationIconButton } from './OperationIconButton';
import { Icon, IconType } from './Icon';
import styles from './index.module.less';
import { TreeNodeContextMenu } from './DataSourceTreeContextMenu';
import type { TreeContainerReadyHandler } from './DataSourceTreeContainer';
import { TreeContainer } from './DataSourceTreeContainer';
import type { DataType, IDataNode } from '@/models/data-source.model';
import { DataSourceService } from '@/services/data-source.service';
import { AddSubnodeCommand, EditCancelCommand, EditDoneCommand, MoveNodeCommand } from '@/commands/commands/data-source.command';

function DragPreview(props: DragPreviewProps) {
  const { x = 0, y = 0 } = props.offset || {};
  const previewRef = useRef<HTMLDivElement>(null);
  const tree = useTreeApi<IDataNode>();
  const nodes = tree.selectedNodes.some((node) => node.id === props.id) ? [...tree.selectedNodes] : [tree.get(props.id)!];

  if (!nodes[0]) {
    nodes.shift();
  }

  const [style, setStyle] = useState<React.CSSProperties>({
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

  return (
    <div className={styles.dragPreview} ref={previewRef} style={style}>
      {nodes.map((node: NodeApi<IDataNode<DataType>>) => (
        <div className={styles.dragPreviewItem} key={node.id}>
          <DataSourceIcon type={node.data.type} />
          <span className={styles.dragPreviewItemTitle}>{node.data.name}</span>
        </div>
      ))}
    </div>
  );
}

export function DataSourceTree() {
  const dndManager: DragDropManager = createDragDropManager(HTML5Backend, undefined, undefined, true);
  const dataSourceService = useDependency(DataSourceService);
  const commandService = useDependency(ICommandService);
  const tree = useRef<TreeApi<IDataNode>>(null);

  const dataNodes = dataSourceService.dataNodes$.getValue();

  const moveNodeHandler: MoveHandler<IDataNode> = (options) => {
    commandService.executeCommand(MoveNodeCommand.id, {
      parent: options.parentNode && options.parentNode.data,
      moveNodes: options.dragNodes.map((node) => node.data),
      index: options.index,
    });
  };

  const containerInfo = useRef({
    x: 0,
    y: 0,
    with: 0,
    height: 800,
  });

  const onTreeContainerReady: TreeContainerReadyHandler = useCallback(({
    x,
    height,
  }) => {
    containerInfo.current.x = x;
    if (height !== containerInfo.current.height) {
      containerInfo.current.height = height;
      updateTree();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderContainer = () => <TreeContainer onReady={onTreeContainerReady} />;

  const dndOffset: XYCoord = {
    x: 0,
    y: 0,
  };

  // monitor drag pointer
  dndManager.getMonitor().subscribeToOffsetChange(() => {
    const _dndOffset = dndManager.getMonitor().getClientOffset();
    if (!_dndOffset || (_dndOffset.x === 0 && _dndOffset.y === 0)) return;
    Object.assign(dndOffset, _dndOffset);
  });

  const treeProps: TreeProps<IDataNode> = {
    className: styles.dataSourceTree,
    disableDrop() {
      // drag into worksheet and disable drop into tree
      return dndOffset.x < containerInfo.current.x - 20;
    },
    onMove: moveNodeHandler,
    openByDefault: false,
    height: containerInfo.current.height,
    data: dataNodes,
    width: 'auto',
    indent: 24,
    rowHeight: 30,
    paddingTop: 10,
    paddingBottom: 10,
    disableEdit: true,
    renderDragPreview: DragPreview,
    dndManager,
    renderContainer,
    children: EditableTreeNode,
  };

  const updateTree = () => {
    if (!tree.current) return;
    const newProps = {
      ...treeProps,
      height: containerInfo.current.height,
      data: dataSourceService.dataNodes$.getValue(),
    };
    tree.current.update(newProps);
  };

  dataSourceService.dataNodes$.subscribe(updateTree);

  const addNode = () => {
    commandService.executeCommand(AddSubnodeCommand.id, { tree: tree?.current });
  };

  return (
    <div className={styles.dataSourceTreeContainer}>
      <div className={styles.dataSourceOperationContainer}>
        <span>数据源</span>
        <OperationIconButton title="data-source-panel.operation.add" iconType={IconType.Add} onClick={() => addNode()} />
      </div>
      <div className={styles.dataSourceTreeWrapper}>
        <Tree
          ref={tree}
          {...treeProps}
        >
        </Tree>
      </div>
    </div>
  );
}

interface IEditableNodeProps {
  data: IDataNode;
  isSelected: boolean;
  isOpen: boolean;
  isEditing: boolean;
  isLeaf: boolean;
  style: CSSProperties;
  dragHandle?: (el: HTMLDivElement) => void;
  toggle: () => void;
}

const EditableNode = memo(function EditableNode(props: IEditableNodeProps) {
  const { data, isSelected, isOpen, isEditing, isLeaf, style, dragHandle, toggle } = props;

  const openClose = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggle();
  };

  return (
    <div className={`${styles.editableNode} ${isSelected ? styles.editableNodeSelected : ''}`} style={style} ref={dragHandle}>
      { !isLeaf && (
        <i className={styles.editableNodeOpenClose} onClick={openClose}>
          {isOpen ? <Icon type={IconType.Expand} /> : <Icon type={IconType.Collapse} />}
        </i>
      )}
      <div className={styles.editableNodeTitle}>
        <DataSourceIcon type={data.type} />
        {isEditing ? <EditingNode data={data} /> : <NormalNode data={data} />}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.data.name === nextProps.data.name
    && prevProps.isSelected === nextProps.isSelected
    && prevProps.isOpen === nextProps.isOpen
    && prevProps.isEditing === nextProps.isEditing
    && prevProps.isLeaf === nextProps.isLeaf
    && prevProps.style.paddingLeft === nextProps.style.paddingLeft
  );
});

interface IEditableTreeNodeProps {
  data: IDataNode;
}

function EditableTreeNode(props: NodeRendererProps<IDataNode>) {
  const { node, style, dragHandle } = props;
  const { data } = node;

  const openClose = () => {
    node.toggle();
  };

  return (
    <EditableNode
      data={data}
      isEditing={node.isEditing}
      isSelected={node.isSelected}
      isLeaf={node.isLeaf}
      isOpen={node.isOpen}
      style={style}
      dragHandle={dragHandle}
      toggle={openClose}
    />
  );
};

function EditingNode(props: IEditableTreeNodeProps) {
  const { data } = props;
  const [value, setValue] = useState(data.name);
  const commandService = useDependency(ICommandService);
  const tree = useTreeApi();

  const handleOk = (event: SyntheticEvent) => {
    event.stopPropagation();
    commandService.executeCommand(EditDoneCommand.id, { node: data, newVal: value, tree });
  };

  const handleCancel = (event: SyntheticEvent) => {
    event.stopPropagation();
    commandService.executeCommand(EditCancelCommand.id, { node: data, newVal: value, tree });
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
      <span>{data.name}</span>
    </Dropdown>
  );
}
