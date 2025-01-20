import React from 'react';
import { Extendable } from '@/index';
import { ComponentFoundation } from './foundation';
import { useState } from 'react';

export default Extendable(
  function useRender({ foundation, slot }) {
    const props = foundation.getProps();
    const states = foundation.getStates();
    const contexts = foundation.getContext();
    const buttonSlot = slot('button');
    return (
      <div>
        <b>Props: </b>
        <pre>{JSON.stringify(props, null, 2)}</pre>
        <b>States: </b>
        <pre>{JSON.stringify(states, null, 2)}</pre>
        <b>Contexts: </b>
        <pre>{JSON.stringify(contexts, null, 2)}</pre>
        <b>Foo Button</b>
        <div>
          <button onClick={() => foundation.click('foo')}>foo</button>
          {buttonSlot}
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
