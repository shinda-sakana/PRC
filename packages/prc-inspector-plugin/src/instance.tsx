import React from 'react';
import { PerformanceScope, Profiler } from './profiler';
import { EventLogger } from './eventLogger';
import { BaseFoundation } from '@shinda-sakana/pluggable-react-component';
import { getDataSwap } from './swap';
import { INSTANCE_KEY } from './const';

export function setGlobalInstance(instance: InspectorInstance) {
  const instances = Reflect.get(window, INSTANCE_KEY) || new Set();
  instances.add(instance);
  Reflect.set(window, INSTANCE_KEY, instances);
}

export function removeGlobalInstance(instance: InspectorInstance) {
  const instances = Reflect.get(window, INSTANCE_KEY);
  if (!(instances instanceof Set)) {
    return;
  }
  instances.delete(instance);
  if (instances.size <= 0) {
    Reflect.set(window, INSTANCE_KEY, void 0);
  }
}

export class InspectorInstance {
  private performanceScope: PerformanceScope;
  private updateHandler = new Set<() => void>();
  readonly logger: EventLogger;
  readonly foundation: BaseFoundation;
  constructor(f: BaseFoundation) {
    this.foundation = f;
    const logger = new EventLogger();
    this.logger = logger;
    f.listenAnyEvents((event, payloads, retValue, extraArguments) => {
      logger.log({
        event,
        payloads,
        retValue,
        extraArguments,
      });
      this.handleUpdate();
    });
  }
  getPerformance() {
    return this.performanceScope.getPerformance();
  }
  mountProfiler() {
    const slotMap = this.getSlots();
    const profilerSlotMap = Object.keys({ self: null, ...slotMap }).reduce((map, slotname) => {
      const isRoot = slotname === 'self';
      const slotImpl = (prev: React.ReactNode) => (
        <Profiler
          isActive
          id={isRoot ? 'Root' : slotname}
          isRoot={isRoot}
          scope={this.getPerformanceScope()}
        >
          {prev}
        </Profiler>
      );
      Object.assign(map, {
        [slotname]: slotImpl,
      });
      return map;
    }, {});
    this.foundation.defineSlot(profilerSlotMap);
  }
  subscribeUpdate(handler: () => void) {
    this.updateHandler.add(handler);
    return () => {
      this.updateHandler.delete(handler);
    };
  }
  private handleUpdate() {
    const { isActive = () => false } = getDataSwap();
    if (!isActive()) {
      return;
    }
    this.updateHandler.forEach(handler => {
      handler();
    });
  }
  private getPerformanceScope() {
    if (!this.performanceScope) {
      this.performanceScope = new PerformanceScope();
    }
    return this.performanceScope;
  }
  private getSlots() {
    const slotMap = Reflect.get(this.foundation, 'slotMap') || {};
    return slotMap;
  }
}