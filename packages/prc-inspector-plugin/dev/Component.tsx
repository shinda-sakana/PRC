import React from 'react';
import { Extendable } from '@shinda-sakana/pluggable-react-component';
import { ComponentFoundation } from './foundation';

export default Extendable(
  function useRender() {
    return (
      <div>
        hello
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
