import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { SWAP_KEY, DataSwap, InspectorInstance } from '@shinda-sakana/prc-inspector-plugin';
import { Button, Collapse, Descriptions, List, Popover, Space, Tabs } from '@douyinfe/semi-ui';
import { BaseFoundation } from '@shinda-sakana/pluggable-react-component';
import { ObjectInspector } from 'react-inspector';
import { IconPlay, IconStop } from '@douyinfe/semi-icons';

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
    <Space vertical align={'start'} style={{ width: '100%' }}>
      <Button
        type={buttonType}
        icon={buttonIcon}
        onClick={() => setRecording(r => !r)}
      >
        {buttonTitle}
      </Button>
      <List
        style={{ width: '100%' }}
        dataSource={[...instance.logger.read()]}
        renderItem={item => (
          <List.Item
            header={<b>{item.event}</b>}
            main={(
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
            )}
          />
        )}
      />
    </Space>
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
      <Tabs contentStyle={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Tabs.TabPane tab={'Foundation'} itemKey={'foundation'}>
          <FoundationPane foundation={instance.foundation} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={'Events Trace'} itemKey={'events-trace'}>
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
  renderPopoverContent(anchor, data) {
    const { instance } = data;
    const root = rootMap.get(anchor) || ReactDOM.createRoot(anchor);
    rootMap.set(anchor, root);
    root.render(
      <Popover
        visible
        trigger={'custom'}
        motion={false}
        content={<PopoverContent instance={instance} />}
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