import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { BaseFoundation, Plugin } from '@shinda-sakana/pluggable-react-component';
import { InspectorInstance, removeGlobalInstance, setGlobalInstance } from './instance';
import { getDataSwap } from './swap';
import styles from './index.module.scss';

const classPrefix = 'prc-inspector-plugin';

export * from './const';

export interface RenderData {
  instance: InspectorInstance;
}

export type { InspectorInstance };
export type { DataSwap } from './swap';

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
  const {
    renderPopoverContent = () => null,
    destroyPopoverContent = () => null,
  } = getDataSwap();
  const { instance, targetRef } = props;
  const anchorRef = useRef<HTMLDivElement>();
  const [visible, setVisible] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);

  const reshapeAnchor = () => {
    const elem = ReactDOM.findDOMNode(targetRef.current);
    const { current: anchor } = anchorRef;
    if (!(elem instanceof Element) || !anchor) {
      return;
    }
    const { width, height, top, left } = elem.getBoundingClientRect();
    Object.assign(anchor.style, {
      position: 'absolute',
      width: `${width}px`,
      height: `${height}px`,
      top: `${top}px`,
      left: `${left}px`,
    });
  };

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

  const clickCover = () => {
    setPopoverVisible(true);
  };

  const anchorElem = anchorRef.current?.firstElementChild as HTMLElement;
  switch (true) {
    case !anchorElem: {
      break;
    }
    case popoverVisible: {
      renderPopoverContent(anchorElem, { instance }, () => setPopoverVisible(false));
      break;
    }
    default: {
      destroyPopoverContent(anchorElem);
    }
  }

  return ReactDOM.createPortal(
    <div
      ref={anchorRef}
      className={styles[`${classPrefix}-anchor`]}
      style={{ pointerEvents: visible ? 'all' : 'none' }}
    >
      <div></div>
      {visible && (
        <div
          ref={reshapeAnchor}
          className={styles[`${classPrefix}-cover`]}
          onClick={clickCover}
        />
      )}
    </div>,
    document.body
  );
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
