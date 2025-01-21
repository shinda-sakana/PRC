import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { BaseFoundation, Plugin } from '@shinda-sakana/pluggable-react-component';
import { PerformanceScope, Profiler } from './profiler';
import { EventLogger } from './eventLogger';
import { INSTANCE_KEY, SWAP_KEY } from './const';

export * from './const';

export interface RenderData {
  instance: InspectorInstance;
}

export type { InspectorInstance };

export interface DataSwap {
  renderPopoverContent(anchor: HTMLElement, data: RenderData): void;
  destroyPopoverContent(anchor?: HTMLElement): void;
}

function getDataSwap(): DataSwap {
  const swap = Reflect.get(window, SWAP_KEY) || {};
  return swap;
}

class InspectorInstance {
  private performanceScope: PerformanceScope;
  readonly logger: EventLogger;
  readonly foundation: BaseFoundation;
  constructor(f: BaseFoundation) {
    this.foundation = f;
    const logger = new EventLogger();
    this.logger = logger;
    f.listenAnyEvents((event, payloads, retValue) => {
      logger.log({
        event,
        payloads,
        retValue,
      });
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

function setGlobalInstance(instance: InspectorInstance) {
  const instances = Reflect.get(window, INSTANCE_KEY) || new Set();
  instances.add(instance);
  Reflect.set(window, INSTANCE_KEY, instances);
}

function removeGlobalInstance(instance: InspectorInstance) {
  const instances = Reflect.get(window, INSTANCE_KEY);
  if (!(instances instanceof Set)) {
    return;
  }
  instances.delete(instance);
  if (instances.size <= 0) {
    Reflect.set(window, INSTANCE_KEY, void 0);
  }
}

class TargetWrapper extends React.Component {
  props: React.PropsWithChildren;
  render(): React.ReactNode {
    return (
      <>
        {this.props.children}
      </>
    );
  }
}

function InspectorRender(props: {
  instance: InspectorInstance;
  targetRef: React.MutableRefObject<TargetWrapper>;
}) {
  const { instance, targetRef } = props;
  const coverRef = useRef<HTMLDivElement>();
  const [visible, setVisible] = useState(false);

  const renderInspector = () => {
    const {
      renderPopoverContent = () => null,
    } = getDataSwap();
    const elem = ReactDOM.findDOMNode(targetRef.current);
    const { current: cover } = coverRef;
    if (!(elem instanceof Element) || !cover) {
      return;
    }
    const { width, height, top, left } = elem.getBoundingClientRect();
    Object.assign(cover.style, {
      pointerEvents: 'none',
      position: 'absolute',
      width: `${width}px`,
      height: `${height}px`,
      top: `${top}px`,
      left: `${left}px`,
    });
    renderPopoverContent(cover, {
      instance,
    });
  };

  useEffect(() => {
    const {
      destroyPopoverContent = () => null,
    } = getDataSwap();
    if (visible) {
      renderInspector();
    } else {
      destroyPopoverContent();
    }
  }, [visible]);

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (['Control', 'Meta'].every(key => key !== e.key)) {
        return;
      }
      setVisible(true);
    };
    const keyupHandler = (e: KeyboardEvent) => {
      if (['Control', 'Meta'].every(key => key !== e.key)) {
        return;
      }
      setVisible(false);
    };
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);
    return () => {
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('keyup', keyupHandler);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return ReactDOM.createPortal(<div ref={coverRef}></div>, document.body);
}

export default function InspectorPlugin(): Plugin<BaseFoundation> {
  return function () {
    let instance: InspectorInstance;
    return {
      init(f) {
        instance = new InspectorInstance(f);
        setGlobalInstance(instance);
      },
      destroy() {
        removeGlobalInstance(instance);
      },
      usePreRender() {
        const ref = useRef();
        
        instance.mountProfiler();
        return {
          self: (prev) => (
            <>
              <TargetWrapper ref={ref}>
                {prev}
              </TargetWrapper>
              <InspectorRender targetRef={ref} instance={instance} />
            </>
          )
        };
      }
    };
  };
}
