import React from 'react';
import ReactDOM from 'react-dom/client';
import Component from './Component';
import { loadPlugin } from '@/index';

const root = ReactDOM.createRoot(document.getElementById('root'));

const PluginedComponent = loadPlugin(Component, [
  {
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
  }
]);

root.render(<PluginedComponent />);
