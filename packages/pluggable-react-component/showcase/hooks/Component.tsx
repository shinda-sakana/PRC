import React from 'react';
import { Extendable, useFoundation, useSlot } from '@/index';
import { ComponentFoundation } from './foundation';
import { useState } from 'react';

function ChildComponent() {
  const foundation = useFoundation<ComponentFoundation>();
  const childSlot = useSlot<ComponentFoundation>('child');
  return (
    <>
      <button onClick={() => foundation.click()}>child button</button>
      {childSlot}
    </>
  );
};

export default Extendable(
  function useRender({ foundation }) {
    const props = foundation.getProps();
    const states = foundation.getStates();
    const contexts = foundation.getContext();
    return (
      <div>
        <b>Props: </b>
        <pre>{JSON.stringify(props, null, 2)}</pre>
        <b>States: </b>
        <pre>{JSON.stringify(states, null, 2)}</pre>
        <b>Contexts: </b>
        <pre>{JSON.stringify(contexts, null, 2)}</pre>
        <b>Child Component: </b>
        <div>
          <ChildComponent />
        </div>
      </div>
    );
  },
  ComponentFoundation,
  function useAdapter() {
    return {
      states: {
        foo: useState(0),
        bar: useState(false),
      },
      context: {},
    };
  }
);
