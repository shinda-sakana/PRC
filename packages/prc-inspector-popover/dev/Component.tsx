import React from 'react';
import { Extendable } from '@shinda-sakana/pluggable-react-component';
import { ComponentFoundation } from './foundation';
import { Button, Input } from '@douyinfe/semi-ui';

export default Extendable(
  function useRender({ foundation }) {
    return (
      <div style={{ width: '400px' }}>
        <Input onChange={foundation.input} />
        <Button onClick={() => foundation.click()}>Click</Button>
      </div>
    )
  },
  ComponentFoundation,
  function useAdapter() {
    return {
      states: {},
      context: {},
    };
  }
)
