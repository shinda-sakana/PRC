import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { SWAP_KEY, DataSwap, InspectorInstance } from '@shinda-sakana/prc-inspector-plugin';
import { Button, Collapse, Descriptions, List, Popover, Space, Tabs } from '@douyinfe/semi-ui';
import { BaseFoundation } from '@shinda-sakana/pluggable-react-component';
import { ObjectInspector } from 'react-inspector';
import { IconClose, IconPlay, IconStop } from '@douyinfe/semi-icons';
import styles from './index.module.scss';

const classPrefix = 'prc-inspector-popover';

function FoundationPane(props: {
  foundation: BaseFoundation;
}) {
  const { foundation } = props;

  return (
    <Collapse defaultActiveKey={['props', 'states', 'context']}>
      <Collapse.Panel header={'Props'} itemKey={'props'}>
        <ObjectInspector
          data={foundation.getProps()}
        />
      </Collapse.Panel>
      <Collapse.Panel header={'States'} itemKey={'states'}>
        <ObjectInspector
          data={foundation.getStates()}
        />
      </Collapse.Panel>
      <Collapse.Panel header={'Context'} itemKey={'context'}>
        <ObjectInspector
          data={foundation.getContext()}
        />
      </Collapse.Panel>
    </Collapse>
  );
}

interface EventEntity {
  event: string;
  payloads: unknown[];
  retValue: unknown;
}

function EventsDisplayItem(props: {
  item: EventEntity;
}) {
  const { item } = props;
  const initedRef = useRef(false);
  const mainInit = (mainElem: HTMLDivElement) => {
    if (!mainElem || initedRef.current) {
      return null;
    }
    initedRef.current = true;
    mainElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  };
  return (
    <List.Item
      className={styles[`${classPrefix}-display-item`]}
      header={<b>{item.event}</b>}
      main={(
        <div ref={mainInit}>
          <Descriptions
            data={[
              ...Array.from(item.payloads, (payload, index) => ({
                key: `Payload ${index}`,
                value: <ObjectInspector data={payload} />
              })),
              {
                key: 'Return',
                value: <ObjectInspector data={item.retValue} />
              }
            ]}
          />
        </div>
      )}
    />
  );
}

function EventsTracePane(props: {
  instance: InspectorInstance;
}) {
  const { instance } = props;
  const [recording, setRecording] = useState(false);
  if (recording) {
    instance.logger.activate();
  } else {
    instance.logger.disable();
  }
  const buttonTitle = recording ? 'Stop' : 'Record';
  const buttonIcon = recording ? (
    <IconStop />
  ) : (
    <IconPlay />
  );
  const buttonType = recording ? 'danger' : 'primary';

  return (
    <>
      <div className={styles[`${classPrefix}-eventTrace-controller`]}>
        <Button
          type={buttonType}
          icon={buttonIcon}
          onClick={() => setRecording(r => !r)}
        >
          {buttonTitle}
        </Button>
      </div>
      <List
        style={{ width: '100%' }}
        dataSource={[...instance.logger.read()]}
        renderItem={item => <EventsDisplayItem item={item} />}
      />
    </>
  )
}

function PopoverContent(props: {
  instance: InspectorInstance;
}) {
  const { instance } = props;
  const [, forceUpdater] = useState(0);
  const forceUpdate = () => forceUpdater(i => i + 1);
  useEffect(() => {
    const desubscribe = instance.subscribeUpdate(() => {
      forceUpdate();
    });
    return () => {
      desubscribe();
    };
  }, []);
  return (
    <div style={{ padding: '12px', width: '600px' }}>
      <Tabs>
        <Tabs.TabPane className={styles[`${classPrefix}-tabpane`]} tab={'Foundation'} itemKey={'foundation'}>
          <FoundationPane foundation={instance.foundation} />
        </Tabs.TabPane>
        <Tabs.TabPane className={styles[`${classPrefix}-tabpane`]} tab={'Events Trace'} itemKey={'events-trace'}>
          <EventsTracePane instance={instance} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

const rootMap = new Map<HTMLElement, ReactDOM.Root>();
let isActive = true;
const activeSniffers = new Set<(isActive: boolean) => void>();

const swap: DataSwap = {
  isActive() {
    return isActive;
  },
  sniffActive(handler) {
    activeSniffers.add(handler);
    return function () {
      activeSniffers.delete(handler);
    };
  },
  renderPopoverContent(anchor, data, onClose = () => null) {
    const { instance, name = '[Anoymous Component]' } = data;
    const root = rootMap.get(anchor) || ReactDOM.createRoot(anchor);
    rootMap.set(anchor, root);
    const content = (
      <Space align={'end'} vertical>
        <div className={styles[`${classPrefix}-header`]}>
          <b>{name}</b>
            <Button icon={<IconClose />} onClick={() => onClose()} theme={'borderless'} type={'tertiary'} />
        </div>
        <PopoverContent instance={instance} />
      </Space>
    );
    root.render(
      <Popover
        visible
        onEscKeyDown={() => onClose()}
        trigger={'custom'}
        motion={false}
        content={content}
        position={'leftBottom'}
      >
        <div style={{ width: '100%', height: '100%' }}></div>
      </Popover>
    );
  },
  destroyPopoverContent(elem) {
    if (elem) {
      const root = rootMap.get(elem);
      root?.unmount();
      rootMap.delete(elem);
      return;
    }
    rootMap.entries().forEach(([, root]) => {
      root?.unmount();
    });
    rootMap.clear();
  }
};

Reflect.set(window, SWAP_KEY, swap);