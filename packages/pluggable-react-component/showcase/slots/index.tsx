import React from 'react';
import ReactDOM from 'react-dom/client';
import Component from './Component';
import { loadPlugin } from '@/index';
import { ComponentFoundation } from './foundation';

const root = ReactDOM.createRoot(document.getElementById('root'));

const PluginedComponent = loadPlugin(Component, [
  { // Plugin 1
    usePropsHandler(props) {
      console.log(props);
      return {
        additionProps: true,
      };
    },
    usePreRender(f) {
      f.setContext('additionContext', true);
    },
    init(f) {
      console.log('init', f);
    },
    destroy(f) {
      console.log('destroy', f);
    },
  },
  { // Plugin 2
    usePreRender() {
      return {
        slot: () => (
          <div>This is slot element</div>
        )
      };
    }
  },
  { // Plugin 3
    usePreRender(f: ComponentFoundation) {
      return {
        slot: (prev, ctx, origin) => (
          <ul>
            <li>
              <b>origin: </b>
              {origin}
            </li>
            <li>
              <b>prev: </b>
              {prev}
            </li>
            <li>
              <b>ctx: </b>
              <pre>{JSON.stringify(ctx, null, 2)}</pre>
            </li>
            <li>
              <b>call foundation clickButton: </b>
              <button onClick={() => f.clickButton()}>click</button>
            </li>
          </ul>
        )
      }
    }
  }
]);

root.render(<PluginedComponent />);
