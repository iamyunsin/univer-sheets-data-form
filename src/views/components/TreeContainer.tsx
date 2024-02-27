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

import React, { memo, useEffect, useRef } from 'react';
import { DefaultContainer } from 'react-arborist/dist/module/components/default-container';
import { useTreeApi } from 'react-arborist/dist/module/context';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { ILogService } from '@univerjs/core';
import { ISelectionRenderService } from '@univerjs/sheets-ui';
import { DeviceType } from '@univerjs/engine-render';
import type { ITreeContainerProps } from './DataSourceTreeContainer';
import type { IDataNode } from '@/models/data-source.model';

export const TreeContainer = memo(function TreeContainer(props: ITreeContainerProps) {
  const tree = useTreeApi<IDataNode>();
  const logService = useDependency(ILogService);
  const selectionRenderService = useDependency(ISelectionRenderService);
  const tagDiv = useRef<HTMLDivElement>(null);
  const getDropNodes = (iNode: IDataNode) => tree.selectedNodes.some((node) => node.id === iNode.id) ? tree.selectedNodes : [tree.get(iNode.id!)!];

  const [_, drop] = useDrop<IDataNode, unknown, unknown>(() => ({
    accept: 'NODE',
    canDrop: (item: IDataNode) => {
      const nodes = getDropNodes(item);
      logService.debug('canDrop: ', item, nodes);
      return true;
    },
    hover: (_: IDataNode, monitor: DropTargetMonitor) => {
      const clientOffset = monitor.getClientOffset()!;
      const canvasContainer = tagDiv.current?.closest('.univer-app-container-wrapper')?.querySelector('.univer-app-container-canvas')?.getBoundingClientRect();

      const offsetX = clientOffset.x + (canvasContainer?.left || 0);
      const offsetY = clientOffset.y - (canvasContainer?.top || 0);

      const mouseEvent = new MouseEvent('mousedown');

      const viewport = selectionRenderService.getViewPort();
      logService.debug('hover: ', viewport.left, viewport.top);
      selectionRenderService.eventTrigger({
        ...mouseEvent,
        deviceType: DeviceType.Mouse,
        inputIndex: 0,
        offsetX,
        offsetY,
        previousState: undefined,
        currentState: undefined,
      });

      const activeRange = selectionRenderService.getActiveRange();
      selectionRenderService.convertRangeDataToSelection(activeRange!);
    },
    drop: () => {
      selectionRenderService.endSelection();
    },
  }), [tree]);

  useEffect(() => {
    if (!tagDiv.current || !tagDiv.current.parentElement) return;
    const containerEl = tagDiv.current.closest('.univer-app-container-wrapper')!;
    const sheetEl = containerEl.firstElementChild;
    drop(sheetEl);

    props.onReady({
      height: tagDiv.current.offsetHeight,
      width: tagDiv.current.offsetWidth,
      x: tagDiv.current.offsetLeft,
      y: tagDiv.current.offsetTop,
    });
    new ResizeObserver(() => {
      if (!tagDiv.current) return;
      const rect = tagDiv.current!.getBoundingClientRect();
      props.onReady({
        height: rect.height,
        width: rect.width,
        x: rect.left || rect.x,
        y: rect.top || rect.y,
      });
    }).observe(tagDiv.current);
  });

  return (
    <>
      <div ref={tagDiv} style={{ position: 'absolute', top: 0, bottom: 0, zIndex: -1, visibility: 'hidden' }}></div>
      <DefaultContainer />
    </>
  );
});
