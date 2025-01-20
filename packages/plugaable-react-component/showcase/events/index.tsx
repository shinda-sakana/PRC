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
    usePreRender(f: ComponentFoundation) {
      return {
        button: () => (
          <button onClick={() => f.click('bar')}>bar</button>
        )
      };
    }
  },
  { // Plugin 3
    init(f: ComponentFoundation) {
      f.listen('click', id => {
        console.log('listen click', id);
      });
    }
  }
]);

root.render(<PluginedComponent />);
