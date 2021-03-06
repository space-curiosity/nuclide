'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ContextViewConfig, ContextProvider} from './ContextViewManager';
import type {DefinitionService} from '../../nuclide-definition-service';

import {ContextViewManager} from './ContextViewManager';
import {Disposable} from 'atom';
import invariant from 'assert';

const INITIAL_PANEL_WIDTH: number = 300;
const INITIAL_PANEL_VISIBILITY: boolean = false;

let currentService: ?DefinitionService = null;
let manager: ?ContextViewManager = null;

export function activate(state: ContextViewConfig = {}): void {
  if (manager === null) {
    manager = new ContextViewManager(
      state.width || INITIAL_PANEL_WIDTH,
      state.visible || INITIAL_PANEL_VISIBILITY,
    );
  }
}

export function deactivate(): void {
  if (manager != null) {
    manager.dispose();
    manager = null;
  }
}

export function serialize(): ?ContextViewConfig {
  if (manager != null) {
    return manager.serialize();
  }
}

function updateService(): void {
  if (manager != null) {
    manager.consumeDefinitionService(currentService);
  }
}

/**
 * This is the context view service that other Nuclide packages consume when they
 * want to provide context for a definition. A context provider must consume the
 * nuclide-context-view service and register themselves as a provider.
 */
const Service = {
  registerProvider(provider: ContextProvider): boolean {
    if (manager != null && provider != null) {
      return manager.registerProvider(provider);
    } else {
      return false;
    }
  },
  deregisterProvider(providerId: string): boolean {
    if (manager != null && providerId != null) {
      return manager.deregisterProvider(providerId);
    } else {
      return false;
    }
  },
};

export function consumeDefinitionService(service: DefinitionService): IDisposable {
  invariant(currentService == null);
  currentService = service;
  updateService();
  return new Disposable(() => {
    invariant(currentService === service);
    currentService = null;
    updateService();
  });
}

export type NuclideContextView = typeof Service;

export function provideNuclideContextView(): NuclideContextView {
  return Service;
}
