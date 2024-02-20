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

import { Disposable } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

export class DataSourcePanelService extends Disposable {
  private _open$ = new BehaviorSubject<boolean>(false);
  open$ = this._open$.pipe(distinctUntilChanged());
  subscription: Subscription;

  private _title = 'data-source-panel.title';

  constructor(@Inject(ISidebarService) private readonly sidebarService: ISidebarService) {
    super();
    this.subscription = this.sidebarService.sidebarOptions$.subscribe((options) => {
      if (options.header?.title === this._title && options.visible) {
        this._open$.next(true);
      } else if (this.isOpen) {
        this._open$.next(false);
      }
    });
  }

  get isOpen(): boolean {
    return this._open$.getValue();
  }

  override dispose(): void {
    super.dispose();
    this._open$.next(false);
    this._open$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.sidebarService.open({
      header: { title: 'data-source-panel.title' },
      children: { label: 'DataSourceSettingPanel' },
      width: 'max(20vw, 400px)',
    });
  }

  close(): void {
    this.sidebarService.close();
  }
}
