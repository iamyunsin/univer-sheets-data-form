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

import React, { useEffect, useRef } from 'react';
import { DefaultContainer } from 'react-arborist/dist/module/components/default-container';
import { useTreeApi } from 'react-arborist/dist/module/context';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { useDependency, useInjector } from '@wendellhu/redi/react-bindings';
import { ICommandService, ILogService, IUniverInstanceService } from '@univerjs/core';
import { ISelectionRenderService } from '@univerjs/sheets-ui';
import { DeviceType } from '@univerjs/engine-render';
import { FRange } from '@univerjs/facade';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import { SetSelectionsOperation } from '@univerjs/sheets';
import type { IDataNode } from '@/models/data-source.model';
import { DATA_FORM_PLUGIN_NAME } from '@/common/plugin-name';

export type TreeContainerReadyHandler = (options: {
  height: number;
  width: number;
  x: number;
  y: number;
}) => void;

export interface ITreeContainerProps {
  onReady: TreeContainerReadyHandler;
}

export function TreeContainer(props: ITreeContainerProps) {
  const tree = useTreeApi<IDataNode>();
  const logService = useDependency(ILogService);
  const selectionRenderService = useDependency(ISelectionRenderService);
  const injector = useInjector();
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

      selectionRenderService.endSelection();

      const univerInstanceService = injector.get(IUniverInstanceService);
      const workbook = univerInstanceService.getCurrentUniverSheetInstance();
      const worksheet = workbook.getActiveSheet();
      const activeRange = selectionRenderService.getActiveRange()!;

      injector.get(ICommandService).executeCommand<ISetSelectionsOperationParams>(SetSelectionsOperation.id, {
        unitId: workbook.getUnitId(),
        subUnitId: worksheet.getSheetId(),
        pluginName: DATA_FORM_PLUGIN_NAME,
        selections: [{
          range: {
            ...activeRange,
            endColumn: activeRange.endColumn + 2,
            endRow: activeRange.startRow + 2,
          },
          primary: null,
          style: null,
        }],
      });
    },
    drop: () => {
      selectionRenderService.endSelection();
      const activeRange = selectionRenderService.getActiveRange()!;
      const univerInstanceService = injector.get(IUniverInstanceService);
      const workbook = univerInstanceService.getCurrentUniverSheetInstance();
      const worksheet = workbook.getActiveSheet();
      const tableHeaderRange = injector.createInstance(FRange, workbook, worksheet, {
        ...activeRange,
        endRow: activeRange.startRow,
      });
      tableHeaderRange.setBackgroundColor('#0000FF');
      tableHeaderRange.setFontColor('#FFFFFF');
      tableHeaderRange.setFontWeight('bold');
      tableHeaderRange.setValues([['ABC', 'BCD', 'CDA']]);
      activeRange.endRow += 2;
      const tableRange = injector.createInstance(FRange, workbook, worksheet, {
        ...activeRange,
      });
      tableRange.getCellStyleData();
    },
  }), [tree]);

  const notifyContainerChange = () => {
    if (!tagDiv.current) return;
    const rect = tagDiv.current.getBoundingClientRect();
    props.onReady({
      height: rect.height,
      width: rect.width,
      x: rect.left || rect.x,
      y: rect.top || rect.y,
    });
  };

  const observer = useRef(new ResizeObserver(notifyContainerChange));

  useEffect(() => {
    const tagDivEl = tagDiv.current;
    const observerInstance = observer.current;

    if (!tagDivEl || !tagDivEl.parentElement) return;
    const containerEl = tagDiv.current.closest('.univer-app-container-wrapper')!;
    const sheetEl = containerEl.firstElementChild;
    drop(sheetEl);
    notifyContainerChange();
    observerInstance.observe(tagDivEl);
    return () => {
      observerInstance.unobserve(tagDivEl);
    };
  });

  return (
    <>
      <div ref={tagDiv} style={{ position: 'absolute', top: 0, bottom: 0, zIndex: -1, visibility: 'hidden' }}></div>
      <DefaultContainer />
    </>
  );
};
