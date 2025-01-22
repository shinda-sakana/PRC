import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { BaseFoundation, Plugin } from '@shinda-sakana/pluggable-react-component';
import { INSTANCE_KEY } from './const';
import { InspectorInstance } from './instance';
import { getDataSwap } from './swap';

export * from './const';

export interface RenderData {
  instance: InspectorInstance;
}

export type { InspectorInstance };
export type { DataSwap } from './swap';

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
        const { isActive = () => false, sniffActive = () => null } = getDataSwap();
        const [active, setActive] = useState(isActive());
        useLayoutEffect(() => {
          sniffActive(setActive);
        }, []);
        if (!active) {
          return {};
        }
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
